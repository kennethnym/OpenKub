package auth

import (
	"time"

	socketio "github.com/googollee/go-socket.io"
)

// UnauthenticatedConn defines an unauthenticated socket connection
type UnauthenticatedConn struct {
	Conn     socketio.Conn
	JoinedOn time.Time
}
