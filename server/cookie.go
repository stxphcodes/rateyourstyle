package main

import (
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"time"
)

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func uuid() string {
	b := make([]byte, 16)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}

	return string(b)
}

func getCookie(request *http.Request) (string, error) {
	cookie := ""
	for key, value := range request.Header {
		if strings.ToLower(key) == "rys-login" {
			cookie = value[0]
		}
	}

	if cookie == "" {
		return "", fmt.Errorf("rys-login header not found")
	}

	return cookie, nil
}

func createCookieStr(cookie string) string {
	return fmt.Sprintf(
		"rys-login=%s;expires=%s",
		cookie,
		time.Now().Add(time.Minute*525600).String(),
	)
}