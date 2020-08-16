// Package ctxval defines string constants that can be used to retreive values
// in gin.Context
package ctxval

// DbClient is a string that points to an instance of database
const DbClient = "db_client"

// RedisClient is a string that points to an instance of Redis
const RedisClient = "redis_client"

// UserID is a string that points to the id of the current user
const UserID = "user_id"
