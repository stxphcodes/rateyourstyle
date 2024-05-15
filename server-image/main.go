package main

import (
	"context"
	"flag"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	gcs "cloud.google.com/go/storage"
	"github.com/heptiolabs/healthcheck"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
	"google.golang.org/api/option"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}

}

func run() error {
	var (
		httpAddr   string
		healthAddr string
		cors       string
		gcsCreds   string
		gcsBucket  string
	)

	flag.StringVar(&httpAddr, "http.addr", "0.0.0.0:8002", "HTTP bind address.")
	flag.StringVar(&healthAddr, "health.addr", "0.0.0.0:8003", "HTTP health address.")
	flag.StringVar(&cors, "cors.origin", "*", "CORS origins, separated by ,")
	flag.StringVar(&gcsCreds, "gcs.creds", "", "Path to GCS credentials file")
	flag.StringVar(&gcsBucket, "gcs.bucket", "rateyourstyle-dev", "Name of GCS bucket")

	flag.Parse()

	// authenticate to gcs
	ctx := context.Background()
	gcsClient, err := gcs.NewClient(ctx, option.WithCredentialsFile(gcsCreds))
	if err != nil {
		log.Println("error connecting to gcs")
		return err
	}
	bucket := gcsClient.Bucket(gcsBucket)

	// Configure and start /live and /ready check handling.
	health := healthcheck.NewHandler()
	// Check for resource leaks (also indicates basic responsiveness).
	health.AddLivenessCheck("goroutine-threshold", healthcheck.GoroutineCountCheck(100))
	go http.ListenAndServe(healthAddr, health)

	// Setup HTTP server.
	server := echo.New()
	server.Pre(middleware.RemoveTrailingSlash())
	server.Use(middleware.Logger())
	corsConfig := middleware.DefaultCORSConfig
	corsConfig.AllowOrigins = strings.Split(cors, ",")
	server.Use(middleware.CORSWithConfig(corsConfig))

	// For gke ingress health check
	server.GET("/", func(ctx echo.Context) error {
		return ctx.JSON(200, nil)
	})

	server.POST("/api/image", PostImage(gcsClient, bucket))

	return server.Start(httpAddr)
}

func PostImage(gcs *gcs.Client, bucket *gcs.BucketHandle) echo.HandlerFunc {
	return func(ctx echo.Context) error {
		cookie, err := getCookie(ctx.Request())
		if err != nil {
			log.Println("error retrieving cookie")
			return ctx.NoContent(http.StatusForbidden)
		}

		userId, err := getUserId(ctx.Request().Context(), bucket, cookie)
		if err != nil {
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if userId == "" {
			log.Println("user id not found based on cookie " + cookie)
			return ctx.NoContent(http.StatusForbidden)
		}

		file, err := ctx.FormFile("file")
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpeg" && ext != ".jpg" && ext != ".png" {
			return ctx.NoContent(http.StatusBadRequest)
		}

		filename := uuid()
		tmpPath := "/tmp/" + filename + ext
		gcsFullPath := filepath.Join("imgs", "outfits", userId, filename+ext)
		gcsResizedPath := filepath.Join("imgs", "outfits", userId, filename+"-w600"+ext)

		if err := createTempImage(file, tmpPath); err != nil {
			log.Println("error creating temp image", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if err := removeImageMetadata(tmpPath); err != nil {
			log.Println("error removing location data", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if err := createImage(ctx.Request().Context(), bucket, tmpPath, gcsFullPath); err != nil {
			log.Println("error creating image in gcp ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		if err := createResizeImage(ctx.Request().Context(), bucket, gcsFullPath, gcsResizedPath); err != nil {
			log.Println("error creating resized img ", err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		// not returning any errors, just log if error occurs
		cleanupTempImages(tmpPath)

		attr, err := bucket.Attrs(ctx.Request().Context())
		if err != nil {
			log.Println(err.Error())
			return ctx.NoContent(http.StatusInternalServerError)
		}

		url := "https://storage.googleapis.com/" + attr.Name + "/" + gcsFullPath
		return ctx.String(http.StatusCreated, url)
	}
}
