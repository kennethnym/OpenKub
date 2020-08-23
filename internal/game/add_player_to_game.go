package game

import (
	"encoding/json"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	socketio "github.com/googollee/go-socket.io"
)

// addPlayerToGame is called when a player has accepted a game invite from another player
func addPlayerToGame(c socketio.Conn, roomID string) {
	ctx := c.Context().(map[string]interface{})
	currentPlayer := ctx[ctxval.Player].(player.Player)
	activeGames := ctx[ctxval.ActiveGames].(map[string]*Room)
	server := ctx[ctxval.SocketServer].(*socketio.Server)

	activeGames[roomID].Players[currentPlayer.ID] = currentPlayer

	j, err := json.Marshal(currentPlayer)

	if err != nil {
		delete(activeGames[roomID].Players, currentPlayer.ID)
		c.Emit("exception", map[string]string{
			"event": "invite_accepted",
			"error": errcode.UnexpectedError,
		})
		return
	}

	g, err := json.Marshal(activeGames[roomID])

	if err != nil {
		delete(activeGames[roomID].Players, currentPlayer.ID)
		c.Emit("exception", map[string]string{
			"event": "invite_accepted",
			"error": errcode.UnexpectedError,
		})
		return
	}

	ctx[ctxval.InGameRoomID] = roomID

	server.BroadcastToRoom("/", roomID, roomID+":player_joined", string(j))
	c.Join(roomID)
	c.Emit("game_joined", string(g))
}
