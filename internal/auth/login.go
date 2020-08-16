package auth

import (
	"fmt"
	"net/http"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
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
	player := &player.Player{}
	playerModel := db.Model(player)
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

		player.Username = username
		player.Password = string(hashedPassword)
		_, err = playerModel.Returning("*").Insert()

		if err != nil {
			panic(err)
		}
	} else {
		player.Username = username
		err = playerModel.Select()

		if err != nil {
			panic(err)
		}

		// Logs the user in
		err = bcrypt.CompareHashAndPassword([]byte(player.Password), passwordBytes)

		if err != nil {
			// incorrect password
			ctx.JSON(http.StatusUnauthorized, map[string]string{
				"error": incorrectPassword,
			})
			return
		}
	}

	fmt.Printf("player id %v\n", player.ID)

	accessToken, refreshToken, err := generateTokens(player.ID)

	if err != nil {
		panic(err)
	}

	SaveTokensToCookies(ctx, accessToken, refreshToken)
	ctx.JSON(http.StatusOK, player)
}
