package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
)

const (
	usersFile = "data/users/users.json"
	usersDir  = "data/users"
)

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Cookie   string `json:"cookie"`
	Id       string `json:"id"`
}

type UserProfile struct {
	Date        string `json:"date"`
	Department  string `json:"department"`
	AgeRange    string `json:"age_range"`
	WeightRange string `json:"weight_range"`
	HeightRange string `json:"height_range"`
}

type UserGeneral struct {
	Aesthetics  []string `json:"aesthetics"`
	Country     string   `json:"country"`
	Description string   `json:"description"`
	Links       []string `json:"links"`
	Date        string   `json:"date"`
}

type UserResponse struct {
	Username    string       `json:"username"`
	Email       string       `json:"email"`
	UserProfile *UserProfile `json:"user_profile"`
	UserGeneral *UserGeneral `json:"user_general"`
}

type UserFile struct {
	User         *User          `json:"user"`
	UserProfiles []*UserProfile `json:"user_profiles"`
	UserGeneral  *UserGeneral   `json:"user_general"`
}

// type UserIndices struct {
// 	Emails         map[string]struct{}
// 	Usernames      map[string]struct{}
// 	CookieUsername map[string]string // cookie to username
// 	CookieId       map[string]string // cookie to user id
// 	IdUsername     map[string]string // id to username
// 	IdCookie       map[string]string // id to cookie
// }

func getAllUsers(ctx context.Context, bucket *gcs.BucketHandle) ([]User, error) {
	obj := bucket.Object(usersFile)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var users []User
	if err := json.Unmarshal(bytes, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func getUser(ctx context.Context, bucket *gcs.BucketHandle, userId string) (*User, error) {
	allUsers, err := getAllUsers(ctx, bucket)
	if err != nil {
		return nil, err
	}

	for _, user := range allUsers {
		if user.Id == userId {
			return &user, nil
		}
	}

	return nil, fmt.Errorf("user does not exist %s", userId)
}

func getRecentUserProfile(profiles []*UserProfile) *UserProfile {
	if len(profiles) == 0 {
		return &UserProfile{
			Date:        "",
			Department:  "",
			AgeRange:    "",
			WeightRange: "",
			HeightRange: "",
		}
	}

	return profiles[len(profiles)-1]
}

func getUserFile(ctx context.Context, bucket *gcs.BucketHandle, user *User) (*UserFile, error) {
	obj := bucket.Object("data/users/" + user.Id + ".json")
	reader, err := obj.NewReader(ctx)
	if err != nil {
		// user profile doesn't exist, just return default one.
		if strings.Contains(err.Error(), "exist") {
			return &UserFile{
				User:         user,
				UserProfiles: []*UserProfile{},
				UserGeneral:  nil,
			}, nil
		}

		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var f UserFile
	if err := json.Unmarshal(bytes, &f); err != nil {
		return nil, err
	}

	return &f, nil
}

func createUserFile(ctx context.Context, bucket *gcs.BucketHandle, data *UserFile) error {
	obj := bucket.Object("data/users/" + data.User.Id + ".json")
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(data); err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func HandlePostSignIn(bucket *gcs.BucketHandle) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var u User
		if err := ctx.Bind(&u); err != nil {
			log.Println("error " + err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		users, err := getAllUsers(ctx.Request().Context(), bucket)
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

func HandlePostUser(bucket *gcs.BucketHandle) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var data User
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}
		// ensure username is all lowercase
		data.Username = strings.ToLower(data.Username)

		// uniqueness checks
		// _, ok := userIndices.Usernames[data.Username]
		// if ok {
		// 	return ctx.String(http.StatusBadRequest, "username taken")
		// }

		// assign cookie and id to user
		data.Cookie = uuid()
		data.Id = uuid()

		// read original file
		users, err := getAllUsers(ctx.Request().Context(), bucket)
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		users = append(users, data)

		// update user in  original file
		obj := bucket.Object("data/users/users.json")
		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(users); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// update indices that need updating
		// userIndices.Emails[data.Email] = struct{}{}
		// userIndices.Usernames[data.Username] = struct{}{}
		// userIndices.CookieUsername[data.Cookie] = data.Username
		// userIndices.IdUsername[data.Id] = data.Username
		// userIndices.CookieId[data.Cookie] = data.Id
		// userIndices.IdCookie[data.Id] = data.Cookie

		// create blank user profile file
		userProfile := UserFile{
			User: &data,
			UserProfiles: []*UserProfile{
				{
					Date:        timeNow(),
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

		if err := createUserFile(ctx.Request().Context(), bucket, &userProfile); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// return user cookie in response
		return ctx.String(http.StatusCreated, createCookieStr(data.Cookie))
	}
}
