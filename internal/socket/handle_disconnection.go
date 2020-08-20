package socket

import (
	"fmt"
	"time"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/service"
	"github.com/go-redis/redis/v8"
	socketio "github.com/googollee/go-socket.io"
)

// handleDisconnection handles socket disconnection event
func handleDisconnection(c socketio.Conn, reason string) {
	fmt.Printf("socket %v disconnected: \n", c.ID())
	fmt.Println("reason: " + reason)

	ctx := c.Context().(map[string]interface{})

	if playerID, ok := ctx[ctxval.UserID]; ok {
		fmt.Printf("player %v going offline...\n", playerID)

		redisClient := ctx[ctxval.RedisClient].(*redis.Client)
		retryTicker := time.NewTicker(time.Second * 5)

		go func() {
			for {
				<-retryTicker.C

				err := redisClient.SRem(service.RedisCtx, service.RedisKeyOnlinePlayer, playerID).Err()

				if err == nil {
					retryTicker.Stop()
					break
				}
			}
		}()
	}
}
