package player

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
)

// GetPlayer handles calls to /api/player
// If id param is specified, then this will get details about the player with that id.
// Otherwise, it'll return details of the current player
func GetPlayer(ctx *gin.Context) {
	var userID int

	if givenID, hasID := ctx.Params.Get("id"); hasID {
		id, err := strconv.Atoi(givenID)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, map[string]string{
				"error": invalidPlayerID,
			})
			return
		}

		userID = id
	} else {
		userID = ctx.MustGet(ctxval.UserID).(int)
	}

	db := ctx.MustGet(ctxval.DbClient).(*pg.DB)
	player := &Player{ID: userID}
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

	ctx.JSON(http.StatusOK, player)
}
