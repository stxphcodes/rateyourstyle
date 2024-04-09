package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
)

type Handler struct {
	Gcs struct {
		Client *gcs.Client
		Bucket *gcs.BucketHandle
	}

	UserIndices         *UserIndices
	OutfitIndices       *OutfitIndices
	RatingIndices       *RatingIndices
	BusinessIndices     *BusinessIndices
	NotificationIndices *NotificationIndices
}

func (h Handler) GetBusinessUsernames() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		businesses := []string{}

		for id := range h.BusinessIndices.Businesses {
			username, ok := h.UserIndices.IdUsername[id]
			if ok {
				businesses = append(businesses, username)
			}
		}

		return ctx.JSON(http.StatusOK, businesses)
	}
}

func (h Handler) GetBusinessOutfits() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		businessId := ""
		businessRequested := ctx.QueryParam("business")
		if businessRequested != "" {
			for id, username := range h.UserIndices.IdUsername {
				if username == businessRequested {
					businessId = id
				}
			}
		} else {
			cookie, err := getCookie(ctx.Request())
			if err != nil {
				log.Println("error retrieving cookie")
				return ctx.NoContent(http.StatusForbidden)
			}

			userId, ok := h.UserIndices.CookieId[cookie]
			if !ok {
				log.Println("user id not found for cookie " + cookie)
				return ctx.NoContent(http.StatusForbidden)
			}

			businessId = userId
		}

		_, ok := h.BusinessIndices.Businesses[businessId]
		if !ok {
			log.Println("user id not business profile " + businessId)
			return ctx.NoContent(http.StatusFailedDependency)
		}

		outfits, err := getBusinessOutfits(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, businessId)
		if err != nil {
			// object doesn't exist
			if !strings.Contains(err.Error(), "exist") {
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}

			return ctx.JSON(http.StatusOK, outfits)
		}

		return ctx.JSON(http.StatusOK, outfits)
	}
}

func (h Handler) GetBusinessProfile() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		businessId := ""
		businessRequested := ctx.QueryParam("business")
		if businessRequested != "" {
			for id, username := range h.UserIndices.IdUsername {
				if username == businessRequested {
					businessId = id
				}
			}
		} else {
			cookie, err := getCookie(ctx.Request())
			if err != nil {
				log.Println("error retrieving cookie")
				return ctx.NoContent(http.StatusForbidden)
			}

			userId, ok := h.UserIndices.CookieId[cookie]
			if !ok {
				log.Println("user id not found for cookie " + cookie)
				return ctx.NoContent(http.StatusForbidden)
			}

			businessId = userId
		}

		business, ok := h.BusinessIndices.Businesses[businessId]
		if !ok {
			log.Println("user id not business profile " + businessId)
			return ctx.NoContent(http.StatusFailedDependency)
		}

		return ctx.JSON(http.StatusOK, business)
	}
}

func (h Handler) GetCookie() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		user := User{
			Id:     uuid(),
			Cookie: uuid(),
		}

		// read original file
		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// write new user to original file
		obj := h.Gcs.Bucket.Object("data/users/users.json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		users = append(users, user)
		if err := json.NewEncoder(writer).Encode(users); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices
		h.UserIndices.CookieId[user.Cookie] = user.Id
		h.UserIndices.IdCookie[user.Id] = user.Cookie

		// return user cookie in response
		return ctx.String(http.StatusCreated, createCookieStr(user.Cookie))
	}
}

func (h Handler) GetOutfit() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		outfitId := ctx.Param("outfitid")
		if outfitId == "" {
			log.Println("outfit id missing")
			return ctx.NoContent(http.StatusBadRequest)
		}

		outfit, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfitId)
		if err != nil {
			log.Println("error getting outfit ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.JSON(http.StatusOK, outfit)
	}
}

// only gets public outfits.
// if count query param is passed and greater than 0,
// GetOutfits will return up to that number of outfits.
func (h Handler) GetOutfits() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		countStr := ctx.QueryParam("count")
		count := len(h.OutfitIndices.PublicOutfits)
		if countStr != "" {
			countInt, err := strconv.Atoi(countStr)
			// make sure there's enough outfits to fulfill the count count query param
			if count > countInt && err == nil {
				count = countInt
			}
		}

		var outfits []*OutfitResponse
		if count == 0 {
			return ctx.JSON(http.StatusOK, outfits)
		}

		errc := make(chan error, 1)
		outfitsc := make(chan *OutfitResponse)
		for outfit := range h.OutfitIndices.PublicOutfits {
			go func(outfit string) {
				o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfit)
				if err != nil {
					errc <- err
				}

				outfitsc <- o
			}(outfit)
		}

		for {
			select {
			case err := <-errc:
				log.Println("Error with outfit, ", err.Error())
				return ctx.NoContent(
					http.StatusInternalServerError,
				)
			case o := <-outfitsc:
				outfits = append(outfits, o)
				if len(outfits) == count {
					return ctx.JSON(http.StatusOK, outfits)
				}
			}
		}
	}
}

// get only public outfits from user
func (h Handler) GetPublicOutfitsByUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		username := ctx.QueryParam("username")
		if username == "" {
			return ctx.String(http.StatusBadRequest, "missing username query")
		}

		userId := ""
		for id, user := range h.UserIndices.IdUsername {
			if user == username {
				userId = id
			}
		}

		if userId == "" {
			ctx.String(http.StatusBadRequest, username+" has no id")
		}

		outfitIds, ok := h.OutfitIndices.UserOutfit[userId]
		if !ok {
			log.Println("outfitids not found for user id " + userId)
			return ctx.NoContent(http.StatusNotFound)
		}

		var outfits []*OutfitResponse
		errc := make(chan error, 1)
		done := make(chan struct{})
		for _, outfit := range outfitIds {
			go func(outfit string) {
				o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfit)
				if err != nil {
					errc <- err
					return
				}

				// return public outfits
				if !o.Private {
					outfits = append(outfits, o)
				}

				done <- struct{}{}
			}(outfit)
		}

		doneCount := 0
		for {
			select {
			case err := <-errc:
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			case <-done:
				doneCount = doneCount + 1
				if doneCount == len(outfitIds) {
					return ctx.JSON(http.StatusOK, outfits)
				}
			}
		}
	}
}

// getoutfitsbyuser will get private and public outfits for user
func (h Handler) GetOutfitsByUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found for cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)

		}

		outfitIds, ok := h.OutfitIndices.UserOutfit[userId]
		if !ok {
			log.Println("outfitids not found for user id " + userId)
			return ctx.NoContent(http.StatusNotFound)
		}

		errc := make(chan error, 1)
		outfitsc := make(chan *OutfitResponse)

		for _, outfit := range outfitIds {
			go func(outfit string) {
				o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfit)
				if err != nil {
					errc <- err
					return
				}

				outfitsc <- o

			}(outfit)
		}

		var outfits []*OutfitResponse
		for {
			select {
			case err := <-errc:
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			case o := <-outfitsc:
				outfits = append(outfits, o)
				if len(outfits) == len(outfitIds) {
					return ctx.JSON(http.StatusOK, outfits)
				}
			}

		}
	}
}

func (h Handler) GetRatingsByOutfit() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		outfitId := ctx.Param("outfitid")
		if outfitId == "" {
			log.Println("outfit id missing")
			return ctx.NoContent(http.StatusBadRequest)
		}

		ratings, err := getRatingsByOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, "data/ratings/"+outfitId+".json")
		if err != nil {
			log.Println("error getting ratings for outfit " + outfitId)
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for _, rating := range ratings {
			username, ok := h.UserIndices.IdUsername[rating.UserId]
			if ok {
				rating.Username = username
			}
		}
		return ctx.JSON(http.StatusOK, ratings)
	}
}

func (h *Handler) GetRatingsByUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		ratings := []interface{}{}
		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("in GetRatingsByUser, user id not found with cookie ", cookie)
			return ctx.JSON(http.StatusOK, ratings)
		}

		outfitRatings, ok := h.RatingIndices.UserOutfitRating[userId]
		if !ok {
			return ctx.NoContent(http.StatusNoContent)
		}

		for _, rating := range outfitRatings {
			ratings = append(ratings, rating)
		}
		return ctx.JSON(http.StatusOK, ratings)

	}
}

func (h *Handler) GetUsernameAndNotifications() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		username, ok := h.UserIndices.CookieUsername[cookie]
		if !ok {
			return ctx.NoContent(http.StatusNotFound)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			return ctx.NoContent(http.StatusNotFound)
		}

		resp := UserNotifResponse{
			Username:         username,
			HasNotifications: false,
		}

		hasNotifications, ok := h.NotificationIndices.UserHasNotifications[userId]
		if ok && hasNotifications {
			resp.HasNotifications = true
		}

		return ctx.JSON(http.StatusOK, resp)
	}
}

func (h *Handler) GetNotifications() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			return ctx.NoContent(http.StatusNotFound)
		}

		notifications, err := getNotifications(ctx.Request().Context(), h.Gcs.Bucket, joinPaths(notificationsDir, userId))
		if err != nil {
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// only update notification seen if it wasn't seen before
		needsUpdate, ok := h.NotificationIndices.UserHasNotifications[userId]
		if ok && needsUpdate {
			// update notifications to be seen
			for index, notification := range notifications {
				if !notification.Seen {
					notifications[index].Seen = true
					notifications[index].SeenAt = time.Now().Format("2006-01-02")
				}
			}

			obj := h.Gcs.Bucket.Object(joinPaths(notificationsDir, userId))
			writer := obj.NewWriter(ctx.Request().Context())
			defer writer.Close()

			if err := json.NewEncoder(writer).Encode(notifications); err != nil {
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}

			// update indices
			h.NotificationIndices.UserHasNotifications[userId] = false
		}

		sort.Slice(notifications, func(i, j int) bool {
			return notifications[i].Date > notifications[j].Date
		})

		return ctx.JSON(http.StatusOK, notifications)
	}
}

func (h *Handler) GetUsername() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		username, ok := h.UserIndices.CookieUsername[cookie]
		if !ok {
			return ctx.NoContent(http.StatusNotFound)
		}

		return ctx.String(http.StatusOK, username)
	}
}

func (h *Handler) GetUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			return ctx.NoContent(http.StatusBadRequest)
		}

		user, err := getUser(ctx.Request().Context(), h.Gcs.Bucket, userId)
		if err != nil {
			return ctx.NoContent(http.StatusInternalServerError)
		}

		uf, err := getUserFile(ctx.Request().Context(), h.Gcs.Bucket, user)
		if err != nil {
			return ctx.NoContent(http.StatusInternalServerError)
		}

		resp := UserResponse{
			Username:    uf.User.Username,
			Email:       uf.User.Email,
			UserProfile: getRecentUserProfile(uf.UserProfiles),
			UserGeneral: uf.UserGeneral,
		}

		return ctx.JSON(http.StatusOK, resp)
	}
}

func (h *Handler) GetUserByUsername() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		username := strings.ToLower(ctx.Param("username"))
		if username == "" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		for _, user := range users {
			if strings.ToLower(user.Username) == username {
				p, err := getUserFile(ctx.Request().Context(), h.Gcs.Bucket, &user)
				if err != nil {
					return ctx.NoContent(http.StatusInternalServerError)
				}

				resp := UserResponse{
					Username:    p.User.Username,
					Email:       p.User.Email,
					UserProfile: getRecentUserProfile(p.UserProfiles),
					UserGeneral: p.UserGeneral,
				}

				return ctx.JSON(http.StatusOK, resp)
			}
		}

		return ctx.String(http.StatusNotFound, "no user found with username "+username)
	}
}

func (h Handler) PostClosetRequest() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var userId string
		var ok bool

		cookie, err := getCookie(ctx.Request())
		if err != nil {
			userId = "anonymous"
		} else {
			// cookie was sent
			userId, ok = h.UserIndices.CookieId[cookie]
			if !ok {
				log.Println("user id not found based on cookie " + cookie)
				return ctx.NoContent(http.StatusForbidden)
			}
		}

		var data map[string]interface{}
		if err := ctx.Bind(&data); err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		current_time := time.Now()
		now := fmt.Sprintf("%d-%02d-%02dT%02d-%02d-%02d",
			current_time.Year(), current_time.Month(), current_time.Day(),
			current_time.Hour(), current_time.Minute(), current_time.Second())

		data["user_id"] = userId
		data["date_created"] = now

		obj := h.Gcs.Bucket.Object("data/requests/" + now + ".json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h Handler) PostSignIn() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var u User
		if err := ctx.Bind(&u); err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for _, user := range users {
			if strings.EqualFold(user.Username, u.Username) {
				ok := user.Password == u.Password
				if !ok {
					return ctx.String(http.StatusForbidden, "wrong password")
				} else {
					return ctx.String(http.StatusOK, createCookieStr(user.Cookie))
				}
			}
		}

		return ctx.String(http.StatusForbidden, "username not found")
	}
}

func (h Handler) PostImage() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		file, err := ctx.FormFile("file")
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpeg" && ext != ".jpg" && ext != ".png" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		filename := uuid()
		fullpath := filepath.Join("imgs", "outfits", userId, filename+ext)
		resizedPath := filepath.Join("imgs", "outfits", userId, filename+"-w600"+ext)

		if err := createImage(ctx.Request().Context(), h.Gcs.Bucket, file, fullpath); err != nil {
			log.Println("error creating img ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if err := createResizeImage(ctx.Request().Context(), h.Gcs.Bucket, fullpath, resizedPath); err != nil {
			log.Println("error creating resized img ", err.Error())
		}

		attr, err := h.Gcs.Bucket.Attrs(ctx.Request().Context())
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		url := "https://storage.googleapis.com/" + attr.Name + "/" + fullpath
		return ctx.String(http.StatusCreated, url)
	}
}

func (h Handler) PostOutfit() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data Outfit
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		// get id from request. id is the same as image id
		if data.Id == "" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		data.UserId = userId
		data.Date = time.Now().Format("2006-01-02")

		itemIds, err := createItemsFromOutfit(ctx.Request().Context(), h.Gcs.Bucket, &data)
		if err != nil {
			log.Println("error creating items ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		data.ItemIds = itemIds
		data.Items = nil

		path := filepath.Join("data", "outfits", data.Id+".json")
		obj := h.Gcs.Bucket.Object(path)

		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer.Close()

		// update indices
		h.OutfitIndices.OutfitUser[data.Id] = data.UserId
		h.OutfitIndices.UserOutfit[userId] = append(h.OutfitIndices.UserOutfit[userId], data.Id)
		if !data.Private {
			h.OutfitIndices.PublicOutfits[data.Id] = struct{}{}
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostRating() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data Rating
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}
		data.UserId = userId
		data.Date = time.Now().Format("2006-01-02")
		fromUsername, ok := h.UserIndices.IdUsername[userId]
		if !ok {
			fromUsername = "anonymous"
		}
		data.Username = fromUsername

		userRatedBefore, err := createRating(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, &data)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		n, err := ratingToNotification(&data, ctx.Request().Context(), h.Gcs.Bucket, h.UserIndices.IdUsername)
		if err != nil {
			log.Println("error transforming rating to notification " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if err := createNotification(ctx.Request().Context(), h.Gcs.Bucket, n); err != nil {
			log.Println("error creating notification " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices
		if !userRatedBefore {
			m := make(map[string]interface{})
			m[data.OutfitId] = data

			h.RatingIndices.UserOutfitRating[data.UserId] = m
		} else {
			h.RatingIndices.UserOutfitRating[data.UserId][data.OutfitId] = data
		}

		h.NotificationIndices.UserHasNotifications[n.ForUserId] = true

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) GetReplies() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		outfitId := ctx.Param("outfitid")
		if outfitId == "" {
			log.Println("outfit id missing")
			return ctx.NoContent(http.StatusBadRequest)
		}

		userId := ctx.Param("userid")
		if userId == "" {
			log.Println("user id missing")
			return ctx.NoContent(http.StatusBadRequest)
		}

		path := "data/replies/" + outfitId + "/" + userId + ".json"
		replies, err := getReplies(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, path)
		if err != nil {
			log.Println("error getting replies " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.JSON(http.StatusOK, replies.Replies)
	}
}

func (h *Handler) PostReply() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		username, ok := h.UserIndices.IdUsername[userId]
		if !ok {
			log.Println("username not found based on id " + userId)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data *ReplyItem
		if err := ctx.Bind(&data); err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}
		if data.Reply == "" {
			return ctx.NoContent(http.StatusNoContent)
		}

		data.UserId = userId
		data.Id = uuid()
		data.Date = time.Now().Format("2006-01-02") + "T" + time.Now().Format("15:04:05")
		data.Username = username

		replies, err := createReply(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, data)
		if err != nil {
			log.Println("Error creating reply: ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update reply count
		err = updateRatingReplyCount(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, data.RatingOutfitId, data.RatingUserId, len(replies.Replies))
		if err != nil {
			log.Println("Error updating count: ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// create notification
		notifs, err := repliesToNotifications(ctx.Request().Context(), h.Gcs.Bucket, h.UserIndices.IdUsername, replies, data)
		if err != nil {
			log.Println("Error generating notification: ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for _, n := range notifs {
			if err := createNotification(ctx.Request().Context(), h.Gcs.Bucket, n); err != nil {
				log.Println("error creating notification " + err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}

			// update notification index
			h.NotificationIndices.UserHasNotifications[n.ForUserId] = true
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var data User
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		// uniqueness checks
		_, ok := h.UserIndices.Usernames[data.Username]
		if ok {
			return ctx.String(http.StatusBadRequest, "username taken")
		}

		// assign cookie and id to user
		data.Cookie = uuid()
		data.Id = uuid()

		// read original file
		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		users = append(users, data)

		// update user in  original file
		obj := h.Gcs.Bucket.Object("data/users/users.json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(users); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices that need updating
		h.UserIndices.Emails[data.Email] = struct{}{}
		h.UserIndices.Usernames[data.Username] = struct{}{}
		h.UserIndices.CookieUsername[data.Cookie] = data.Username
		h.UserIndices.IdUsername[data.Id] = data.Username
		h.UserIndices.CookieId[data.Cookie] = data.Id
		h.UserIndices.IdCookie[data.Id] = data.Cookie

		// create blank user profile file
		userProfile := UserFile{
			User: &data,
			UserProfiles: []*UserProfile{
				{
					Date:        time.Now().Format("2006-01-02"),
					Department:  "",
					AgeRange:    "",
					WeightRange: "",
					HeightRange: "",
				},
			},
			UserGeneral: &UserGeneral{
				Aesthetics:  []string{""},
				Country:     "",
				Description: "",
				Links:       []string{""},
				Date:        "",
			},
		}

		if err := createUserFile(ctx.Request().Context(), h.Gcs.Bucket, &userProfile); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// return user cookie in response
		return ctx.String(http.StatusCreated, createCookieStr(data.Cookie))
	}
}

func (h *Handler) PostBusinessOutfit() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		businessId := ""
		businessRequested := ctx.QueryParam("business")
		if businessRequested != "" {
			for id, username := range h.UserIndices.IdUsername {
				if username == businessRequested {
					businessId = id
				}
			}
		}

		if businessId == "" {
			ctx.String(http.StatusBadRequest, businessRequested+" has no id")
		}

		var request []BusinessOutfitRequest
		if err := ctx.Bind(&request); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		for _, data := range request {
			businessOutfit := &BusinessOutfit{
				BusinessId:  businessId,
				UserId:      userId,
				OutfitId:    data.OutfitId,
				ItemIds:     data.ItemIds,
				Approved:    true,
				DateCreated: time.Now().Format("2006-01-02"),
			}

			if err := createBusinessOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, businessOutfit); err != nil {
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostNotificationsSeen() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data []string
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		n, err := getNotifications(ctx.Request().Context(), h.Gcs.Bucket, joinPaths(notificationsDir, userId))
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for index, notification := range n {
			if !notification.Seen {
				n[index].Seen = true
				n[index].SeenAt = time.Now().Format("2006-01-02")
			}
		}

		obj := h.Gcs.Bucket.Object(joinPaths(notificationsDir, userId))
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(n); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices
		h.NotificationIndices.UserHasNotifications[userId] = false

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostBusinessProfile() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data BusinessProfile
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}
		data.DateCreated = time.Now().Format("2006-01-02")
		data.UserId = userId

		if err := createBusinessProfile(ctx.Request().Context(), h.Gcs.Bucket, &data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indexes
		h.BusinessIndices.Businesses[data.UserId] = &data

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostUserProfile() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		user, err := getUser(ctx.Request().Context(), h.Gcs.Bucket, userId)
		if err != nil {
			log.Println("user not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		f, err := getUserFile(ctx.Request().Context(), h.Gcs.Bucket, user)
		if err != nil {
			log.Println("error getting user profile + " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		var data UserProfile
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}
		data.Date = time.Now().Format("2006-01-02")

		f.User = user
		f.UserProfiles = append(f.UserProfiles, &data)

		if err := createUserFile(ctx.Request().Context(), h.Gcs.Bucket, f); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostUserGeneral() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		user, err := getUser(ctx.Request().Context(), h.Gcs.Bucket, userId)
		if err != nil {
			log.Println("user not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		f, err := getUserFile(ctx.Request().Context(), h.Gcs.Bucket, user)
		if err != nil {
			log.Println("error getting user profile + " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		var data UserGeneral
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}
		data.Date = time.Now().Format("2006-01-02")

		f.User = user
		f.UserGeneral = &data

		if err := createUserFile(ctx.Request().Context(), h.Gcs.Bucket, f); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h Handler) PutOutfitItem() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data OutfitItem
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		// lowercase color
		data.Color = strings.ToLower(data.Color)

		// person trying to edit outfit item is not
		// the original outfit item creator
		if data.UserId != userId {
			return ctx.NoContent(http.StatusForbidden)
		}

		path := filepath.Join("data", "outfit-items", data.Id+".json")
		obj := h.Gcs.Bucket.Object(path)

		_, err = obj.Attrs(ctx.Request().Context())
		if err != nil {
			if strings.Contains(err.Error(), "exist") {
				// can only edit item that exists.
				return ctx.NoContent(http.StatusConflict)
			}

			// not sure what the error is
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer.Close()

		return ctx.NoContent(http.StatusCreated)
	}
}
