package main

import (
	"context"
	"encoding/json"
	"io"

	gcs "cloud.google.com/go/storage"
)

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Cookie   string `json:"cookie"`
	Id       string `json:"id"`
}

type UserIndices struct {
	Emails         map[string]struct{}
	Usernames      map[string]struct{}
	CookieUsername map[string]string // cookie to username
	CookieId       map[string]string // cookie to user id
	IdUsername     map[string]string // id to username
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
	}

	for _, user := range users {
		if user.Email != "" && user.Username != "" && user.Password != "" {
			indices.IdUsername[user.Id] = user.Username
			indices.CookieUsername[user.Cookie] = user.Username
			indices.Usernames[user.Username] = struct{}{}
			indices.Emails[user.Email] = struct{}{}
		}

		indices.CookieId[user.Cookie] = user.Id
	}

	return indices, nil
}
