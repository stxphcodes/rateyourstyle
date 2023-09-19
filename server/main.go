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
		cfg Config
	)
	flag.StringVar(&cfg.HttpAddr, "http.addr", "0.0.0.0:8000", "HTTP bind address.")
	flag.StringVar(&cfg.HealthAddr, "health.addr", "0.0.0.0:8001", "HTTP health address.")
	flag.StringVar(&cfg.CORSOrigins, "cors.origin", "*", "CORS origins, separated by ,")
	flag.StringVar(&cfg.GCS.CredsPath, "gcs.creds", "", "Path to GCS credentials file")
	flag.StringVar(&cfg.GCS.BucketName, "gcs.bucket", "rateyourstyle", "Name of GCS bucket")

	flag.Parse()

	if err := validateConfig(&cfg); err != nil {
		return err
	}

	// open sqlite
	// db, err := sql.Open("sqlite3", "rateyourstyle.db")
	// if err != nil {
	// 	return err
	// }

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

	mux.GET("/outfits", handler.GetOutfits())

	mux.GET("/imgs/:path", func(ctx echo.Context) error {
		img := ctx.Param("path")
		return ctx.File(`data/imgs/` + img)
	})

	mux.GET("/cookie", handler.GetCookie())

	mux.GET("/discover", func(ctx echo.Context) error {
		bytes, err := os.ReadFile("data/discover.json")
		if err != nil {
			return ctx.JSON(500, err.Error())
		}

		var a []interface{}
		if err := json.Unmarshal(bytes, &a); err != nil {
			return ctx.JSON(500, err.Error())
		}

		return ctx.JSON(200, a)
	})

	mux.POST("/username", handler.GetUsername())

	mux.POST("/user", handler.PostUser())

	return mux.Start(cfg.HttpAddr)
}

func validateConfig(cfg *Config) error {
	if cfg.GCS.CredsPath == "" {
		return fmt.Errorf("Missing gcs creds path")
	}

	if cfg.GCS.BucketName == "" {
		return fmt.Errorf("Missing gcs bucket name")
	}

	return nil
}

func initiateIndices(ctx context.Context, h *Handler) error {
	userIndices, err := createUserIndices(ctx, h.Gcs.Client, h.Gcs.Bucket)
	if err != nil {
		return err
	}

	outfitIndices, err := createOutfitIndices(ctx, h.Gcs.Client, h.Gcs.Bucket)
	if err != nil {
		return err
	}

	h.UserIndices = userIndices
	h.OutfitIndices = outfitIndices
	return nil
}
