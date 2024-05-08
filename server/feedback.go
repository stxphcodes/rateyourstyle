package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"strings"

	gcs "cloud.google.com/go/storage"
)

type GetFeedbackRequestsResponse struct {
	RequestId      string  `json:"request_id"`
	RequestDate    string  `json:"request_date"`
	ToUsername     string  `json:"to_username"`
	FromUsername   string  `json:"from_username"`
	Outfit         *Outfit `json:"outfit"`
	Accepted       bool    `json:"accepted"`
	AcceptanceDate string  `json:"acceptance_date"`
	ResponseDate   string  `json:"response_date"`
}

type GetFeedbackResponse struct {
	RequestId         string              `json:"request_id"`
	FromUsername      string              `json:"from_username"`
	ToUsername        string              `json:"to_username"`
	RequestDate       string              `json:"request_date"`
	Accepted          bool                `json:"accepted"`
	AcceptanceDate    string              `json:"acceptance_date"`
	ResponseDate      string              `json:"response_date"`
	QuestionResponses []*QuestionResponse `json:"question_responses"`
	LastEdited        string              `json:"last_edited"`

	Outfit *OutfitResponse `json:"outfit"`
}

type PostFeedbackRequest struct {
	ToUsername string   `json:"to_username"`
	OutfitId   string   `json:"outfit_id"`
	Questions  []string `json:"questions"`
}

type FeedbackRequest struct {
	RequestId   string `json:"request_id"`
	FromUserId  string `json:"from_userid"`
	ToUserId    string `json:"to_userid"`
	OutfitId    string `json:"outfit_id"`
	RequestDate string `json:"request_date"`
}

type FeedbackResponse struct {
	RequestId   string `json:"request_id"`
	FromUserId  string `json:"from_userid"`
	ToUserId    string `json:"to_userid"`
	OutfitId    string `json:"outfit_id"`
	RequestDate string `json:"request_date"`

	Accepted          bool                `json:"accepted"`
	AcceptanceDate    string              `json:"acceptance_date"`
	ResponseDate      string              `json:"response_date"`
	QuestionResponses []*QuestionResponse `json:"question_responses"`
}

type QuestionResponse struct {
	QuestionId string `json:"question_id"`
	Question   string `json:"question"`
	Response   string `json:"response"`
}

const (
	feedbackOutgoingDir  = "data/feedback/outgoing"
	feedbackIncomingDir  = "data/feedback/incoming"
	feedbackResponsesDir = "data/feedback/responses"
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

func toGetFeedbackResponse(ctx context.Context, bucket *gcs.BucketHandle, response *FeedbackResponse, idToUsername map[string]string) (*GetFeedbackResponse, error) {
	outfit, err := getOutfit(ctx, bucket, idToUsername, response.OutfitId)
	if err != nil {
		return nil, err
	}

	toUsername, ok := idToUsername[response.ToUserId]
	if !ok {
		return nil, fmt.Errorf("user not found ", response.ToUserId)
	}

	fromUsername, ok := idToUsername[response.FromUserId]
	if !ok {
		return nil, fmt.Errorf("user not found ", response.FromUserId)
	}

	resp := GetFeedbackResponse{
		RequestId:         response.RequestId,
		ToUsername:        toUsername,
		FromUsername:      fromUsername,
		RequestDate:       response.RequestDate,
		Accepted:          response.Accepted,
		AcceptanceDate:    response.AcceptanceDate,
		ResponseDate:      response.ResponseDate,
		QuestionResponses: response.QuestionResponses,
		Outfit:            outfit,
	}

	return &resp, nil
}

func toGetFeedbackRequestsResponse(ctx context.Context, bucket *gcs.BucketHandle, requests []FeedbackRequest, idToUsername map[string]string) ([]GetFeedbackRequestsResponse, error) {
	responses := []GetFeedbackRequestsResponse{}

	for _, request := range requests {
		bytes, err := readObjectBytes(ctx, bucket, "data/outfits/"+request.OutfitId+".json")
		if err != nil {
			return nil, err
		}

		var outfit Outfit
		if err := json.Unmarshal(bytes, &outfit); err != nil {
			return nil, err
		}

		bytes, err = readObjectBytes(ctx, bucket, joinPaths(feedbackResponsesDir, request.RequestId))
		if err != nil {
			return nil, err
		}

		var feedbackResp FeedbackResponse
		if err := json.Unmarshal(bytes, &feedbackResp); err != nil {
			return nil, err
		}

		toUsername, ok := idToUsername[request.ToUserId]
		if !ok {
			continue
		}

		fromUsername, ok := idToUsername[request.FromUserId]
		if !ok {
			continue
		}

		resp := GetFeedbackRequestsResponse{
			RequestId:      request.RequestId,
			ToUsername:     toUsername,
			FromUsername:   fromUsername,
			RequestDate:    request.RequestDate,
			Outfit:         &outfit,
			Accepted:       feedbackResp.Accepted,
			AcceptanceDate: feedbackResp.AcceptanceDate,
			ResponseDate:   feedbackResp.ResponseDate,
		}

		responses = append(responses, resp)
	}

	return responses, nil
}

func getFeedbackResponse(ctx context.Context, bucket *gcs.BucketHandle, requestId string) (*FeedbackResponse, error) {
	bytes, err := readObjectBytes(ctx, bucket, joinPaths(feedbackResponsesDir, requestId))
	if err != nil {
		return nil, err
	}

	var data FeedbackResponse
	if err := json.Unmarshal(bytes, &data); err != nil {
		return nil, err
	}

	return &data, nil
}

func getOutgoingFeedbackByUser(ctx context.Context, bucket *gcs.BucketHandle, userId string) ([]FeedbackRequest, error) {
	obj := bucket.Object(joinPaths(feedbackOutgoingDir, userId))
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

func getIncomingFeedbackByUser(ctx context.Context, bucket *gcs.BucketHandle, userId string) ([]FeedbackRequest, error) {
	obj := bucket.Object(joinPaths(feedbackIncomingDir, userId))
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

func toFeedbackRequest(req *PostFeedbackRequest, fromUser, toUser string) *FeedbackRequest {
	return &FeedbackRequest{
		RequestId:   uuid(),
		RequestDate: timeNow(),
		OutfitId:    req.OutfitId,
		FromUserId:  fromUser,
		ToUserId:    toUser,
	}
}

func toFeedbackResponse(req *FeedbackRequest, questions []string) *FeedbackResponse {
	questionResponses := []*QuestionResponse{}
	for _, q := range questions {
		qr := &QuestionResponse{
			QuestionId: uuid(),
			Question:   q,
			Response:   "",
		}

		questionResponses = append(questionResponses, qr)
	}

	return &FeedbackResponse{
		RequestId:   req.RequestId,
		FromUserId:  req.FromUserId,
		ToUserId:    req.ToUserId,
		OutfitId:    req.OutfitId,
		RequestDate: req.RequestDate,

		Accepted:          false,
		AcceptanceDate:    "",
		ResponseDate:      "",
		QuestionResponses: questionResponses,
	}
}
