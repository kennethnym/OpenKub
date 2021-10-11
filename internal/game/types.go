package game

import "github.com/kennethnym/OpenKub/internal/player"

// Room defines a game that is being hosted
type Room struct {
	HostedBy     player.Player         `json:"hostedBy"`
	PlayersReady map[int]bool          `json:"playersReady"`
	Players      map[int]player.Player `json:"players"`
	ID           string                `json:"id"`
	// AvailableTiles is the available tiles of the current game.
	// Initially, there are 106 tiles. The property of a single tile
	// is stored in a tuple, the first element being the number of the tile
	// and the second being the color of the tile.
	// 0 = red, 1 = blue, 2 = black, 3 = orange
	AvailableTiles [][2]int `json:"available_tiles"`

	// PlayersOrder is the order of the player (in id)
	PlayersOrder       []int `json:"-"`
	CurrentPlayerIndex int   `json:"-"`
}
