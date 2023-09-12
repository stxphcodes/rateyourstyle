package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/heptiolabs/healthcheck"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

type Config struct {
	HttpAddr    string
	HealthAddr  string
	CORSOrigins string
	Github      struct {
		PersonalAccessToken string
	}
	Youtube struct {
		APIKey string
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
	flag.StringVar(&cfg.Github.PersonalAccessToken, "github.pat", "", "Github personal access token.")
	flag.StringVar(&cfg.Youtube.APIKey, "youtube.api", "", "Youtube API key.")

	flag.Parse()

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

	mux.GET("/outfits", func(ctx echo.Context) error {
		bytes, err := os.ReadFile("data/outfits.json")
		if err != nil {
			return ctx.JSON(500, err.Error())
		}

		var a []interface{}
		if err := json.Unmarshal(bytes, &a); err != nil {
			return ctx.JSON(500, err.Error())
		}

		return ctx.JSON(200, a)
	})

	mux.GET("/imgs/:path", func(ctx echo.Context) error {
		img := ctx.Param("path")
		fmt.Println("this is imgage")
		fmt.Println(img)
		return ctx.File(`data/imgs/` + img)
	})

	mux.GET("/cookie", func(ctx echo.Context) error {
		expiry := time.Now().Add(time.Minute * 525600) // 1 year

		b := make([]byte, 16)
		for i := range b {
			b[i] = letters[rand.Intn(len(letters))]
		}

		ctx.SetCookie(&http.Cookie{
			Domain:   ".app.localhost",
			Name:     "rys_user_id",
			Value:    string(b),
			Expires:  expiry,
			HttpOnly: false,
			Secure:   false,
		})

		return ctx.NoContent(200)
	})

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

	return mux.Start(cfg.HttpAddr)
}
