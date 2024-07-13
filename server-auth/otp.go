package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"time"

	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
	"golang.org/x/oauth2"
)

var otps = make(map[string]time.Time)

func generateOTP() string {
	buffer := make([]byte, 6)
	rand.Read(buffer)

	otpCharsLength := len(otpChars)
	for i := 0; i < 6; i++ {
		buffer[i] = otpChars[int(buffer[i])%otpCharsLength]
	}

	return string(buffer)
}

func HandleOTPSignin(oauth *oauth2.Config, bucket *gcs.BucketHandle, smtpClient *SmtpClient, domain string) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		usernameOrEmail := ctx.QueryParam("user")
		if usernameOrEmail == "" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		users, err := getAllUsers(ctx.Request().Context(), bucket)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for _, user := range users {
			if strings.EqualFold(user.Email, usernameOrEmail) || strings.EqualFold(user.Username, usernameOrEmail) {
				otp := generateOTP()
				param := fmt.Sprintf("user=%s&otp=%s", usernameOrEmail, otp)
				// url := fmt.Sprintf("http://localhost:8003/auth/otp/signin/callback?%s", param)

				otps[param] = time.Now().Add(time.Minute * 5)

				data := struct {
					Username string
					OTP      string
				}{
					Username: user.Username,
					OTP:      otp,
				}

				return sendEmail(smtpClient, "templates/signin-otp.html", "RateYourStyle Sign In", user.Email, data)

			}
		}

		return ctx.NoContent(http.StatusNotFound)
	}
}

func HandlePostOTPSignin(bucket *gcs.BucketHandle) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var m map[string]string
		if err := json.NewDecoder(ctx.Request().Body).Decode(&m); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		user, ok := m["user"]
		if !ok {
			return ctx.NoContent(http.StatusBadRequest)
		}

		otp, ok := m["otp"]
		if !ok {
			return ctx.NoContent(http.StatusBadRequest)
		}

		key := fmt.Sprintf("user=%s&otp=%s", user, otp)
		expiry, ok := otps[key]
		if !ok {
			return ctx.NoContent(http.StatusNotFound)
		}

		if expiry.Before(time.Now()) {
			delete(otps, key)
			return ctx.NoContent(http.StatusFailedDependency)
		}

		users, err := getAllUsers(ctx.Request().Context(), bucket)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		cookie := ""
		for _, u := range users {
			if strings.EqualFold(u.Username, user) || strings.EqualFold(u.Email, user) {
				cookie = u.Cookie
			}
		}

		delete(otps, key)
		return ctx.String(http.StatusOK, createCookieStr(cookie))
	}
}
