package socket

import (
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/MrCreeper1008/OpenKub/internal/auth"
	"github.com/MrCreeper1008/OpenKub/internal/config"
	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/gin-gonic/gin"
	engineio "github.com/googollee/go-engine.io"
	"github.com/googollee/go-engine.io/transport"
	"github.com/googollee/go-engine.io/transport/polling"
	"github.com/googollee/go-engine.io/transport/websocket"
	socketio "github.com/googollee/go-socket.io"
)

// Handler handles calls to /api/socket
func Handler(server *socketio.Server) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		ctx.Writer.Header().Set("Access-Control-Allow-Origin", config.AllowedOrigin)

		server.ServeHTTP(ctx.Writer, ctx.Request)
	}
}

// Initialize initializes socket.io server
func Initialize(ctx map[string]interface{}) *socketio.Server {
	p := polling.Default
	wb := websocket.Default

	wb.CheckOrigin = func(r *http.Request) bool {
		return true
	}

	server, err := socketio.NewServer(&engineio.Options{
		Transports: []transport.Transport{
			p,
			wb,
		},
		PingTimeout: time.Duration(time.Second * 60),
	})

	if err != nil {
		log.Fatal(err)
	}

	defineEvents(server, ctx)

	go server.Serve()

	return server
}

// defineEvents defines socket events that the server will handle
func defineEvents(server *socketio.Server, ctx map[string]interface{}) {
	unauthenticatedConn := map[string]socketio.Conn{}

	kickTicker := time.NewTicker(time.Second * 5)

	// a goroutine that kicks unauthenticated sockets every 5 second
	go func() {
		for {
			<-kickTicker.C
			kickUnauthenticatedSockets(unauthenticatedConn)
		}
	}()

	server.OnConnect("/", func(c socketio.Conn) error {
		socketCtx := map[string]interface{}{
			ctxval.UnauthenticatedConn: unauthenticatedConn,
		}

		// copy initial context values to socketCtx
		for k, v := range ctx {
			socketCtx[k] = v
		}

		c.SetContext(socketCtx)

		unauthenticatedConn[c.ID()] = c

		fmt.Printf("socket connected: %v\n", c.ID())

		return nil
	})

	server.OnEvent("/", "authentication", auth.AuthenticateSocket)

	server.OnDisconnect("/", handleDisconnection)

	server.OnEvent("/", "test", func(c socketio.Conn, msg string) {
		fmt.Printf("received: %v\n", msg)
	})
}
