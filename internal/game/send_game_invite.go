package game

import (
	"encoding/json"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	socketio "github.com/googollee/go-socket.io"
)

// sendGameInvite sends a game invite to a specific player
func sendGameInvite(c socketio.Conn, to int, roomID string) {
	ctx := c.Context().(map[string]interface{})
	currentPlayer := ctx[ctxval.Player].(player.Player)
	activeConns := ctx[ctxval.ActiveConns].(map[int]socketio.Conn)

	j, err := json.Marshal(currentPlayer)

	if err != nil {
		c.Emit("exception", map[string]string{
			"event": "send_game_invite",
			"error": errcode.UnexpectedError,
		})
		return
	}

	activeConns[to].Emit(
		"game_invite",
		string(j),
		roomID,
	)
	c.Emit("invite_sent")
}
