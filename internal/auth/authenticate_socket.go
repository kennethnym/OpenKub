package auth

import (
	"fmt"
	"strconv"

	"github.com/go-pg/pg/v10"
	"github.com/go-redis/redis/v8"
	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/errcode"
	"github.com/kennethnym/OpenKub/internal/player"
	"github.com/kennethnym/OpenKub/internal/service"
	"golang.org/x/crypto/bcrypt"
)

// AuthenticateSocket authenticates a socket connection
func AuthenticateSocket(c socketio.Conn, username string, password string) {
	fmt.Printf("authentication requested for %v\n", username)

	ctx := c.Context().(map[string]interface{})
	db := ctx[ctxval.DbClient].(*pg.DB)

	playerObj := player.Player{}
	playerModel := db.Model(&playerObj)
	exists, err := playerModel.Where("username = ?", username).Exists()

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit("exception", map[string]string{
			"event": "authentication",
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
			"event": "authentication",
			"error": errcode.UnexpectedError,
		})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(playerObj.Password), []byte(password))

	fmt.Printf("compared password\n")

	if err != nil {
		c.Emit("unauthenticated", map[string]string{
			"event": "authentication",
			"error": incorrectPassword,
		})
		return
	}

	fmt.Printf("successful authentication\n")

	ctx[ctxval.Player] = playerObj

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit("exception", map[string]string{
			"event": "authentication",
			"error": errcode.UnexpectedError,
		})
		return
	}

	redisClient := ctx[ctxval.RedisClient].(*redis.Client)

	err = redisClient.SAdd(service.RedisCtx, service.RedisKeyOnlinePlayer, playerObj.ID).Err()

	if err != nil {
		c.Emit("exception", map[string]string{
			"event": "authentication",
			"error": errcode.UnexpectedError,
		})
		return
	}

	// remove this socket from the set of unauthenticated connections
	// to prevent it from being automatically disconnected
	delete(ctx[ctxval.UnauthenticatedConns].(map[string]UnauthenticatedConn), c.ID())
	(ctx[ctxval.ActiveConns].(map[int]socketio.Conn))[playerObj.ID] = c

	server := ctx[ctxval.SocketServer].(*socketio.Server)

	c.Emit("authenticated")
	server.BroadcastToRoom("/", "all", strconv.Itoa(playerObj.ID)+"_connected")
	c.Join("all")
}
