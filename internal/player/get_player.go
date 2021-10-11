package player

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/kennethnym/OpenKub/internal/ctxval"
	"github.com/kennethnym/OpenKub/internal/errcode"
)

// GetPlayer handles calls to /api/player
// If id param is specified, then this will get details about the player with that id.
// Otherwise, it'll return details of the current player
func GetPlayer(ctx *gin.Context) {
	var playerID int

	if givenID, hasID := ctx.Params.Get("id"); hasID {
		id, err := strconv.Atoi(givenID)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, map[string]string{
				"error": invalidPlayerID,
			})
			return
		}

		playerID = id
	} else {
		playerID = ctx.MustGet(ctxval.UserID).(int)
	}

	db := ctx.MustGet(ctxval.DbClient).(*pg.DB)
	player := &Player{ID: playerID}
	playerModel := db.Model(player)

	hasPlayer, err := playerModel.WherePK().Exists()

	if err != nil {
		fmt.Printf("err %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error":   errcode.UnexpectedError,
			"message": "An unexpected error occurred when finding the player.",
		})
		return
	}

	if !hasPlayer {
		ctx.JSON(http.StatusNotFound, map[string]string{
			"error": playerNotFound,
		})
		return
	}

	err = playerModel.WherePK().Select()

	if err != nil {
		fmt.Printf("err %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error":   errcode.UnexpectedError,
			"message": "An unexpected error occurred when finding the player.",
		})
		return
	}

	// We are separating queries here because currently there's a bug
	// in go-pg that prevents us from querying relationships in a single query
	// issue: https://github.com/go-pg/pg/issues/1667

	relationships := []Relationship{}

	err = db.Model(&relationships).
		Where("player_id = ?", playerID).
		Relation("To").
		Select()

	if err != nil {
		fmt.Printf("err %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error":   errcode.UnexpectedError,
			"message": "An unexpected error occurred when finding the player.",
		})
		return
	}

	player.Relationships = relationships

	ctx.JSON(http.StatusOK, player)
}
