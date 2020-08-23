package auth

import (
	"fmt"
	"net/http"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/MrCreeper1008/OpenKub/internal/player"
	"github.com/MrCreeper1008/OpenKub/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/go-redis/redis/v8"
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
	playerExists, err := playerModel.Where("username = ?", username).Exists()

	if err != nil {
		fmt.Printf("err 0 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	if !playerExists {
		// the player is not registered
		ctx.JSON(http.StatusUnauthorized, map[string]string{
			"error": playerNotRegistered,
		})
		return
	}

	passwordBytes := []byte(password)
	playerObj.Username = username
	err = playerModel.Where("username = ?", username).Select()

	if err != nil {
		fmt.Printf("err 1 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
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

	redisClient := ctx.MustGet(ctxval.RedisClient).(*redis.Client)

	// check if this player is already online
	isOnline, err := redisClient.SIsMember(service.RedisCtx, service.RedisKeyOnlinePlayer, playerObj.ID).Result()

	if isOnline {
		ctx.JSON(http.StatusConflict, map[string]string{
			"error": playerAlreadyOnline,
		})
		return
	}

	relationships := []player.Relationship{}

	// We are separating queries here because currently there's a bug
	// in go-pg that prevents us from querying relationships in a single query
	// issue: https://github.com/go-pg/pg/issues/1667

	err = db.Model(&relationships).
		Where("player_id = ?", playerObj.ID).
		Relation("To").
		Select()

	if err != nil {
		fmt.Printf("err 2 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error":   errcode.UnexpectedError,
			"message": "An error occurred when getting player information.",
		})
		return
	}

	// check if friends are online
	for i, relationship := range relationships {
		if relationship.Type != player.RelationshipFriend {
			relationship.To.IsOnline = false
		} else {
			redisClient := ctx.MustGet(ctxval.RedisClient).(*redis.Client)
			isOnline, err := redisClient.SIsMember(
				service.RedisCtx,
				service.RedisKeyOnlinePlayer,
				relationship.To.ID,
			).Result()

			if err != nil {
				fmt.Printf("err 2.5, %v\n", err)
				ctx.JSON(http.StatusInternalServerError, map[string]string{
					"error": errcode.UnexpectedError,
				})
				return
			}

			relationships[i].To.IsOnline = isOnline
		}
	}

	playerObj.Relationships = relationships

	fmt.Printf("player id %v\n", playerObj.ID)

	accessToken, refreshToken, err := generateTokens(playerObj.ID)

	if err != nil {
		fmt.Printf("err 3 %v\n", err)
		ctx.JSON(http.StatusInternalServerError, map[string]string{
			"error": errcode.UnexpectedError,
		})
		return
	}

	saveTokensToCookies(ctx, accessToken, refreshToken)
	ctx.JSON(http.StatusOK, playerObj)
}
