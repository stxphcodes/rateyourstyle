package main

import (
	"context"
	"image"
	"image/jpeg"
	"io"
	"mime/multipart"
	"net/url"
	"strings"

	"cloud.google.com/go/storage"
	gcs "cloud.google.com/go/storage"
	"github.com/nfnt/resize"
)

func createImage(ctx context.Context, bucket *gcs.BucketHandle, srcFile *multipart.FileHeader, destinationPath string) error {
	src, err := srcFile.Open()
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

func getResizedImageURL(ctx context.Context, bucket *gcs.BucketHandle, originalPhotoURL string) (string, error) {
	pictureURL, err := url.Parse(originalPhotoURL)
	if err != nil {
		return "", err
	}

	urlSplit := strings.Split(pictureURL.Path, "/")
	pictureName := urlSplit[len(urlSplit)-1]
	pictureNameSplit := strings.Split(pictureName, ".")
	resizePictureName := pictureNameSplit[0] + "-w600." + pictureNameSplit[1]

	resizedImageURL := strings.Replace(originalPhotoURL, pictureName, resizePictureName, 1)

	obj := bucket.Object("imgs/outfits/" + urlSplit[len(urlSplit)-2] + "/" + resizePictureName)

	_, err = obj.Attrs(ctx)
	if err == nil {
		return resizedImageURL, nil
	}

	return "", err
}
