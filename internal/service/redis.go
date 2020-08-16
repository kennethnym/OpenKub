package service

import (
	"os"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
)

// RedisMiddleware is a gin middleware that
// attaches an instance of redis to gin context
func RedisMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))

		if err != nil {
			panic(err)
		}

		// need to set username to an empty string
		// related issue: https://github.com/go-redis/redis/issues/1343
		opt.Username = ""
		c := redis.NewClient(opt)

		ctx.Set(ctxval.RedisClient, c)
	}
}
