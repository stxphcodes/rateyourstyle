package main

import (
	"bytes"
	"fmt"
	"html/template"
	"net/smtp"
	"os"
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
