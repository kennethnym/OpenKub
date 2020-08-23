package game

import (
	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	socketio "github.com/googollee/go-socket.io"
)

func kickPlayer(c socketio.Conn, roomID string, playerID int) {
	ctx := c.Context().(map[string]interface{})
	activeGames := ctx[ctxval.ActiveGames].(map[string]*Room)
	// the socket connection of the kicked player
	kickedPlayerConn := ctx[ctxval.ActiveConns].(map[int]socketio.Conn)[playerID]
	players := activeGames[roomID].Players

	if _, inRoom := players[playerID]; !inRoom {
		c.Emit("exception", map[string]string{
			"event": "kick_player",
			"error": playerNotInRoom,
		})
		return
	}

	delete(activeGames[roomID].Players, playerID)
	delete(activeGames[roomID].PlayersReady, playerID)

	server := ctx[ctxval.SocketServer].(*socketio.Server)

	kickedPlayerConn.Leave(roomID)
	(kickedPlayerConn.Context().(map[string]interface{}))[ctxval.InGameRoomID] = ""
	// tell the player that they are kicked
	kickedPlayerConn.Emit("kicked_from_game")
	server.BroadcastToRoom("/", roomID, roomID+":kick_player", playerID)
}
