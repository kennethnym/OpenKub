package socket

import (
	socketio "github.com/googollee/go-socket.io"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/player"
)

// ActiveConnections maps IDs of online players to their corresponding socket io connection
type ActiveConnections = map[int]socketio.Conn

// GetActiveConnections retrieves all active and authenticated socket connections.
func GetActiveConnections(ctx ctxval.SocketContext) ActiveConnections {
	return ctx[ctxval.ActiveConns].(ActiveConnections)
}

// AddActiveConnection saves the given connection made by the given player to context,
// and marking the connection as authenticated, stopping the kick timer.
func AddActiveConnection(ctx ctxval.SocketContext, player player.Player, conn socketio.Conn) {
	delete(ctx[ctxval.UnauthenticatedConns].(map[string]UnauthenticatedConn), conn.ID())
	GetActiveConnections(ctx)[player.ID] = conn
}
