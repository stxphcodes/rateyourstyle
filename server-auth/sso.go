package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

const (
	googleUserScope        = "https://www.googleapis.com/auth/userinfo.email"
	googleUserInfoEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo?access_token="
)

var randStates = map[string]struct{}{}

func oauthConfig(clientId, clientSecret, redirectURL string) *oauth2.Config {
	return &oauth2.Config{
		RedirectURL:  redirectURL,
		ClientID:     clientId,
		ClientSecret: clientSecret,
		Scopes:       []string{googleUserScope},
		Endpoint:     google.Endpoint,
	}
}

func getUserInfo(ctx echo.Context, oauth *oauth2.Config) (string, error) {
	state := ctx.FormValue("state")
	code := ctx.FormValue("code")

	_, ok := randStates[state]
	if !ok {
		return "", fmt.Errorf("state doesnt match")
	}
	delete(randStates, state)

	token, err := oauth.Exchange(ctx.Request().Context(), code)
	if err != nil {
		return "", err
	}

	response, err := http.Get(googleUserInfoEndpoint + token.AccessToken)
	if err != nil {
		return "", err

	}
	defer response.Body.Close()

	data, err := io.ReadAll(response.Body)
	if err != nil {
		return "", err
	}

	var m map[string]interface{}
	if err := json.Unmarshal(data, &m); err != nil {
		return "", err
	}

	email, ok := m["email"]
	if !ok {
		return "", fmt.Errorf("malformed responsed")
	}

	emailStr, ok := email.(string)
	if !ok {
		return "", fmt.Errorf("malformed responsed")
	}

	return emailStr, nil

}

func HandleSSOSignin(oauth *oauth2.Config) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		rand := generateOTP()
		randStates[rand] = struct{}{}
		url := oauth.AuthCodeURL(rand)
		return ctx.Redirect(http.StatusTemporaryRedirect, url)
	}
}

func HandleSSOSigninCallback(oauth *oauth2.Config, bucket *gcs.BucketHandle, rysAddr string) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		email, err := getUserInfo(ctx, oauth)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		users, err := getAllUsers(ctx.Request().Context(), bucket)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		rysURL, err := url.Parse(rysAddr)
		if err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		for _, user := range users {
			if strings.EqualFold(user.Email, email) {
				cookie := http.Cookie{
					Name:    "rys-login",
					Value:   user.Cookie,
					Expires: time.Now().Add(24 * time.Hour),
					Domain:  rysURL.Hostname(),
					Path:    "/",
				}
				ctx.SetCookie(&cookie)
				return ctx.Redirect(http.StatusPermanentRedirect, rysAddr)
			}
		}

		// user doesn't exist yet
		return ctx.NoContent(http.StatusForbidden)
	}
}
