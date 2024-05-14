package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	gcs "cloud.google.com/go/storage"
	"github.com/heptiolabs/healthcheck"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	_ "github.com/mattn/go-sqlite3"
	"google.golang.org/api/option"
)

type Config struct {
	HttpAddr    string
	HealthAddr  string
	CORSOrigins string

	Firestore struct {
		CredsPath string
		ProjectId string
	}
	GCS struct {
		CredsPath  string
		BucketName string
	}
}

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}

}

func run() error {
	var (
		cfg           Config
		campaignsPath string
	)
	flag.StringVar(&cfg.HttpAddr, "http.addr", "0.0.0.0:8000", "HTTP bind address.")
	flag.StringVar(&cfg.HealthAddr, "health.addr", "0.0.0.0:8001", "HTTP health address.")
	flag.StringVar(&cfg.CORSOrigins, "cors.origin", "*", "CORS origins, separated by ,")
	flag.StringVar(&cfg.GCS.CredsPath, "gcs.creds", "", "Path to GCS credentials file")
	flag.StringVar(&cfg.GCS.BucketName, "gcs.bucket", "rateyourstyle-dev", "Name of GCS bucket")
	flag.StringVar(&campaignsPath, "campaigns.path", "campaigns.json", "Path to campaigns file")
	flag.Parse()

	if err := validateConfig(&cfg); err != nil {
		return err
	}

	// authenticate to gcs
	ctx := context.Background()
	gcsClient, err := gcs.NewClient(ctx, option.WithCredentialsFile(cfg.GCS.CredsPath))
	if err != nil {
		return err
	}

	handler := Handler{}
	handler.Gcs.Client = gcsClient
	handler.Gcs.Bucket = gcsClient.Bucket(cfg.GCS.BucketName)

	if err := initiateIndices(ctx, &handler); err != nil {
		return err
	}

	// Configure and start /live and /ready check handling.
	health := healthcheck.NewHandler()
	// Check for resource leaks (also indicates basic responsiveness).
	health.AddLivenessCheck("goroutine-threshold", healthcheck.GoroutineCountCheck(100))
	go http.ListenAndServe(cfg.HealthAddr, health)

	// Setup HTTP server.
	mux := echo.New()
	mux.Pre(middleware.RemoveTrailingSlash())
	mux.Use(middleware.Logger())
	cors := middleware.DefaultCORSConfig
	cors.AllowOrigins = strings.Split(cfg.CORSOrigins, ",")
	mux.Use(middleware.CORSWithConfig(cors))

	// For gke ingress health check
	mux.GET("/", func(ctx echo.Context) error {
		return ctx.JSON(200, nil)
	})

	mux.GET("/api/campaigns", func(ctx echo.Context) error {
		bytes, err := os.ReadFile(campaignsPath)
		if err != nil {
			log.Println(err.Error())
			return ctx.JSON(500, err.Error())
		}

		var a []interface{}
		if err := json.Unmarshal(bytes, &a); err != nil {
			log.Println(err.Error())
			return ctx.JSON(500, err.Error())
		}

		return ctx.JSON(200, a)
	})

	mux.GET("/api/cookie", handler.GetCookie())

	mux.GET("/api/outgoing-feedback", handler.GetOutgoingFeedback())

	mux.GET("/api/incoming-feedback", handler.GetIncomingFeedback())

	mux.GET("/api/feedback/:feedbackid", handler.GetFeedback())

	mux.GET("/api/outfit/:outfitid", handler.GetOutfit())

	mux.GET("/api/outfits", handler.GetOutfits())

	mux.GET("/api/ratings", handler.GetRatingsByUser())

	mux.GET("/api/ratings/:outfitid", handler.GetRatingsByOutfit())

	mux.GET("/api/replies/:outfitid/:userid", handler.GetReplies())

	mux.GET("/api/user/outfits", handler.GetOutfitsByUser())

	mux.GET("/api/user/public-outfits", handler.GetPublicOutfitsByUser())

	mux.GET("/api/user", handler.GetUser())

	mux.GET("/api/user/:username", handler.GetUserByUsername())

	mux.GET("/api/username", handler.GetUsername())

	mux.GET("/api/username-notifications", handler.GetUsernameAndNotifications())

	mux.GET("/api/notifications", handler.GetNotifications())

	// mux.POST("/api/image", handler.PostImage())

	mux.POST("/api/outfit", handler.PostOutfit())

	mux.POST("/api/rating", handler.PostRating())

	mux.POST("/api/reply", handler.PostReply())

	mux.POST("/api/signin", handler.PostSignIn())

	mux.POST("/api/user", handler.PostUser())

	mux.POST("/api/user-profile", handler.PostUserProfile())

	mux.POST("/api/user-general", handler.PostUserGeneral())

	mux.POST("/api/business-outfits", handler.PostBusinessOutfit())

	mux.POST("/api/closet-request", handler.PostClosetRequest())

	mux.POST("/api/feedback-request", handler.PostFeedbackRequest())

	mux.POST("/api/feedback-acceptance/:feedbackid", handler.PostFeedbackAcceptance())

	mux.POST("/api/feedback-response/:feedbackid", handler.PostFeedbackResponse())

	mux.PUT("/api/outfit-item", handler.PutOutfitItem())

	return mux.Start(cfg.HttpAddr)
}

func validateConfig(cfg *Config) error {
	if cfg.GCS.CredsPath == "" {
		return fmt.Errorf("missing gcs creds path")
	}

	if cfg.GCS.BucketName == "" {
		return fmt.Errorf("missing gcs bucket name")
	}

	return nil
}

func initiateIndices(ctx context.Context, h *Handler) error {
	fmt.Println("initiaitng indicies")
	userIndices, err := createUserIndices(ctx, h.Gcs.Client, h.Gcs.Bucket)
	if err != nil {
		return err
	}

	fmt.Println("created user indices")

	outfitIndices, err := createOutfitIndices(ctx, h.Gcs.Client, h.Gcs.Bucket)
	if err != nil {
		return err
	}

	fmt.Println("created outfit indices")

	ratingIndices, err := createRatingIndices(ctx, h.Gcs.Client, h.Gcs.Bucket)
	if err != nil {
		return err
	}
	fmt.Println("created rating indices")

	notificationIndices, err := createNotificationIndices(ctx, h.Gcs.Bucket)
	if err != nil {
		return err
	}
	fmt.Println("created notifications indices")

	h.UserIndices = userIndices
	h.OutfitIndices = outfitIndices
	h.RatingIndices = ratingIndices
	h.NotificationIndices = notificationIndices

	return nil
}
