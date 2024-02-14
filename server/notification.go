package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	gcs "cloud.google.com/go/storage"
)

const notificationsDir = "data/notifications"

type UserNotifResponse struct {
	Username         string `json:"username"`
	HasNotifications bool   `json:"has_notifications"`
}

type NotificationIndices struct {
	UserHasNotifications map[string]bool // userId and whether they have notifications
}

type NotificationsSeen struct {
	NotificationIds []string `json:"notification_ids"`
}

type Notification struct {
	Id             string `json:"id"`
	ForOutfitId    string `json:"for_outfit_id"`
	ForOutfitTitle string `json:"for_outfit_title"`
	ForUserId      string `json:"for_user_id"`
	ForUsername    string `json:"for_username"`
	FromUserId     string `json:"from_user_id"`
	FromUsername   string `json:"from_username"`
	Date           string `json:"date"`
	Message        string `json:"message"`
	SeenAt         string `json:"seen_at"`
	Seen           bool   `json:"seen"`
}

func repliesToNotifications(ctx context.Context, bucket *gcs.BucketHandle, userIdUsername map[string]string, chain *ReplyChain, r *ReplyItem) ([]*Notification, error) {
	outfit, err := getOutfitNoResponse(ctx, bucket, r.RatingOutfitId)
	if err != nil {
		return nil, err
	}

	notificationFor := make(map[string]struct{})
	// notify original rating writer that there's a new reply
	if r.UserId != r.RatingUserId {
		notificationFor[r.RatingUserId] = struct{}{}
	}

	// notify outfit poster that there's a new reply
	if r.UserId != outfit.UserId {
		notificationFor[outfit.UserId] = struct{}{}
	}

	// notify everyone in chain that there's a new reply
	for _, reply := range chain.Replies {
		if r.UserId != reply.UserId {
			notificationFor[reply.UserId] = struct{}{}
		}
	}

	notifs := []*Notification{}
	for n := range notificationFor {
		u := userIdUsername[n]

		// create notification
		notif := &Notification{
			Id:             uuid(),
			ForUserId:      n,
			ForUsername:    u,
			ForOutfitId:    r.RatingOutfitId,
			ForOutfitTitle: outfit.Title,
			FromUserId:     r.UserId,
			FromUsername:   r.Username,
			Date:           r.Date,
			Message:        fmt.Sprintf("new reply from %s for %s", r.Username, outfit.Title),
			Seen:           false,
			SeenAt:         "",
		}

		notifs = append(notifs, notif)
	}

	return notifs, nil
}

func ratingToNotification(r *Rating, ctx context.Context, bucket *gcs.BucketHandle, userIdUsername map[string]string) (*Notification, error) {
	if r.Date == "" || r.OutfitId == "" || r.UserId == "" || r.Username == "" {
		return nil, fmt.Errorf("Rating missing required fields to create notification")
	}

	outfit, err := getOutfitNoResponse(ctx, bucket, r.OutfitId)
	if err != nil {
		return nil, err
	}

	forUsername, ok := userIdUsername[outfit.UserId]
	if !ok {
		forUsername = "anonymous"
	}

	n := Notification{
		Id:             uuid(),
		ForUserId:      outfit.UserId,
		ForUsername:    forUsername,
		ForOutfitId:    r.OutfitId,
		ForOutfitTitle: outfit.Title,
		FromUserId:     r.UserId,
		FromUsername:   r.Username,
		Date:           r.Date,
		Message:        fmt.Sprintf("%s rated %s", r.Username, outfit.Title),
		Seen:           false,
		SeenAt:         "",
	}

	return &n, nil
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
