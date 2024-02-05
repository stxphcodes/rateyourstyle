package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"path/filepath"
	"strings"
	"time"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type RatingIndices struct {
	UserOutfitRating map[string]map[string]interface{}
}

type Rating struct {
	UserId     string      `json:"user_id"`
	OutfitId   string      `json:"outfit_id"`
	Rating     interface{} `json:"rating"`
	Review     string      `json:"review"`
	Date       string      `json:"date"`
	ReplyCount int         `json:"reply_count, omitempty"`

	Username string `json:"username,omitempty"`
}

func average(ratings []*Rating) string {
	sum := float64(0)
	for _, rating := range ratings {

		ratingInt := float64(0)
		if _, ok := rating.Rating.(float64); ok {
			ratingInt = rating.Rating.(float64)
		}

		sum = sum + ratingInt
	}

	avg := sum / float64(len(ratings))

	i := fmt.Sprintf("%.1f", avg)
	return i
}

func listAllRatings(ctx context.Context, bucket *gcs.BucketHandle) ([]string, error) {
	reviewItemPaths := []string{}
	objIter := bucket.Objects(ctx, &gcs.Query{
		Versions: false,
		Prefix:   "data/ratings",
	})

	for {
		attrs, err := objIter.Next()
		if err == iterator.Done {
			break
		}

		// skip directory
		if attrs.Name == "data/ratings/" {
			continue
		}

		if err != nil {
			log.Fatal(err)
		}

		reviewItemPaths = append(reviewItemPaths, attrs.Name)
	}

	return reviewItemPaths, nil
}

func getRatingsByOutfit(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, path string) ([]*Rating, error) {
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

	var r []*Rating
	if err := json.Unmarshal(bytes, &r); err != nil {
		return nil, err
	}

	return r, nil
}

func createRating(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, r *Rating) (bool, error) {
	// read original file
	ratings, err := getRatingsByOutfit(ctx, client, bucket, "data/ratings/"+r.OutfitId+".json")
	if err != nil {
		// not object doesn't exist error
		if !strings.Contains(err.Error(), "exist") {
			return false, err
		}
	}

	found := false
	for i, rating := range ratings {
		if rating.UserId == r.UserId {
			ratings[i].Rating = r.Rating
			ratings[i].Review = r.Review
			ratings[i].Date = time.Now().Format("2006-01-02")
			found = true
			break
		}
	}

	if !found {
		ratings = append(ratings, r)
	}

	obj := bucket.Object(filepath.Join("data", "ratings", r.OutfitId+".json"))
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(ratings); err != nil {
		return false, err
	}

	return found, nil
}

func createRatingIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*RatingIndices, error) {
	ratingPaths, err := listAllRatings(ctx, bucket)
	if err != nil {
		return nil, err
	}

	indices := &RatingIndices{
		UserOutfitRating: make(map[string]map[string]interface{}),
	}

	for _, path := range ratingPaths {
		ratings, err := getRatingsByOutfit(ctx, client, bucket, path)
		if err != nil {
			return nil, err
		}

		for _, r := range ratings {
			outfitRatings, ok := indices.UserOutfitRating[r.UserId]
			if !ok {
				outfitRatings = make(map[string]interface{})
			}

			outfitRatings[r.OutfitId] = r
			indices.UserOutfitRating[r.UserId] = outfitRatings
		}

	}

	return indices, nil
}

func updateRatingReplyCount(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, outfitId string, userId string, replyCount int) error {
	path := "data/ratings/" + outfitId + ".json"
	ratings, err := getRatingsByOutfit(ctx, client, bucket, path)
	if err != nil {
		return err
	}

	for i, r := range ratings {
		if (r.UserId) == userId {
			ratings[i].ReplyCount = replyCount
		}
	}

	obj := bucket.Object(path)
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(ratings); err != nil {
		return err
	}

	return nil
}
