package main

import (
	"context"
	"encoding/json"
	"io"
	"log"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type OutfitItem struct {
	Brand       string      `json:"brand"`
	Link        string      `json:"link"`
	Description string      `json:"description"`
	Size        string      `json:"size"`
	Price       string      `json:"price"`
	Review      string      `json:"review"`
	Rating      interface{} `json:"rating"`
}

type Outfit struct {
	Id         string        `json:"id"`
	Date       string        `json:"date"`
	UserId     string        `json:"user_id"`
	Title      string        `json:"title"`
	PictureURL string        `json:"picture_url"`
	StyleTags  []string      `json:"style_tags"`
	Items      []*OutfitItem `json:"items"`
	Private    bool          `json:"private"`
}

type OutfitIndices struct {
	Outfits       map[string]struct{}
	UserOutfit    map[string][]string
	PublicOutfits map[string]struct{}
}

func listAllOutfits(ctx context.Context, bucket *gcs.BucketHandle) ([]string, error) {
	outfits := []string{}
	objIter := bucket.Objects(ctx, &gcs.Query{
		Versions: false,
		Prefix:   "data/outfits",
	})

	for {
		attrs, err := objIter.Next()
		if err == iterator.Done {
			break
		}

		// skip directory
		if attrs.Name == "data/outfits/" {
			continue
		}

		if err != nil {
			log.Fatal(err)
		}

		outfits = append(outfits, attrs.Name)

	}

	return outfits, nil
}

func getOutfit(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, id string) (*Outfit, error) {
	path := "data/outfits/" + id + ".json"
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

	var o Outfit
	if err := json.Unmarshal(bytes, &o); err != nil {
		return nil, err
	}

	return &o, nil
}

func createOutfitIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*OutfitIndices, error) {
	outfits, err := listAllOutfits(ctx, bucket)
	if err != nil {
		return nil, err
	}

	indices := &OutfitIndices{
		Outfits:       make(map[string]struct{}),
		PublicOutfits: make(map[string]struct{}),
		UserOutfit:    make(map[string][]string),
	}

	for _, outfit := range outfits {
		obj := bucket.Object(outfit)
		reader, err := obj.NewReader(ctx)

		if err != nil {
			return nil, err
		}
		defer reader.Close()

		bytes, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		var o Outfit
		if err := json.Unmarshal(bytes, &o); err != nil {
			return nil, err
		}

		indices.Outfits[o.Id] = struct{}{}
		if !o.Private {
			indices.PublicOutfits[o.Id] = struct{}{}
		}

		_, ok := indices.UserOutfit[o.UserId]
		if ok {
			indices.UserOutfit[o.UserId] = append(indices.UserOutfit[o.UserId], o.Id)
		} else {
			indices.UserOutfit[o.UserId] = []string{o.Id}
		}
	}

	return indices, nil
}