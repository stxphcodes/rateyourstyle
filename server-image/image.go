package main

import (
	"context"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"io"
	"log"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"cloud.google.com/go/storage"
	gcs "cloud.google.com/go/storage"
	"github.com/nfnt/resize"
)

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const cookieName = "rys-login"
const usersFile = "data/users/users.json"

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Cookie   string `json:"cookie"`
	Id       string `json:"id"`
}

func getUserId(ctx context.Context, bucket *gcs.BucketHandle, cookie string) (string, error) {
	obj := bucket.Object(usersFile)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return "", err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return "", err
	}

	var users []User
	if err := json.Unmarshal(bytes, &users); err != nil {
		return "", err
	}

	userId := ""
	for _, u := range users {
		if u.Cookie == cookie {
			userId = u.Id
		}
	}

	return userId, nil
}

func uuid() string {
	b := make([]byte, 16)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	return string(b)
}

func getCookie(request *http.Request) (string, error) {
	cookie := ""
	for key, value := range request.Header {
		if strings.ToLower(key) == cookieName {
			cookie = value[0]
		}
	}

	if cookie == "" {
		return "", fmt.Errorf("rys-login header not found")
	}

	return cookie, nil
}

func createTempImage(srcFile *multipart.FileHeader, tmpPath string) error {
	src, err := srcFile.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(tmpPath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}

func removeImageMetadata(tmpPath string) error {
	cmd := exec.Command("exiftool", "-all=", tmpPath)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	err := cmd.Run()
	if err != nil {
		log.Println("error running exif command ", err.Error())
		return err
	}

	return nil
}

func cleanupTempImages(tmpPath string) {
	if err := os.Remove(tmpPath); err != nil {
		log.Println("error removing file ", tmpPath)
	}

	// exiftool will create a copy of the original image.
	// remove it if it exists
	originalFile := tmpPath + "_original"
	if _, err := os.Stat(originalFile); err == nil {
		if err := os.Remove(originalFile); err != nil {
			log.Println("error removing file ", originalFile)
		}
	}
}

func createImage(ctx context.Context, bucket *gcs.BucketHandle, srcPath, destinationPath string) error {
	src, err := os.Open(srcPath)
	if err != nil {
		return err
	}
	defer src.Close()

	obj := bucket.Object(destinationPath)
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	_, err = io.Copy(writer, src)
	if err != nil {
		return err
	}
	writer.Close()

	// make image public
	if err := obj.ACL().Set(ctx, storage.AllUsers, storage.RoleReader); err != nil {
		return err
	}

	return nil
}

func createResizeImage(ctx context.Context, bucket *gcs.BucketHandle, originalImagePath string, destinationPath string) error {
	obj := bucket.Object(originalImagePath)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return err
	}
	defer reader.Close()

	img, _, err := image.Decode(reader)
	if err != nil {
		return err
	}

	resized := resize.Resize(600, 0, img, resize.Lanczos3)
	newObj := bucket.Object(destinationPath)
	writer := newObj.NewWriter(ctx)
	if err := jpeg.Encode(writer, resized, nil); err != nil {
		return err
	}

	if err := writer.Close(); err != nil {
		return err
	}

	// make public
	if err := newObj.ACL().Set(ctx, storage.AllUsers, storage.RoleReader); err != nil {
		return err
	}

	return nil
}
