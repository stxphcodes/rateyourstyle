package main

import (
	"context"
	"flag"
	"log"

	gcs "cloud.google.com/go/storage"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"google.golang.org/api/option"
)

// Sender data.
//from := "rateyourstyle@gmail.com"
//password := "yraj pdnx vyvs dbui"

const (
	ssoState = ""
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}

}

var needsVerification = map[string]string{}

func run() error {
	var (
		httpAddr           string
		rysAddr            string
		ssoCallbackAddr    string
		healthAddr         string
		cors               string
		email              string
		emailPassword      string
		smtpHost           string
		smtpPort           string
		googleAuthClientId string
		googleAuthSecret   string
		gcsCreds           string
		gcsBucket          string
	)

	flag.StringVar(&httpAddr, "http.addr", "0.0.0.0:8003", "HTTP bind address.")
	flag.StringVar(&rysAddr, "rys.addr", "http://localhost:3000", "URL to rateyourstyle")
	flag.StringVar(&ssoCallbackAddr, "sso.addr", "http://localhost:8003/auth/signin/sso/callback", "URL to callback")
	flag.StringVar(&healthAddr, "health.addr", "0.0.0.0:8004", "HTTP health address.")
	flag.StringVar(&cors, "cors.origin", "*", "CORS origins, separated by ,")
	flag.StringVar(&email, "email", "", "Email")
	flag.StringVar(&emailPassword, "email.password", "", "Email password")
	flag.StringVar(&smtpHost, "smtp.host", "smtp.gmail.com", "Smtp")
	flag.StringVar(&smtpPort, "smtp.port", "587", "Smtp port")
	flag.StringVar(&googleAuthClientId, "google.client", "", "Google auth client id")
	flag.StringVar(&googleAuthSecret, "google.secret", "", "Google auth secret")
	flag.StringVar(&gcsCreds, "gcs.creds", "", "Path to gcs creds file")
	flag.StringVar(&gcsBucket, "gcs.bucket", "rateyourstyle-dev", "Name of GCS bucket")
	flag.Parse()

	// authenticate to gcs
	ctx := context.Background()
	gcsClient, err := gcs.NewClient(ctx, option.WithCredentialsFile(gcsCreds))
	if err != nil {
		return err
	}
	bucket := gcsClient.Bucket(gcsBucket)

	// get smtp client
	smtpClient, err := getSmtpClient(smtpHost, smtpPort, email, emailPassword)
	if err != nil {
		return err
	}

	signinOauth := oauthConfig(googleAuthClientId, googleAuthSecret, ssoCallbackAddr)
	// signupOauth := oauthConfig(googleAuthClientId, googleAuthSecret, httpAddr+"/auth/sso/signup/callback")

	// Setup HTTP server.
	server := echo.New()
	server.Pre(middleware.RemoveTrailingSlash())
	server.Use(middleware.Logger())
	corsCfg := middleware.DefaultCORSConfig
	corsCfg.AllowOrigins = []string{"*"}
	server.Use(middleware.CORSWithConfig(corsCfg))

	server.POST("/auth/signin/password", HandlePostPasswordSignIn(bucket))

	server.GET("/auth/signin/otp", HandleOTPSignin(signinOauth, bucket, smtpClient, httpAddr))

	server.POST("/auth/signin/otp", HandlePostOTPSignin(bucket))

	server.GET("/auth/signin/sso", HandleSSOSignin(signinOauth))

	server.GET("/auth/signin/sso/callback", HandleSSOSigninCallback(signinOauth, bucket, rysAddr))

	// server.GET("/auth/signup/sso", HandleSSO(signupOauth))

	// server.GET("/auth/signup/sso/callback", HandleSignupCallback(signupOauth, bucket))

	server.GET("/auth/verification", handleVerification())

	server.POST("/auth/verification", handleSendVerification(smtpClient))

	return server.Start(httpAddr)
}
