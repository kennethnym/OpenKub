package game

import (
	"encoding/json"
	"fmt"

	socketio "github.com/googollee/go-socket.io"

	"github.com/kennethnym/OpenKub/internal/ctxval"
)

func distributeDeck(socketCtx map[string]interface{}, room *Room) {
	activeConns := socketCtx[ctxval.ActiveConns].(map[int]socketio.Conn)
	server := socketCtx[ctxval.SocketServer].(*socketio.Server)

	i := room.CurrentPlayerIndex
	for j := 0; j < 4; j++ {
		playerID := room.PlayersOrder[i]
		fmt.Printf("playerID %v\n", playerID)
		c := activeConns[playerID]
		deck := room.AvailableTiles[0:13]

		j, err := json.Marshal(deck)

		if err != nil {
			server.BroadcastToRoom("/", room.ID, room.ID+":exception", map[string]string{
				"error": cannotDistributeDeck,
			})
			return
		}

		room.AvailableTiles = room.AvailableTiles[13:]

		c.Emit(room.ID+":deck_distributed", string(j))

		if i == 3 {
			i = 0
		} else {
			i++
		}
	}
}
