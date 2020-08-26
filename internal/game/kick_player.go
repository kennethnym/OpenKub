package game

import (
	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	socketio "github.com/googollee/go-socket.io"
)

func kickPlayer(c socketio.Conn, roomID string, playerID int) {
	ctx := c.Context().(map[string]interface{})
	activeGames := ctx[ctxval.ActiveGames].(map[string]*Room)
	currentGame := activeGames[roomID]
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

	delete(currentGame.Players, playerID)
	delete(currentGame.PlayersReady, playerID)

	// find the order of the player
	i := 0
	for j, id := range currentGame.PlayersOrder {
		if id == playerID {
			i = j
			break
		}
	}

	currentGame.PlayersOrder = append(
		currentGame.PlayersOrder[:i],
		currentGame.PlayersOrder[i+1:]...,
	)

	server := ctx[ctxval.SocketServer].(*socketio.Server)

	kickedPlayerConn.Leave(roomID)
	(kickedPlayerConn.Context().(map[string]interface{}))[ctxval.InGameRoomID] = ""
	// tell the player that they are kicked
	kickedPlayerConn.Emit("kicked_from_game")
	server.BroadcastToRoom("/", roomID, roomID+":kick_player", playerID)
}
