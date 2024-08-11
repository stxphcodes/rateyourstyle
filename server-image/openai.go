package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type OutfitItem struct {
	Description  string
	HexColorCode string
}

const (
	openAIURL   = "https://api.openai.com/v1/chat/completions"
	openAIModel = "gpt-4o"
	prompt      = "can you describe each clothing item in this image without color, and include the hex color code in a separate field? use this json format without deviation: {'clothingItems': [{'description': 'description of item without color', 'colorHex': 'color hex code'}]}"
)

func postBody(img string) ([]byte, error) {
	m := map[string]interface{}{
		"model":           openAIModel,
		"response_format": map[string]string{"type": "json_object"},
		"messages": []map[string]interface{}{
			{
				"role": "user",
				"content": []map[string]interface{}{
					{
						"type": "text",
						"text": prompt,
					},
					{
						"type": "image_url",
						"image_url": map[string]interface{}{
							"url": img,
						},
					},
				},
			},
		},
	}

	return json.Marshal(m)
}

type OpenAIResponse struct {
	Choices []OpenAIChoice `json:"choices"`
}
type OpenAIChoice struct {
	Message struct {
		Content string
	}
}

type OpenAIContent struct {
	ClothingItems []struct {
		Description string
		ColorHex    string
	}
}

func getOpenAIDescriptions(key, image string) (*OpenAIContent, error) {
	body, err := postBody(image)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, openAIURL, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Add("Content-type", "application/json")
	req.Header.Add("Authorization", "Bearer "+key)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf(string(bytes))
	}

	var m OpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&m); err != nil {
		return nil, err
	}

	content := m.Choices[0].Message.Content

	var c OpenAIContent
	err = json.NewDecoder(bytes.NewReader([]byte(content))).Decode(&c)
	if err != nil {
		return nil, err
	}

	return &c, nil
}
