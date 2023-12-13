package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"strings"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type BusinessIndices struct {
	Businesses map[string]*BusinessProfile
}

type BusinessOutfitRequest struct {
	OutfitId string   `json:"outfit_id"`
	ItemIds  []string `json:"item_ids"`
}

// 	BusinessName string `json:"business_name"`

// 	Data []BusinessOutfitRequestData `json:"data"`

// 	// OutfitId     string   `json:"outfit_id"`
// 	// ItemIds      []string `json:"item_ids"`
// }

// type BusinessOutfitRequestData struct {
// 	OutfitId string   `json:"outfit_id"`
// 	ItemIds  []string `json:"item_ids"`
// }

type BusinessOutfit struct {
	BusinessId  string   `json:"business_id"` // id of business submitted to
	UserId      string   `json:"user_id"`     // id of user who submitted outfit
	OutfitId    string   `json:"outfit_id"`
	ItemIds     []string `json:"item_ids"`
	Approved    bool     `json:"approved"`
	DateCreated string   `json:"date_created"`
}

type BusinessProfile struct {
	DateCreated string `json:"date_created"`
	Description string `json:"description"`
	UserId      string `json:"user_id"`
	Address     string `json:"address"`
}

func createBusinessIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*BusinessIndices, error) {
	indices := &BusinessIndices{
		Businesses: make(map[string]*BusinessProfile),
	}

	businessPaths, err := listBusinesses(ctx, client, bucket)
	if err != nil {
		return nil, err
	}

	for _, path := range businessPaths {
		business, err := getBusinessProfile(ctx, bucket, path)
		if err != nil {
			return nil, err
		}

		indices.Businesses[business.UserId] = business
	}

	return indices, nil
}

func createBusinessProfile(ctx context.Context, bucket *gcs.BucketHandle, data *BusinessProfile) error {
	obj := bucket.Object("data/businesses/" + data.UserId + ".json")
	writer := obj.NewWriter(ctx)
	defer writer.Close()

	if err := json.NewEncoder(writer).Encode(data); err != nil {
		log.Println(err.Error())
		return err
	}

	return nil
}

func getBusinessProfile(ctx context.Context, bucket *gcs.BucketHandle, path string) (*BusinessProfile, error) {
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

	var b *BusinessProfile
	if err := json.Unmarshal(bytes, &b); err != nil {
		return nil, err
	}

	return b, nil
}

func listBusinesses(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) ([]string, error) {
	businesses := []string{}
	objIter := bucket.Objects(ctx, &gcs.Query{
		Versions: false,
		Prefix:   "data/businesses",
	})

	for {
		attrs, err := objIter.Next()
		if err == iterator.Done {
			break
		}

		// skip directory
		if attrs.Name == "data/businesses/" {
			continue
		}

		if err != nil {
			log.Fatal(err)
		}

		businesses = append(businesses, attrs.Name)

	}

	return businesses, nil
}

func createBusinessOutfit(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, data *BusinessOutfit) error {
	path := "data/business-outfits/" + data.BusinessId + ".json"
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

	var businessOutfits []*BusinessOutfit
	if objExists {
		bytes, err := io.ReadAll(reader)
		if err != nil {
			return err
		}

		if err := json.Unmarshal(bytes, &businessOutfits); err != nil {
			return err
		}
	}

	for _, o := range businessOutfits {
		if o.OutfitId == data.OutfitId {
			return fmt.Errorf("outfit already submitted")
		}
	}

	businessOutfits = append(businessOutfits, data)

	writer := obj.NewWriter(ctx)
	if err := json.NewEncoder(writer).Encode(businessOutfits); err != nil {
		return err
	}

	if err := writer.Close(); err != nil {
		return err
	}

	return nil
}

func getBusinessOutfits(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, userIdUsername map[string]string, businessId string) ([]*OutfitResponse, error) {
	path := "data/business-outfits/" + businessId + ".json"
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

	var data []BusinessOutfit
	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	var response []*OutfitResponse
	for _, businessOutfit := range data {
		outfit, err := getOutfit(ctx, client, bucket, userIdUsername, businessOutfit.OutfitId)
		if err != nil {
			return nil, err
		}

		for index, item := range outfit.Items {
			found := false
			for _, businessItemId := range businessOutfit.ItemIds {
				if item.Id == businessItemId {
					found = true
					break
				}
			}

			// remove other items from outfit
			if !found {
				outfit.Items = append(outfit.Items[:index], outfit.Items[index+1:]...)
			}
		}

		response = append(response, outfit)
	}

	return response, nil
}
