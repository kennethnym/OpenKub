package main

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	socketio "github.com/googollee/go-socket.io"
	"github.com/joho/godotenv"

	"github.com/kennethnym/OpenKub/internal/auth"
	"github.com/kennethnym/OpenKub/internal/config"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/player"
	"github.com/kennethnym/OpenKub/internal/service"
	"github.com/kennethnym/OpenKub/internal/socket"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	initServer()
}

func initServer() {
	// Load .env file
	// Note that this is for development purpose only
	// .env file is not available in prod env
	// and environment variables are defined in heroku
	godotenv.Load()

	router := gin.Default()

	// initialCtx is the initial context values that both the gin router and the socket.io server require
	initialCtx := initializeContext()

	db := service.InitializePostgres()
	socketServer := socket.Initialize(initialCtx)

	defer socketServer.Close()
	defer db.Close()

	defineRoutes(router, socketServer, initialCtx)

	err := router.Run(":8080")

	if err != nil {
		log.Fatal(err)
	}
}

// initializeContext initializes context values that both the gin router and the socket.io server need
func initializeContext() map[string]interface{} {
	return map[string]interface{}{
		ctxval.DbClient:    service.InitializePostgres(),
		ctxval.RedisClient: service.InitializeRedis(),
	}
}

func defineRoutes(router *gin.Engine, server *socketio.Server, ctx map[string]interface{}) {
	router.Use(static.Serve("/", static.LocalFile("./website/build", true)))
	router.Use(cors.New(cors.Config{
		AllowedOrigins:   []string{config.AllowedOrigin},
		AllowCredentials: true,
	}))
	router.Use(service.InitialContext(ctx))

	public := router.Group("/api")

	// socket.io authenticates with the token given in the initial query
	// instead of using token cookies
	public.GET("/socket/", socket.Handler(server))
	public.GET("/", func(ctx *gin.Context) {
		ctx.String(http.StatusOK, "OpenKub backend")
	})

	public.POST("/register", auth.RegisterHandler)
	public.POST("/login", auth.LoginHandler)

	api := router.Group("/api")
	api.Use(auth.TokenHandler())

	api.GET("/player", player.GetPlayer)
}
