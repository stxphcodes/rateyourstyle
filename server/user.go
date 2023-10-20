package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"strings"

	gcs "cloud.google.com/go/storage"
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

type UserProfileResponse struct {
	Username    string       `json:"username"`
	Email       string       `json:"email"`
	UserProfile *UserProfile `json:"user_profile"`
}

type UserProfileFile struct {
	User         *User          `json:"user"`
	UserProfiles []*UserProfile `json:"user_profiles"`
}

type UserIndices struct {
	Emails         map[string]struct{}
	Usernames      map[string]struct{}
	CookieUsername map[string]string // cookie to username
	CookieId       map[string]string // cookie to user id
	IdUsername     map[string]string // id to username
	IdCookie       map[string]string // id to cookie
}

func getAllUsers(ctx context.Context, bucket *gcs.BucketHandle) ([]User, error) {
	obj := bucket.Object("data/users/users.json")
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

func getUserProfileFile(ctx context.Context, bucket *gcs.BucketHandle, user *User) (*UserProfileFile, error) {
	obj := bucket.Object("data/users/" + user.Id + ".json")
	reader, err := obj.NewReader(ctx)
	if err != nil {
		// user profile doesn't exist, just return default one.
		if strings.Contains(err.Error(), "exist") {
			return &UserProfileFile{
				User:         user,
				UserProfiles: []*UserProfile{},
			}, nil
		}

		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var f UserProfileFile
	if err := json.Unmarshal(bytes, &f); err != nil {
		return nil, err
	}

	return &f, nil
}

func createUserProfileFile(ctx context.Context, bucket *gcs.BucketHandle, data *UserProfileFile) error {
	obj := bucket.Object("data/users/" + data.User.Id + ".json")
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(data); err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func createUserIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*UserIndices, error) {
	users, err := getAllUsers(ctx, bucket)
	if err != nil {
		return nil, err
	}

	indices := &UserIndices{
		Emails:         make(map[string]struct{}),
		Usernames:      make(map[string]struct{}),
		CookieUsername: make(map[string]string),
		CookieId:       make(map[string]string),
		IdUsername:     make(map[string]string),
		IdCookie:       make(map[string]string),
	}

	for _, user := range users {
		if user.Email != "" && user.Username != "" && user.Password != "" {
			indices.IdUsername[user.Id] = user.Username
			indices.CookieUsername[user.Cookie] = user.Username
			indices.Usernames[user.Username] = struct{}{}
			indices.Emails[user.Email] = struct{}{}
		}

		indices.CookieId[user.Cookie] = user.Id
		indices.IdCookie[user.Id] = user.Cookie
	}

	return indices, nil
}
