package player

// Player defines a player in the game
type Player struct {
	ID            int            `pg:",pk" json:"id"`
	Username      string         `json:"username"`
	Password      string         `json:"-"`
	Relationships []Relationship `pg:"-" json:"relationships"`
	IsOnline      bool           `pg:"-" json:"isOnline"`
}

// Relationship defines a relationship between the player and another player
type Relationship struct {
	ToPlayerID int    `json:"-"`
	To         Player `pg:"fk:to_player_id" json:"to"`
	Type       string `json:"type"`
}

// RelationshipFriend indicates that player is friend with another player
const RelationshipFriend = "FRIEND"
