package main

import (
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo"
)

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

func getFeedbackRequests() {

}

func (h Handler) PostFeedback() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, ok := h.UserIndices.CookieId[cookie]
		if !ok {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		var data FeedbackRequest
		if err := ctx.Bind(&data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}
		data.RequestId = uuid()
		data.RequestDate = timeNow()

		path := joinPaths(feedbackRequestDir, data.FromUserId)

		obj := h.Gcs.Bucket.Object(joinPaths(outfitItemsDir, data.Id))
		_, err = obj.Attrs(ctx.Request().Context())
		if err != nil {
			if strings.Contains(err.Error(), "exist") {
				// can only edit item that exists.
				return ctx.NoContent(http.StatusConflict)
			}

			// not sure what the error is
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer := obj.NewWriter(ctx.Request().Context())
		defer writer.Close()

		if err := json.NewEncoder(writer).Encode(data); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		writer.Close()

		return ctx.NoContent(http.StatusCreated)
	}
}
