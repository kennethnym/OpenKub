package auth

import (
	"fmt"
	"net/http"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"golang.org/x/crypto/bcrypt"
)

// LoginHandler handles calls to /api/login
// logs players into the game or register new players
func LoginHandler(ctx *gin.Context) {
	username := ctx.Request.FormValue("username")
	password := ctx.Request.FormValue("password")

	if username == "" || password == "" {
		ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": missingUsernameOrPassword,
		})
		return
	}

	db := ctx.Value(ctxval.DbClient).(*pg.DB)
	playerObj := &player.Player{}
	playerModel := db.Model(playerObj)
	usernameTaken, err := playerModel.Where("username = ?", username).Exists()

	if err != nil {
		panic(err)
	}

	passwordBytes := []byte(password)

	if !usernameTaken {
		// Register the user
		hashedPassword, err := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.DefaultCost)

		if err != nil {
			panic(err)
		}

		playerObj.Username = username
		playerObj.Password = string(hashedPassword)
		playerObj.Relationships = make([]player.Relationship, 0)
		_, err = playerModel.Returning("*").Insert()

		if err != nil {
			panic(err)
		}
	} else {
		playerObj.Username = username
		err = playerModel.Select()

		if err != nil {
			panic(err)
		}

		// Logs the user in
		err = bcrypt.CompareHashAndPassword([]byte(playerObj.Password), passwordBytes)

		if err != nil {
			// incorrect password
			ctx.JSON(http.StatusUnauthorized, map[string]string{
				"error": incorrectPassword,
			})
			return
		}

		relationships := []player.Relationship{}

		err = db.Model(&relationships).
			Where("player_id = ?", playerObj.ID).
			Relation("To").
			Select()

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, map[string]string{
				"error":   errcode.UnexpectedError,
				"message": "An error occurred when getting player information.",
			})
			return
		}

		playerObj.Relationships = relationships
	}

	fmt.Printf("player id %v\n", playerObj.ID)

	accessToken, refreshToken, err := generateTokens(playerObj.ID)

	if err != nil {
		panic(err)
	}

	SaveTokensToCookies(ctx, accessToken, refreshToken)
	ctx.JSON(http.StatusOK, playerObj)
}
