package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"

	gcs "cloud.google.com/go/storage"
)

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Cookie   string `json:"cookie"`
}

type UserIndices struct {
	Emails         map[string]struct{}
	Usernames      map[string]struct{}
	CookieUsername map[string]string // cookie to username
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
		fmt.Println("line 45")
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
	}

	for _, user := range users {
		indices.Emails[user.Email] = struct{}{}
		indices.Usernames[user.Username] = struct{}{}
		indices.CookieUsername[user.Cookie] = user.Username
	}

	return indices, nil
}
