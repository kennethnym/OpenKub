package service

import (
	"context"
	"os"

	"github.com/go-redis/redis/v8"
)

// RedisCtx is used for redis operations
var RedisCtx = context.Background()

// === BELOW DEFINES KEYS USED TO ACCESS VALUES IN REDIS === \\

// RedisKeyOnlinePlayer is used to access all online players
const RedisKeyOnlinePlayer = "online_players"

// === END === \\
//
//

// InitializeRedis connects to an existing redis server and initializes a new redis client
func InitializeRedis() *redis.Client {
	opt, err := redis.ParseURL(os.Getenv("REDIS_URL"))

	if err != nil {
		panic(err)
	}

	// need to set username to an empty string
	// related issue: https://github.com/go-redis/redis/issues/1343
	opt.Username = ""
	c := redis.NewClient(opt)

	return c
}
