package game

import (
	"encoding/json"

	socketio "github.com/googollee/go-socket.io"

	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/errcode"
	"github.com/kennethnym/OpenKub/internal/player"
	"github.com/kennethnym/OpenKub/internal/util"
)

// createGame creates a game
func createGame(c socketio.Conn, roomJSON string) {
	ctx := c.Context().(map[string]interface{})
	currentPlayer := ctx[ctxval.Player].(player.Player)
	activeGames := ctx[ctxval.ActiveGames].(map[string]*Room)

	if roomID, _ := ctx[ctxval.InGameRoomID].(string); roomID != "" {
		room := (ctx[ctxval.ActiveGames].(map[string]*Room))[roomID]

		j, err := json.Marshal(room)

		if err != nil {
			c.Emit("exception", map[string]string{
				"event":     "create_game",
				"exception": errcode.UnexpectedError,
			})
		} else {
			c.Emit("game_created", string(j))
		}

		return
	}

	roomID := "game_" + util.GenerateID()

	room := &Room{
		HostedBy:     currentPlayer,
		ID:           roomID,
		PlayersReady: map[int]bool{},
		Players: map[int]player.Player{
			currentPlayer.ID: currentPlayer,
		},
		PlayersOrder:       []int{currentPlayer.ID},
		CurrentPlayerIndex: -1,
	}

	activeGames[roomID] = room

	j, err := json.Marshal(room)

	if err != nil {
		delete(activeGames, roomID)
		c.Emit("exception", map[string]string{
			"event": "create_game",
			"error": errcode.UnexpectedError,
		})
		return
	}

	ctx[ctxval.InGameRoomID] = roomID

	c.Join(roomID)
	c.Emit("game_created", string(j))
}
