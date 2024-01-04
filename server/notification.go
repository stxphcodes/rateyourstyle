package main

import (
	"context"
	"encoding/json"
	"io"
	"path/filepath"
	"strings"

	gcs "cloud.google.com/go/storage"
)

const notificationsDir = "data/notifications"

type NotificationIndices struct {
	UserHasNotifications map[string]bool
}

type Notification struct {
	ForOutfitId  string
	ForUserId    string
	ForUsername  string
	FromUserId   string
	FromUsername string
	Date         string
	Message      string
	SeenAt       string
	Seen         bool
}

func createNotification(ctx context.Context, bucket *gcs.BucketHandle, n *Notification) error {
	path := filepath.Join(notificationsDir, n.ForUserId+".json")
	obj := bucket.Object(path)

	objExists := true
	reader, err := obj.NewReader(ctx)
	if err != nil {
		// not does-not-exist error, return
		if !strings.Contains(err.Error(), "exist") {
			return err
		}

		// object doesn't exist, we'll create it below
		objExists = false
	}
	if objExists {
		defer reader.Close()
	}

	var data []*Notification
	if objExists {
		bytes, err := io.ReadAll(reader)
		if err != nil {
			return err
		}

		if err := json.Unmarshal(bytes, &data); err != nil {
			return err
		}
	}

	data = append(data, n)

	writer := obj.NewWriter(ctx)
	if err := json.NewEncoder(writer).Encode(data); err != nil {
		return err
	}

	if err := writer.Close(); err != nil {
		return err
	}

	return nil
}

func getNotifications(ctx context.Context, bucket *gcs.BucketHandle, path string) ([]*Notification, error) {
	bytes, err := readObjectBytes(ctx, bucket, path)
	if err != nil {
		return nil, err
	}

	var data []*Notification
	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func createNotificationIndices(ctx context.Context, bucket *gcs.BucketHandle) (*NotificationIndices, error) {
	paths, err := getFilepaths(ctx, bucket, notificationsDir)
	if err != nil {
		return nil, err
	}

	i := NotificationIndices{
		UserHasNotifications: make(map[string]bool),
	}

	for _, path := range paths {
		data, err := getNotifications(ctx, bucket, path)
		if err != nil {
			return nil, err
		}

		for _, d := range data {
			if !d.Seen {
				i.UserHasNotifications[d.ForUserId] = true
				break
			}
		}

	}

	return &i, nil
}
