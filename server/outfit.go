package main

import (
	"context"
	"encoding/json"
	"io"

	gcs "cloud.google.com/go/storage"
)

const outfitsDir = "data/outfits"

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
	ColorRGB    string      `json:"color_rgb"`
	ColorHex    string      `json:"color_hex"`
	ColorName   string      `json:"color_name"`
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
	OutfitUser    map[string]string
	UserOutfit    map[string][]string
	PublicOutfits map[string]struct{}
}

// used by ratingToNotification func
func getOutfitNoResponse(ctx context.Context, bucket *gcs.BucketHandle, id string) (*Outfit, error) {
	path := "data/outfits/" + id + ".json"
	bytes, err := readObjectBytes(ctx, bucket, path)
	if err != nil {
		return nil, err
	}

	var o Outfit
	if err := json.Unmarshal(bytes, &o); err != nil {
		return nil, err
	}

	return &o, nil
}

func getOutfit(ctx context.Context, bucket *gcs.BucketHandle, userIdUsername map[string]string, id string) (*OutfitResponse, error) {
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
	resizedURL, err := getResizedImageURL(ctx, bucket, o.PictureURL)
	if err == nil && resizedURL != "" {
		resp.PictureURLResized = resizedURL
	} else {
		// just use original if there's no resized image availble
		resp.PictureURLResized = o.PictureURL
	}

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
	upf, err := getUserFile(ctx, bucket, u)
	if err == nil {
		resp.UserProfile = getRecentUserProfile(upf.UserProfiles)
	}

	// get ratings
	ratings, err := getRatingsByOutfit(ctx, bucket, "data/ratings/"+o.Id+".json")
	if err == nil {
		resp.RatingCount = len(ratings)
		resp.RatingAverage = average(ratings)
	}

	return resp, nil
}

func createOutfitIndices(ctx context.Context, client *gcs.Client, bucket *gcs.BucketHandle) (*OutfitIndices, error) {
	outfits, err := getFilepaths(ctx, bucket, outfitsDir)
	if err != nil {
		return nil, err
	}

	indices := &OutfitIndices{
		OutfitUser:    make(map[string]string),
		PublicOutfits: make(map[string]struct{}),
		UserOutfit:    make(map[string][]string),
	}

	for _, outfit := range outfits {
		bytes, err := readObjectBytes(ctx, bucket, outfit)
		if err != nil {
			return nil, err
		}

		var o Outfit
		if err := json.Unmarshal(bytes, &o); err != nil {
			return nil, err
		}

		indices.OutfitUser[o.Id] = o.UserId
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
