package main

type FeedbackRequest struct {
	RequestId      string `json:"request_id"`
	RequestType    string `json:"request_type"`
	RequestDate    string `json:"request_date"`
	OutfitId       string `json:"outfit_id"`
	FromUserId     string `json:"from_userid"`
	ToUserId       string `json:"to_userid"`
	ExpirationDate string `json:"expiration_date"`
}

type FeedbackRequestResp struct {
	Request      *FeedbackRequest
	FromUsername string
	ToUsername   string
}

type FeedbackResponse struct {
	RequestId    string
	Accepted     bool
	ResponseDate string
}

type FeedbackContent struct {
	RequestId         string
	QuestionResponses []*QuestionResponse
	LastEdited        string
}

type QuestionResponse struct {
	QuestionId string
	Question   string
	Response   string
}

const (
	feedbackRequestDir  = "data/feedback/requests"
	feedbackResponseDir = "data/feedback/responses"
	feedbackContentDir  = "data/feedback/content"
)
