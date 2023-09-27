package main

import (
	"encoding/json"
	"io"
	"log"
	"math/rand"
	"net/http"
	"path/filepath"
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

// only gets public outfits
func (h Handler) GetOutfits() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var outfits []*Outfit
		for outfit := range h.OutfitIndices.PublicOutfits {
			o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, outfit)
			if err != nil {
				log.Println("error: " + err.Error())
				return ctx.NoContent(
					http.StatusInternalServerError,
				)
			}

			username, ok := h.UserIndices.IdUsername[o.UserId]
			if ok {
				o.UserId = username
			}

			outfits = append(outfits, o)
		}

		return ctx.JSON(http.StatusOK, outfits)
	}
}

func (h Handler) GetRatings() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		return ctx.JSON(http.StatusOK, h.RatingIndices.AllRatings)
	}
}

func (h Handler) GetOutfitsByUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			if err != nil {
				log.Println("user id not found for cookie " + cookie)
				return ctx.NoContent(http.StatusForbidden)
			}
		}

		outfitIds, ok := h.OutfitIndices.UserOutfit[userId]
		if !ok {
			if err != nil {
				log.Println("outfitids not found for user id " + userId)
				return ctx.NoContent(http.StatusForbidden)
			}
		}

		var outfits []*Outfit
		for _, outfit := range outfitIds {
			o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, outfit)
			if err != nil {
				log.Println("error " + err.Error())
				return ctx.NoContent(http.StatusInternalServerError)
			}

			outfits = append(outfits, o)
		}

		return ctx.JSON(http.StatusOK, outfits)
	}
}

func (h *Handler) GetUsername() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			return ctx.String(500, "")
		}

		username, ok := h.UserIndices.CookieUsername[cookie]
		if !ok {
			return ctx.String(500, "")
		}

		return ctx.String(200, username)
	}
}

func (h Handler) GetCookie() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		expiry := time.Now().Add(time.Minute * 525600) // 1 year

		b := make([]byte, 16)
		for i := range b {
			b[i] = letters[rand.Intn(len(letters))]
		}

		ctx.SetCookie(&http.Cookie{
			Name:     "rys-login",
			Value:    string(b),
			Expires:  expiry,
			HttpOnly: false,
			Secure:   false,
		})

		return ctx.NoContent(http.StatusOK)
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

		src, err := file.Open()
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		defer src.Close()

		ext := filepath.Ext(file.Filename)
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

		path := "https://storage.googleapis.com/rateyourstyle/" + filename
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

		obj := h.Gcs.Bucket.Object(filepath.Join("data", "outfits", data.Id+".json"))

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

		return ctx.NoContent(http.StatusCreated)
	}
}

func (h *Handler) PostUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var data User
		if err := ctx.Bind(&data); err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
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

		data.Id = uuid()
		data.Cookie = uuid()

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

		users = append(users, data)
		if err := json.NewEncoder(writer).Encode(users); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices
		h.UserIndices.Emails[data.Email] = struct{}{}
		h.UserIndices.Usernames[data.Username] = struct{}{}
		h.UserIndices.CookieUsername[data.Cookie] = data.Username

		// return user cookie in response
		return ctx.String(http.StatusCreated, createCookieStr(data.Cookie))

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
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
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
		h.OutfitIndices.Outfits[data.Id] = struct{}{}
		h.OutfitIndices.UserOutfit[userId] = append(h.OutfitIndices.UserOutfit[userId], data.Id)

	}
}
