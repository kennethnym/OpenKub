package player

import "github.com/kennethnym/OpenKub/internal/ctxval"

// OnlinePlayerSet defines the concrete type that is responsible for storing
// the set of IDs of currently online players.
type OnlinePlayerSet = map[int]bool

// GetOnlinePlayers retrieves the set of currently online players.
func GetOnlinePlayers(ctx ctxval.SocketContext) OnlinePlayerSet {
	return ctx[ctxval.OnlinePlayers].(OnlinePlayerSet)
}

// AddOnlinePlayer adds the given player to the set of currently online players
// (i.e. marking them as being online)
func AddOnlinePlayer(ctx ctxval.SocketContext, player Player) {
	GetOnlinePlayers(ctx)[player.ID] = true
}
