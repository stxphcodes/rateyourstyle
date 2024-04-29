package main

import (
	"context"
	"encoding/json"
	"io"
	"strings"

	gcs "cloud.google.com/go/storage"
)

type GetFeedbackResponse struct {
	RequestId         string              `json:"request_id"`
	RequestDate       string              `json:"request_date"`
	ToUsername        string              `json:"to_username"`
	Outfit            *Outfit             `json:"outfit"`
	QuestionResponses []*QuestionResponse `json:"question_responses"`
}

type GetFeedbackRequest struct {
	ToUsername     string   `json:"to_username"`
	OutfitId       string   `json:"outfit_id"`
	ExpirationDate string   `json:"expiration_date"`
	Questions      []string `json:"questions"`
}

type FeedbackRequest struct {
	RequestId      string `json:"request_id"`
	RequestType    string `json:"request_type"`
	RequestDate    string `json:"request_date"`
	OutfitId       string `json:"outfit_id"`
	FromUserId     string `json:"from_userid"`
	ToUserId       string `json:"to_userid"`
	ExpirationDate string `json:"expiration_date"`
}

type FeedbackResponse struct {
	RequestId    string `json:"request_id"`
	FromUserId   string `json:"from_userid"`
	ToUserId     string `json:"to_userid"`
	OutfitId     string `json:"outfit_id"`
	Accepted     bool   `json:"accepted"`
	ResponseDate string `json:"response_date"`
}

type FeedbackContent struct {
	RequestId         string              `json:"request_id"`
	QuestionResponses []*QuestionResponse `json:"question_responses"`
	LastEdited        string              `json:"last_edited"`
}

type QuestionResponse struct {
	QuestionId string `json:"question_id"`
	Question   string `json:"question"`
	Response   string `json:"response"`
}

const (
	feedbackRequestsDir  = "data/feedback/requests"
	feedbackResponsesDir = "data/feedback/responses"
	feedbackContentDir   = "data/feedback/content"
)

func uniqueRequest(requests []FeedbackRequest, toUserId, outfitId string) bool {
	for _, r := range requests {
		if r.ToUserId == toUserId {
			if r.OutfitId == outfitId {
				return false
			}
		}
	}

	return true
}

func toGetFeedbackResponse(ctx context.Context, bucket *gcs.BucketHandle, requests []FeedbackRequest, idToUsername map[string]string) ([]GetFeedbackResponse, error) {
	responses := []GetFeedbackResponse{}

	for _, request := range requests {
		bytes, err := readObjectBytes(ctx, bucket, "data/outfits/"+request.OutfitId+".json")
		if err != nil {
			return nil, err
		}

		var outfit Outfit
		if err := json.Unmarshal(bytes, &outfit); err != nil {
			return nil, err
		}

		bytes, err = readObjectBytes(ctx, bucket, joinPaths(feedbackContentDir, request.RequestId))
		if err != nil {
			return nil, err
		}

		var content FeedbackContent
		if err := json.Unmarshal(bytes, &content); err != nil {
			return nil, err
		}

		toUsername, ok := idToUsername[request.ToUserId]
		if !ok {
			continue
		}

		resp := GetFeedbackResponse{
			RequestId:         request.RequestId,
			Outfit:            &outfit,
			RequestDate:       request.RequestDate,
			ToUsername:        toUsername,
			QuestionResponses: content.QuestionResponses,
		}

		responses = append(responses, resp)

	}

	return responses, nil
}

func getFeedbackRequestsByUser(ctx context.Context, bucket *gcs.BucketHandle, userId string) ([]FeedbackRequest, error) {
	obj := bucket.Object(joinPaths(feedbackRequestsDir, userId))
	reader, err := obj.NewReader(ctx)
	if err != nil {
		// doesn't exist, just return default one.
		if strings.Contains(err.Error(), "exist") {
			return []FeedbackRequest{}, nil
		}

		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var data []FeedbackRequest
	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func getFeedbackResponseByUser(ctx context.Context, bucket *gcs.BucketHandle, userId string) ([]FeedbackResponse, error) {
	obj := bucket.Object(joinPaths(feedbackResponsesDir, userId))
	reader, err := obj.NewReader(ctx)
	if err != nil {
		// doesn't exist, just return default one.
		if strings.Contains(err.Error(), "exist") {
			return []FeedbackResponse{}, nil
		}

		return nil, err
	}
	defer reader.Close()

	bytes, err := io.ReadAll(reader)
	if err != nil {
		return nil, err
	}

	var data []FeedbackResponse
	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	return data, nil
}

func toFeedbackRequest(req *GetFeedbackRequest, fromUser, toUser string) *FeedbackRequest {
	return &FeedbackRequest{
		RequestId:      uuid(),
		RequestDate:    timeNow(),
		RequestType:    "outfit",
		OutfitId:       req.OutfitId,
		FromUserId:     fromUser,
		ToUserId:       toUser,
		ExpirationDate: req.ExpirationDate,
	}
}

func toFeedbackResponse(req *FeedbackRequest) *FeedbackResponse {
	return &FeedbackResponse{
		RequestId:    req.RequestId,
		FromUserId:   req.FromUserId,
		ToUserId:     req.ToUserId,
		OutfitId:     req.OutfitId,
		Accepted:     false,
		ResponseDate: "",
	}
}

func toFeedbackContent(req *FeedbackRequest, questions []string) *FeedbackContent {
	questionResponses := []*QuestionResponse{}
	for _, q := range questions {
		qr := &QuestionResponse{
			QuestionId: uuid(),
			Question:   q,
			Response:   "",
		}

		questionResponses = append(questionResponses, qr)
	}

	return &FeedbackContent{
		RequestId:         req.RequestId,
		QuestionResponses: questionResponses,
		LastEdited:        "",
	}
}
