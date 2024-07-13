package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/smtp"
	"os"

	"github.com/labstack/echo"
)

const mimeHeaders = "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
const otpChars = "1234567890"

type SmtpClient struct {
	auth  smtp.Auth
	email string
	url   string
}

func getSmtpClient(smtpHost, smtpPort, email, passwordFile string) (*SmtpClient, error) {
	password, err := os.ReadFile(passwordFile)
	if err != nil {
		return nil, err
	}

	fmt.Println("this is email")
	fmt.Println(email)
	fmt.Println("this is password")
	fmt.Println(string(password))

	// Authentication.
	return &SmtpClient{
		auth:  smtp.PlainAuth("", email, string(password), smtpHost),
		email: email,
		url:   smtpHost + ":" + smtpPort,
	}, nil
}

func sendEmail(smtpClient *SmtpClient, templateFile, subject, to string, data interface{}) error {
	t, err := template.ParseFiles(templateFile)
	if err != nil {
		return err
	}

	var body bytes.Buffer
	body.Write([]byte(fmt.Sprintf("Subject: %s\n%s\n\n", subject, mimeHeaders)))
	t.Execute(&body, data)

	// Sending email.
	err = smtp.SendMail(smtpClient.url, smtpClient.auth, smtpClient.email, []string{to}, body.Bytes())
	if err != nil {
		return err
	}

	return nil
}

func handleSendVerification(smtpClient *SmtpClient) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		var m map[string]string
		if err := json.NewDecoder(ctx.Request().Body).Decode(&m); err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusBadRequest)
		}

		to, ok := m["email"]
		if !ok {
			return ctx.NoContent(http.StatusBadRequest)
		}

		username, ok := m["username"]
		if !ok {
			return ctx.NoContent(http.StatusBadRequest)
		}

		t, _ := template.ParseFiles("template.html")
		var body bytes.Buffer
		body.Write([]byte(fmt.Sprintf("Subject: RateYourStyle Verification\n%s\n\n", mimeHeaders)))

		t.Execute(&body, struct {
			Username string
			Code     string
		}{
			Username: username,
			Code:     "42312",
		})

		// Sending email.
		err := smtp.SendMail(smtpClient.url, smtpClient.auth, smtpClient.email, []string{to}, body.Bytes())
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		needsVerification[username] = generateOTP()

		return ctx.NoContent(http.StatusOK)
	}
}

func handleVerification() echo.HandlerFunc {
	return func(ctx echo.Context) error {
		username := ctx.QueryParam("username")
		otp := ctx.QueryParam("otp")

		if username == "" || otp == "" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		otpSource, ok := needsVerification[username]
		if !ok {
			return ctx.NoContent(http.StatusOK)
		}

		if otpSource == otp {
			delete(needsVerification, username)
			return ctx.NoContent(http.StatusOK)
		}

		return ctx.NoContent(http.StatusForbidden)
	}
}
