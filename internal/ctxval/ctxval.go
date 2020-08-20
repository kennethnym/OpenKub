// Package ctxval defines string constants that can be used to retreive values
// in gin.Context
package ctxval

// DbClient is a string that points to an instance of database
const DbClient = "db_client"

// RedisClient is a string that points to an instance of Redis
const RedisClient = "redis_client"

// UserID is a string that points to the id of the current user
const UserID = "user_id"

// SocketKickTimer points to a timer that kicks an unauthenticated socket
// after 5 seconds. This is only accessible in socket.io's context
const SocketKickTimer = "kick_timer"

// AuthenticatedConn points to a set of authenticated sockets
const AuthenticatedConn = "authenticated_conn"

// UnauthenticatedConn points to a set of unauthenticated sockets
const UnauthenticatedConn = "unauthenticated_conn"
