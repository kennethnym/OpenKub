package game

import (
	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
)

// playerReady is called when socket emits "player_ready"
func playerReady(c socketio.Conn, roomID string, playerID int) {
	ctx := c.Context().(map[string]interface{})
	room := ctx[ctxval.ActiveGames].(map[string]*Room)[roomID]
	server := ctx[ctxval.SocketServer].(*socketio.Server)

	room.PlayersReady[playerID] = true
	server.BroadcastToRoom("/", roomID, roomID+":player_ready", playerID)
}
