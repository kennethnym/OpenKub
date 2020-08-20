package socket

import (
	"fmt"

	socketio "github.com/googollee/go-socket.io"
)

func kickUnauthenticatedSockets(conns map[string]socketio.Conn) {
	fmt.Printf("conns %v\n", conns)

	for id, conn := range conns {
		err := conn.Close()
		if err == nil {
			delete(conns, id)
		}
	}
}
