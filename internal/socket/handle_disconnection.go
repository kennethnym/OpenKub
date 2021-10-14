package socket

import (
	"fmt"
	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/game"
	"github.com/kennethnym/OpenKub/internal/player"
	"math/rand"
	"strconv"
)

// handleDisconnection handles socket disconnection event
func handleDisconnection(c socketio.Conn, reason string) {
	fmt.Printf("socket %v disconnected: \n", c.ID())
	fmt.Println("reason: " + reason)

	ctx := c.Context().(map[string]interface{})

	if p, ok := ctx[ctxval.Player].(player.Player); ok {
		server := ctx[ctxval.SocketServer].(*socketio.Server)
		playerID := p.ID

		fmt.Printf("player %v going offline...\n", playerID)

		// check if the current p is in a game
		if roomID := ctx[ctxval.InGameRoomID].(string); roomID != "" {
			activeGames := ctx[ctxval.ActiveGames].(map[string]*game.Room)
			room := activeGames[roomID]

			delete(room.Players, playerID)
			delete(room.PlayersReady, playerID)

			server.BroadcastToRoom("/", roomID, roomID+":player_left", playerID)

			if len(room.Players) == 0 {
				// no more players left in the room
				// delete this room
				delete(activeGames, roomID)
			} else if room.HostedBy.ID == playerID {
				// the p is the host of the game
				// we need to assign a new host
				playersCount := len(room.Players)
				players := make([]int, playersCount)

				i := 0
				for id := range room.Players {
					players[i] = id
					i++
				}

				newHost := room.Players[players[rand.Intn(playersCount)]]
				room.HostedBy = newHost

				server.BroadcastToRoom("/", roomID, roomID+":new_host", newHost.ID)
			}
		}

		delete(ctx[ctxval.ActiveConns].(map[int]socketio.Conn), playerID)

		server.BroadcastToRoom("/", "all", strconv.Itoa(playerID)+"_disconnected")
	}
}
