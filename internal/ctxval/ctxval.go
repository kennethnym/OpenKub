// Package ctxval defines string constants that can be used to retreive values
// in gin.Context
package ctxval

// DbClient is a string that points to an instance of database
const DbClient = "db_client"

// RedisClient is a string that points to an instance of Redis
const RedisClient = "redis_client"

// UserID is a string that points to the id of the current user
const UserID = "user_id"

// Player is a string that points to the current player object
const Player = "player"

// SocketKickTimer points to a timer that kicks an unauthenticated socket
// after 5 seconds. This is only accessible in socket.io's context
const SocketKickTimer = "kick_timer"

// AuthenticatedConn points to a set of authenticated sockets
const AuthenticatedConn = "authenticated_conn"

// UnauthenticatedConns points to a map of unauthenticated sockets
const UnauthenticatedConns = "unauthenticated_conns"

// ActiveConns points to a map of user id to its active socket connection
const ActiveConns = "active_conns"

// ActiveGames points to a map of user id to an active game they are hosting
const ActiveGames = "active_games"

// InGameRoomID indicates the room id the socket is in.
const InGameRoomID = "in_game_room_id"

// SocketServer points to an instance of socket.io server
const SocketServer = "socket_server"
