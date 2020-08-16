package main

import (
	"log"
	"net/http"

	"github.com/MrCreeper1008/OpenKub/internal/auth"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	"github.com/MrCreeper1008/OpenKub/internal/service"
	"github.com/gin-gonic/contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	initServer()
}

func initServer() {
	// Load .env file
	// Note that this is for development purpose only
	// .env file is not available in prod env
	// and environment variables are defined in heroku
	godotenv.Load()

	router := gin.Default()
	defineRoutes(router)

	err := router.RunTLS(":8080", "certs/dev.crt", "certs/dev.key")

	if err != nil {
		log.Fatal(err)
	}
}

func defineRoutes(router *gin.Engine) {
	router.Use(static.Serve("/", static.LocalFile("./website/build", true)))
	router.Use(cors.New(cors.Config{
		AllowedOrigins:   []string{"http://localhost:3000"},
		AllowCredentials: true,
	}))
	router.Use(service.PostgresMiddleware())
	router.Use(service.RedisMiddleware())

	public := router.Group("/api")

	public.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "OpenKub backend")
	})

	public.POST("/login", auth.LoginHandler)

	api := router.Group("/api")
	api.Use(auth.TokenHandler())

	api.GET("/player", player.GetPlayer)
}
