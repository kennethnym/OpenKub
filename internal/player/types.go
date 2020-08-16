package player

// Player defines a player in the game
type Player struct {
	ID       int `pg:",pk" json:"id"`
	Username string
	Password string `json:"-"`
}
