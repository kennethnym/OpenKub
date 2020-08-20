package auth

import (
	"fmt"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	"github.com/MrCreeper1008/OpenKub/internal/service"
	"github.com/go-pg/pg/v10"
	"github.com/go-redis/redis/v8"
	socketio "github.com/googollee/go-socket.io"
	"golang.org/x/crypto/bcrypt"
)

// AuthenticateSocket authenticates a socket connection
func AuthenticateSocket(c socketio.Conn, username string, password string) {
	fmt.Printf("authentication requested for %v\n", username)

	ctx := c.Context().(map[string]interface{})
	db := ctx[ctxval.DbClient].(*pg.DB)

	playerObj := &player.Player{}
	playerModel := db.Model(playerObj)
	exists, err := playerModel.Where("username = ?", username).Exists()

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit("exception", map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	if !exists {
		c.Emit("unauthenticated", map[string]string{
			"error": playerNotRegistered,
		})
		return
	}

	err = playerModel.Where("username = ?", username).Select()

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit("exception", map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(playerObj.Password), []byte(password))

	fmt.Printf("compared password\n")

	if err != nil {
		c.Emit("unauthenticated", map[string]string{
			"error": incorrectPassword,
		})
		return
	}

	fmt.Printf("successful authentication\n")

	ctx[ctxval.UserID] = playerObj.ID

	redisClient := ctx[ctxval.RedisClient].(*redis.Client)

	// check if this player is already online
	isOnline, err := redisClient.SIsMember(service.RedisCtx, service.RedisKeyOnlinePlayer, playerObj.ID).Result()

	fmt.Println("askdjaskjdkasjdkasjk")

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit("exception", map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	fmt.Println("askdjaskjdkasjdkasjk")

	if isOnline {
		c.Emit("unauthenticated", map[string]string{
			"error": playerAlreadyOnline,
		})
		return
	}

	err = redisClient.SAdd(service.RedisCtx, service.RedisKeyOnlinePlayer, playerObj.ID).Err()

	if err != nil {
		c.Emit("exception", map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	// remove this socket from the set of unauthenticated connections
	// to prevent it from being automatically disconnected
	delete(ctx[ctxval.UnauthenticatedConn].(map[string]socketio.Conn), c.ID())
	c.Emit("authenticated")
}
