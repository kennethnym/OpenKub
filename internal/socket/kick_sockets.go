package socket

import (
	"fmt"
	"time"
)

// kickUnauthenticatedSockets kicks unauthenticated socket connections
// when they haven't authenticated themselves in 5 seconds
func kickUnauthenticatedSockets(conns map[string]UnauthenticatedConn) {
	fmt.Printf("conns %v\n", conns)

	for id, conn := range conns {
		if time.Now().Sub(conn.JoinedOn).Seconds() > 5 {
			err := conn.Conn.Close()
			if err == nil {
				delete(conns, id)
			}
		}
	}
}
