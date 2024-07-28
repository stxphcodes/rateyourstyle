package main

import (
	"context"
	"encoding/json"
	"io"
	"log"

	gcs "cloud.google.com/go/storage"
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

	Verified bool `json:"verified"`
}

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

func updateUserVerification(ctx context.Context, bucket *gcs.BucketHandle, data any) error {
	obj := bucket.Object(usersFile)
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(data); err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}
