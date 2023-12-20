package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/url"
	"strings"

	gcs "cloud.google.com/go/storage"
	"google.golang.org/api/iterator"
)

type OutfitItem struct {
	Id        string   `json:"id,omitempty"`
	UserId    string   `json:"user_id,omitempty"`
	DateAdded string   `json:"date_added,omitempty"`
	OutfitIds []string `json:"outfit_ids,omitempty"`

	Brand       string      `json:"brand"`
	Link        string      `json:"link"`
	Description string      `json:"description"`
	Size        string      `json:"size"`
	Price       string      `json:"price"`
	Review      string      `json:"review"`
	Rating      interface{} `json:"rating"`
	Color       string      `json:"color"`
	Store       string      `json:"store"`
}

type Outfit struct {
	Id         string        `json:"id"`
	Date       string        `json:"date"`
	UserId     string        `json:"user_id"`
	Title      string        `json:"title"`
	PictureURL string        `json:"picture_url"`
	StyleTags  []string      `json:"style_tags"`
	Items      []*OutfitItem `json:"items,omitempty"` // outdated
	ItemIds    []string      `json:"item_ids"`
	Private    bool          `json:"private"`
}

type OutfitResponse struct {
	Id   string `json:"id"`
	Date string `json:"date"`
	//UserId     string   `json:"user_id"`
	Username   string   `json:"username"`
	Title      string   `json:"title"`
	PictureURL string   `json:"picture_url"`
	StyleTags  []string `json:"style_tags"`
	//ItemIds    []string `json:"item_ids"`
	Items   []*OutfitItem `json:"items"`
	Private bool          `json:"private"`

	UserProfile   *UserProfile `json:"user_profile,omitempty"`
	RatingCount   interface{}  `json:"rating_count"`
	RatingAverage interface{}  `json:"rating_average"`

	PictureURLResized string `json:"picture_url_resized"`
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

func getOutfit(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle, userIdUsername map[string]string, id string) (*OutfitResponse, error) {
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
	resp := &OutfitResponse{
		Id:         o.Id,
		Date:       o.Date,
		Title:      o.Title,
		PictureURL: o.PictureURL,
		StyleTags:  o.StyleTags,
		Private:    o.Private,
	}

	// get URL of picture resized
	pictureURL, err := url.Parse(o.PictureURL)
	if err != nil {
		return nil, err
	}

	urlSplit := strings.Split(pictureURL.Path, "/")
	pictureName := urlSplit[len(urlSplit)-1]
	pictureNameSplit := strings.Split(pictureName, ".")
	resizePictureName := pictureNameSplit[0] + "-w600." + pictureNameSplit[1]

	resp.PictureURLResized = strings.Replace(o.PictureURL, pictureName, resizePictureName, 1)

	// get outfit items
	items, err := getOutfitItemsFromOutfit(ctx, bucket, o.ItemIds)
	if err != nil {
		return nil, err
	}

	resp.Items = items

	// get username
	username, ok := userIdUsername[o.UserId]
	if ok {
		resp.Username = username
	}

	// get user profile of outfit poster
	u := &User{Id: o.UserId}
	upf, err := getUserProfileFile(ctx, bucket, u)
	if err == nil {
		resp.UserProfile = getRecentUserProfile(upf.UserProfiles)
	}

	// get ratings
	ratings, err := getRatingsByOutfit(ctx, client, bucket, "data/ratings/"+o.Id+".json")
	if err == nil {
		resp.RatingCount = len(ratings)
		resp.RatingAverage = average(ratings)
	}

	return resp, nil
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
