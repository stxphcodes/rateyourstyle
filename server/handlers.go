package main

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"cloud.google.com/go/storage"
	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
)

type Handler struct {
	Gcs struct {
		Client *gcs.Client
		Bucket *gcs.BucketHandle
	}

	UserIndices   *UserIndices
	OutfitIndices *OutfitIndices
	RatingIndices *RatingIndices
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

// only gets public outfits.
// if count query param is passed and greater than 0,
// GetOutfits will return up to that number of outfits.
func (h Handler) GetOutfits() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		countStr := ctx.QueryParam("count")
		count := len(h.OutfitIndices.PublicOutfits)
		if countStr != "" {
			countInt, err := strconv.Atoi(countStr)
			if err == nil {
				count = countInt
			}
		}

		errc := make(chan error, 1)
		outfitsc := make(chan *Outfit)
		for outfit := range h.OutfitIndices.PublicOutfits {
			go func(outfit string) {
				o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfit)
				if err != nil {
					errc <- err
				}

				outfitsc <- o
			}(outfit)
		}

		var outfits []*Outfit
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

		// var wg sync.WaitGroup
		// wg.Add(count)
		// index := 0
		// for outfit := range h.OutfitIndices.PublicOutfits {
		// 	if index == count {
		// 		break
		// 	}

		// 	go func(outfit string, index int) {
		// 		o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, h.UserIndices.IdUsername, outfit)
		// 		if err != nil {
		// 			// log.Println("error: " + err.Error())
		// 			// return ctx.NoContent(
		// 			// 	http.StatusInternalServerError,
		// 			// )
		// 		}

		// 		// get user profile of outfit poster
		// 		u := &User{Id: o.UserId}
		// 		upf, err := getUserProfileFile(ctx.Request().Context(), h.Gcs.Bucket, u)
		// 		if err == nil {
		// 			o.UserProfile = getRecentUserProfile(upf.UserProfiles)

		// 		}

		// 		outfits = append(outfits, o)
		// 		index++
		// 		wg.Done()
		// 	}(outfit, index)
		// 	index = index + 1
		// }
		// wg.Wait()

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

		var outfits []*Outfit
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
		outfitsc := make(chan *Outfit)

		// var outfits []*Outfit
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

		var outfits []*Outfit
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

func (h Handler) GetRatings() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		arr := []interface{}{}

		for _, rating := range h.RatingIndices.AllRatings {
			cookie, ok := h.UserIndices.IdCookie[rating.UserId]
			if !ok {
				continue
			}

			arr = append(arr, map[string]interface{}{
				"cookie":    cookie,
				"user_id":   rating.UserId,
				"rating":    rating.Rating,
				"outfit_id": rating.OutfitId,
			},
			)
		}
		return ctx.JSON(http.StatusOK, arr)
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

func (h *Handler) GetUserProfile() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			return ctx.NoContent(http.StatusBadRequest)
		}

		for _, user := range users {
			if user.Cookie == cookie {
				p, err := getUserProfileFile(ctx.Request().Context(), h.Gcs.Bucket, &user)
				if err != nil {
					return ctx.NoContent(http.StatusInternalServerError)
				}

				resp := UserProfileResponse{
					Username:    p.User.Username,
					Email:       p.User.Email,
					UserProfile: getRecentUserProfile(p.UserProfiles),
				}

				return ctx.JSON(http.StatusOK, resp)
			}
		}

		return ctx.String(http.StatusNotFound, "no user found with cookie "+cookie)
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

		src, err := file.Open()
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		defer src.Close()

		filename := filepath.Join("imgs", "outfits", userId, uuid()+ext)

		obj := h.Gcs.Bucket.Object(filename)
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		_, err = io.Copy(writer, src)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		writer.Close()

		// make image public
		if err := obj.ACL().Set(ctx.Request().Context(), storage.AllUsers, storage.RoleReader); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		attr, err := h.Gcs.Bucket.Attrs(ctx.Request().Context())
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		path := "https://storage.googleapis.com/" + attr.Name + "/" + filename
		return ctx.String(http.StatusCreated, path)
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
		h.OutfitIndices.Outfits[data.Id] = struct{}{}
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

		// read original file
		ratings, err := getRatingsByOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, "data/ratings/"+data.OutfitId+".json")
		if err != nil {
			// object doesn't exist
			if !strings.Contains(err.Error(), "exist") {
				log.Println(err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}
		}

		found := false
		for _, rating := range ratings {
			if rating.UserId == data.UserId {
				rating.Rating = data.Rating
				found = true
				break
			}
		}

		if !found {
			ratings = append(ratings, data)
		}

		obj := h.Gcs.Bucket.Object(filepath.Join("data", "ratings", data.OutfitId+".json"))
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(ratings); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer.Close()

		// update indices
		if !found {
			h.RatingIndices.AllRatings = append(h.RatingIndices.AllRatings, &data)
		} else {
			for index, r := range h.RatingIndices.AllRatings {
				if r.OutfitId == data.OutfitId && r.UserId == data.UserId {
					h.RatingIndices.AllRatings[index].Rating = data.Rating
				}
			}
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
		_, ok := h.UserIndices.Emails[data.Email]
		if ok {
			return ctx.String(http.StatusBadRequest, "email taken")
		}

		_, ok = h.UserIndices.Usernames[data.Username]
		if ok {
			return ctx.String(http.StatusBadRequest, "username taken")
		}

		// read original file
		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update user in  original file
		obj := h.Gcs.Bucket.Object("data/users/users.json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		found := false
		for i, u := range users {
			if u.Cookie == data.Cookie {
				// update fields for user
				users[i].Email = data.Email
				users[i].Password = data.Password
				users[i].Username = data.Username

				// get user id from files
				data.Id = u.Id
				found = true
			}
		}

		if !found {
			// cookie wasn't found in users file for some reason.
			// create a new id to associate with the cookie.
			// this scenario shouldn't be the case.
			log.Println("in post user, cookie not found in users file")
			data.Id = uuid()
			users = append(users, data)
		}

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
		userProfile := UserProfileFile{
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
		}

		if err := createUserProfileFile(ctx.Request().Context(), h.Gcs.Bucket, &userProfile); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// return user cookie in response
		return ctx.String(http.StatusCreated, createCookieStr(data.Cookie))
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

		f, err := getUserProfileFile(ctx.Request().Context(), h.Gcs.Bucket, user)
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

		if err := createUserProfileFile(ctx.Request().Context(), h.Gcs.Bucket, f); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		return ctx.NoContent(http.StatusCreated)
	}
}
