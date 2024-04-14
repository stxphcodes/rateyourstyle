package main

import (
	"context"
	"encoding/json"
	"io"
	"strings"

	gcs "cloud.google.com/go/storage"
)

type ReplyItem struct {
	RatingUserId   string `json:"rating_user_id"`
	RatingOutfitId string `json:"rating_outfit_id"`

	UserId   string `json:"user_id"`
	Date     string `json:"date"`
	Username string `json:"username"`
	Reply    string `json:"reply"`
	Id       string `json:"id"`
}

type ReplyChain struct {
	RatingUserId   string `json:"rating_user_id"`
	RatingOutfitId string `json:"raing_outfit_id"`

	Replies []*ReplyItem `json:"replies"`
}

func getReplies(ctx context.Context, bucket *gcs.BucketHandle, path string) (*ReplyChain, error) {
	obj := bucket.Object(path)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var r *ReplyChain
	if err := json.Unmarshal(bytes, &r); err != nil {
		return nil, err
	}

	return r, nil
}

func createReply(ctx context.Context, bucket *gcs.BucketHandle, reply *ReplyItem) (*ReplyChain, error) {
	path := "data/replies/" + reply.RatingOutfitId + "/" + reply.RatingUserId + ".json"
	// read original file
	objExists := true
	replies, err := getReplies(ctx, bucket, path)
	if err != nil {
		// not object doesn't exist error
		if !strings.Contains(err.Error(), "exist") {
			return nil, err
		}

		objExists = false
	}

	if !objExists {
		replies = &ReplyChain{
			RatingUserId:   reply.RatingUserId,
			RatingOutfitId: reply.RatingOutfitId,
			Replies:        []*ReplyItem{reply},
		}
	} else {
		replies.Replies = append(replies.Replies, reply)
	}

	if err := writeObject(ctx, bucket, path, replies); err != nil {
		return nil, err
	}

	return replies, nil
}
