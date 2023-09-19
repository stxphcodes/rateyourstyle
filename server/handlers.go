package main

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"time"

	"cloud.google.com/go/firestore"
	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
)

type Handler struct {
	fs *firestore.Client

	Gcs struct {
		Client *gcs.Client
		Bucket *gcs.BucketHandle
	}

	UserIndices   *UserIndices
	OutfitIndices *OutfitIndices
}

func (h Handler) GetOutfits() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var outfits []*Outfit
		for outfit := range h.OutfitIndices.Outfits {
			o, err := getOutfit(ctx.Request().Context(), h.Gcs.Client, h.Gcs.Bucket, outfit)
			if err != nil {
				return ctx.String(500, "")
			}

			outfits = append(outfits, o)
		}

		return ctx.JSON(200, outfits)
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
			Domain:   ".app.localhost",
			Name:     "rys_user_id",
			Value:    string(b),
			Expires:  expiry,
			HttpOnly: false,
			Secure:   false,
		})

		return ctx.NoContent(200)
	}
}

func GetImage() {

}

// func (h Handler) PostImage() echo.HandlerFunc {

// }

func (h Handler) PostOutfit() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var data Outfit
		if err := ctx.Bind(&data); err != nil {
			return ctx.String(500, "")
		}

		// bucketHandler := h.gcs.client.Bucket(h.gcs.bucket)

		return nil
	}
}

func (h *Handler) GetUsername() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		bytes, err := io.ReadAll(ctx.Request().Body)
		if err != nil {
			return ctx.String(500, "")
		}

		username, ok := h.UserIndices.CookieUsername[string(bytes)]
		if !ok {
			return ctx.String(500, "")
		}

		return ctx.String(200, username)
	}
}

func (h *Handler) PostUser() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var data User
		if err := ctx.Bind(&data); err != nil {
			return ctx.String(500, "")
		}

		// uniqueness checks
		_, ok := h.UserIndices.Emails[data.Email]
		if ok {
			return ctx.String(500, "")
		}

		_, ok = h.UserIndices.Usernames[data.Username]
		if ok {
			return ctx.String(500, "")
		}

		data.Cookie = createCookie()

		// read original file
		users, err := getAllUsers(ctx.Request().Context(), h.Gcs.Bucket)
		if err != nil {
			return ctx.String(500, "")
		}

		// write new user to original file
		obj := h.Gcs.Bucket.Object("data/users/users.json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		users = append(users, data)
		if err := json.NewEncoder(writer).Encode(users); err != nil {
			return ctx.String(500, "")
		}

		// update indices
		h.UserIndices.Emails[data.Email] = struct{}{}
		h.UserIndices.Usernames[data.Username] = struct{}{}
		h.UserIndices.CookieUsername[data.Cookie] = data.Username

		// return user cookie in response

		return ctx.String(201,
			fmt.Sprintf("rys_user_id=%s;expires=%s", data.Cookie, time.Now().Add(time.Minute*525600).String()))

	}
}
