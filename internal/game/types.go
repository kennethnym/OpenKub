package game

import "github.com/MrCreeper1008/OpenKub/internal/player"

// Room defines a game that is being hosted
type Room struct {
	HostedBy     player.Player         `json:"hostedBy"`
	PlayersReady map[int]bool          `json:"playersReady"`
	Players      map[int]player.Player `json:"players"`
	ID           string                `json:"id"`
}
