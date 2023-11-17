package main

import (
	"context"
	"encoding/json"
	"io"
	"path/filepath"
	"strings"

	gcs "cloud.google.com/go/storage"
)

func getOutfitItemsFromOutfit(ctx context.Context, bucket *gcs.BucketHandle, outfit *Outfit) ([]*OutfitItem, error) {
	items := []*OutfitItem{}
	for _, itemId := range outfit.ItemIds {
		path := filepath.Join("data", "outfit-items", itemId+".json")

		// read outfit-item data
		obj := bucket.Object(path)
		reader, err := obj.NewReader(ctx)
		if err != nil {
			return nil, err
		}
		defer reader.Close()

		var data OutfitItem
		bytes, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(bytes, &data); err != nil {
			return nil, err
		}

		items = append(items, &data)
	}
	return items, nil
}

func createItemsFromOutfit(ctx context.Context, bucket *gcs.BucketHandle, outfit *Outfit) ([]string, error) {
	itemIds := []string{}

	for _, item := range outfit.Items {
		if item.Id == "" {
			item.Id = uuid()
		}

		path := filepath.Join("data", "outfit-items", item.Id+".json")
		obj := bucket.Object(path)

		objExists := true
		reader, err := obj.NewReader(ctx)
		if err != nil {
			// not does-not-exist error, return
			if !strings.Contains(err.Error(), "exist") {
				return nil, err
			}

			// object doesn't exist, we'll create it below
			objExists = false
		}
		if objExists {
			defer reader.Close()
		}

		var data OutfitItem
		if objExists {
			bytes, err := io.ReadAll(reader)
			if err != nil {
				return nil, err
			}

			if err := json.Unmarshal(bytes, &data); err != nil {
				return nil, err
			}

			data.OutfitIds = append(data.OutfitIds, outfit.Id)
		} else {
			data = *item
			data.UserId = outfit.UserId
			data.DateAdded = outfit.Date
			data.OutfitIds = []string{outfit.Id}
		}

		writer := obj.NewWriter(ctx)
		if err := json.NewEncoder(writer).Encode(data); err != nil {
			return nil, err
		}

		if err := writer.Close(); err != nil {
			return nil, err
		}

		itemIds = append(itemIds, data.Id)
	}
	return itemIds, nil
}
