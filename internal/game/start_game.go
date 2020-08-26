package game

import (
	"math/rand"
	"strconv"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	socketio "github.com/googollee/go-socket.io"
)

// startGame is called when socket emits "<roomid>:start_game"
func startGame(c socketio.Conn, roomID string) {
	ctx := c.Context().(map[string]interface{})
	currentGame := (ctx[ctxval.ActiveGames].(map[string]*Room))[roomID]
	server := ctx[ctxval.SocketServer].(*socketio.Server)

	currentGame.AvailableTiles = generateTiles()
	currentGame.CurrentPlayerIndex = rand.Intn(4)

	server.BroadcastToRoom(
		"/",
		roomID,
		roomID+":start_game",
		currentGame.PlayersOrder[currentGame.CurrentPlayerIndex]
	)

	distributeDeck(ctx, currentGame)
}
