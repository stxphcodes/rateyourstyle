package main

import (
	"context"
	"encoding/json"
	"io"
	"log"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type RatingIndices struct {
	AllRatings []*Rating
}

type Rating struct {
	UserId   string      `json:"user_id"`
	OutfitId string      `json:"outfit_id"`
	Rating   interface{} `json:"rating"`
	Review   string      `json:"review"`
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

func getRatingsByOutfit(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, path string) ([]Rating, error) {
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

	var r []Rating
	if err := json.Unmarshal(bytes, &r); err != nil {
		return nil, err
	}

	return r, nil
}

func createRatingIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*RatingIndices, error) {
	ratingPaths, err := listAllRatings(ctx, bucket)
	if err != nil {
		return nil, err
	}

	indices := &RatingIndices{
		AllRatings: []*Rating{},
	}

	for _, path := range ratingPaths {
		ratings, err := getRatingsByOutfit(ctx, client, bucket, path)
		if err != nil {
			return nil, err
		}

		for _, r := range ratings {
			indices.AllRatings = append(indices.AllRatings, &Rating{
				UserId:   r.UserId,
				Rating:   r.Rating,
				OutfitId: r.OutfitId,
			})
		}
	}

	return indices, nil
}
