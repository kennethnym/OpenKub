package game

import (
	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	socketio "github.com/googollee/go-socket.io"
)

// startGame is called when socket emits "<roomid>:start_game"
func startGame(c socketio.Conn, roomID string) {
	ctx := c.Context().(map[string]interface{})
	server := ctx[ctxval.SocketServer].(*socketio.Server)

	server.BroadcastToRoom("/", roomID, roomID+":start_game")
}
