package game

import (
	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
)

func playerUnready(c socketio.Conn, roomID string, playerID int) {
	ctx := c.Context().(map[string]interface{})
	room := (ctx[ctxval.ActiveGames].(map[string]*Room))[roomID]
	server := ctx[ctxval.SocketServer].(*socketio.Server)

	delete(room.PlayersReady, playerID)

	server.BroadcastToRoom("/", roomID, roomID+":player_unready", playerID)
}
