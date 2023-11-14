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

func getOutfitItemsFromOutfit(ctx context.Context, bucket *gcs.BucketHandle, outfit *Outfit) ([]*OutfitItem, error) {
	year := strings.Split(outfit.Date, "-")[0]
	path := filepath.Join("data", "outfit-items", year, outfit.UserId+".json")

	// read user's outfit-item data
	obj := bucket.Object(path)
	reader, err := obj.NewReader(ctx)
	if err != nil {
		return nil, err
	}
	defer reader.Close()

	var data map[string]*OutfitItem
	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	items := []*OutfitItem{}
	for _, itemId := range outfit.ItemIds {
		item, ok := data[itemId]
		// TODO: what to do?
		if !ok {
			fmt.Println("outfit-item " + itemId + "not found in file " + path)
		} else {
			items = append(items, item)
		}
	}
	return items, nil
}

func createItemsFromOutfit(ctx context.Context, bucket *gcs.BucketHandle, outfit *Outfit) ([]string, error) {
	year := strings.Split(outfit.Date, "-")[0]
	path := filepath.Join("data", "outfit-items", year, outfit.UserId+".json")

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

	data := make(map[string]*OutfitItem)
	if objExists {
		bytes, err := io.ReadAll(reader)
		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(bytes, &data); err != nil {
			return nil, err
		}
	}

	itemIds := []string{}
	for _, item := range outfit.Items {
		if item.Id == "" {
			item.Id = uuid()
		}

		item.UserId = outfit.UserId
		item.DateAdded = outfit.Date
		item.OutfitIds = []string{outfit.Id}

		// check if it already exists in list of items
		if len(data) > 1 {
			_, ok := data[item.Id]
			// doesn't exist yet
			if !ok {
				data[item.Id] = item
			} else {
				// existed, append outfit id
				data[item.Id].OutfitIds = append(data[item.Id].OutfitIds, outfit.Id)
			}
		} else {
			// data item is new, just write
			data[item.Id] = item
		}

		itemIds = append(itemIds, item.Id)
	}

	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(data); err != nil {
		return nil, err
	}

	return itemIds, nil
}
