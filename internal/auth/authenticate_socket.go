package auth

import (
	"fmt"
	"github.com/kennethnym/OpenKub/internal/service"
	"github.com/kennethnym/OpenKub/internal/socket"
	"strconv"

	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/errcode"
	"github.com/kennethnym/OpenKub/internal/player"
	"golang.org/x/crypto/bcrypt"
)

// AuthenticateSocket authenticates a socket connection
func AuthenticateSocket(c socketio.Conn, username string, password string) {
	fmt.Printf("authentication requested for %v\n", username)

	ctx := c.Context().(ctxval.SocketContext)
	db := service.GetDbClient(ctx)

	playerObj := player.Player{}
	playerModel := db.Model(&playerObj)
	exists, err := playerModel.Where("username = ?", username).Exists()

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit(socket.EventException, map[string]string{
			"event": socket.EventAuthentication,
			"error": errcode.UnexpectedError,
		})
		return
	}

	if !exists {
		c.Emit(socket.EventUnauthenticated, map[string]string{
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

	fmt.Println("successful authentication")

	player.SetCurrentPlayer(ctx, playerObj)

	if err != nil {
		fmt.Printf("err %v\n", err)
		c.Emit(socket.EventException, map[string]string{
			"event": socket.EventAuthentication,
			"error": errcode.UnexpectedError,
		})
		return
	}

	player.AddOnlinePlayer(ctx, playerObj)

	if err != nil {
		c.Emit(socket.EventException, map[string]string{
			"event": socket.EventAuthentication,
			"error": errcode.UnexpectedError,
		})
		return
	}

	stopAuthTimer(ctx, c)
	socket.AddActiveConnection(ctx, playerObj, c)

	server := socket.GetSocketServer(ctx)

	c.Emit(socket.EventAuthenticated)
	server.BroadcastToRoom("/", "all", strconv.Itoa(playerObj.ID)+"_connected")
	c.Join("all")
}

// stopAuthTimer removes the given socket from the set of unauthenticated connections
// to prevent it from being automatically disconnected
func stopAuthTimer(ctx ctxval.SocketContext, conn socketio.Conn) {
	delete(ctx[ctxval.UnauthenticatedConns].(map[string]socket.UnauthenticatedConn), conn.ID())
}
