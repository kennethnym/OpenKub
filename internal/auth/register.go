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

// RegisterHandler handles calls to /api/register
func RegisterHandler(ctx *gin.Context) {
	username := ctx.Request.FormValue("username")
	password := ctx.Request.FormValue("password")

	fmt.Println("registering " + username)

	if username == "" || password == "" {
		ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": missingUsernameOrPassword,
		})
		return
	}

	db := ctx.Value(ctxval.DbClient).(*pg.DB)
	playerObj := &player.Player{
		Username: username,
	}
	playerModel := db.Model(playerObj)
	exists, err := playerModel.Where("username = ?", username).Exists()

	if exists {
		ctx.JSON(http.StatusBadRequest, map[string]string{
			"error": usernameTaken,
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err != nil {
		fmt.Printf("err 0 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	playerObj.Password = string(hashedPassword)
	playerObj.Relationships = make([]player.Relationship, 0)

	_, err = db.Model(playerObj).Returning("*").Insert()

	if err != nil {
		fmt.Printf("err 1 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	accessToken, refreshToken, err := generateTokens(playerObj.ID)

	if err != nil {
		fmt.Printf("err 2 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	saveTokensToCookies(ctx, accessToken, refreshToken)
	ctx.JSON(http.StatusOK, playerObj)
}
