package auth

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/MrCreeper1008/OpenKub/internal/errcode"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwt"
)

func unauthorizedRequestError(ctx *gin.Context, message string) {
	ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
		"error":   unauthorizedRequest,
		"message": message,
	})
}

func invalidRefreshTokenError(ctx *gin.Context) {
	ctx.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{
		"error":   unauthorizedRequest,
		"message": "Invalid refresh token.",
	})
}

// SaveTokensToCookies saves access token and refresh token to http-only cookies
func SaveTokensToCookies(ctx *gin.Context, accessToken string, refreshToken string) {
	ctx.SetCookie("access_token", accessToken, 60*60, "/api", "", true, true)
	ctx.SetCookie("refresh_token", refreshToken, 60*60*24*14, "/api", "", true, true)
}

// TokenHandler handles access token and refresh token present in cookies.
// It does the following things:
//
// - Blocks Request if access_token cookie is not present.
//
// - Refreshes tokens when access_token expires.
func TokenHandler() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		accessTokenCookie, _ := ctx.Request.Cookie("access_token")
		refreshTokenCookie, err := ctx.Request.Cookie("refresh_token")

		if err != nil {
			// idk what happened.
			// refresh token should always be present alongside access token
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Please re-login and try again.",
			})
			return
		}

		if accessTokenCookie == nil {
			refreshToken(ctx, refreshTokenCookie)
			return
		}

		accessToken, err := jwt.ParseString(
			accessTokenCookie.Value,
			jwt.WithVerify(jwa.HS256, []byte(os.Getenv("ACCESS_TOKEN_SECRET"))),
		)

		if err != nil {
			fmt.Printf("err %v\n", err)
			unauthorizedRequestError(ctx, "Invalid access token.")
			return
		}

		err = jwt.Verify(accessToken, jwt.WithIssuer(issuer))

		if err != nil {
			fmt.Printf("err %v\n", err)
			unauthorizedRequestError(ctx, "Invalid access token.")
			return
		}

		// the difference between the expiration time and the current time
		diff := accessToken.Expiration().Sub(time.Now())

		if diff.Minutes() > 5 {
			userID, err := strconv.Atoi(accessToken.Subject())

			if err != nil {
				fmt.Printf("err %v\n", err)
				unauthorizedRequestError(ctx, "Invalid access token.")
				return
			}

			ctx.Set(ctxval.UserID, userID)
			return
		}

		refreshToken(ctx, refreshTokenCookie)
	}
}

// refreshToken generates a new pair of access token and refresh token.
// called when the access token is missing or is no longer valid
func refreshToken(ctx *gin.Context, refreshTokenCookie *http.Cookie) {
	// generate new tokens

	refreshToken, err := jwt.ParseString(
		refreshTokenCookie.Value,
		jwt.WithVerify(jwa.HS256, []byte(os.Getenv("REFRESH_TOKEN_SECRET"))),
		jwt.WithIssuer(issuer),
	)

	if err != nil {
		ctx.AbortWithStatusJSON(http.StatusBadRequest, map[string]string{
			"error":   unauthorizedRequest,
			"message": "Invalid refresh token",
		})
		return
	}

	err = jwt.Verify(refreshToken, jwt.WithIssuer(issuer))

	if err != nil {
		fmt.Printf("err %v\n", err)
		invalidRefreshTokenError(ctx)
		return
	}

	redisClient := ctx.MustGet(ctxval.RedisClient).(*redis.Client)

	_, err = redisClient.Get(ctx, refreshToken.JwtID()).Result()

	if err == redis.Nil {
		// this refresh token is not blacklisted and can be used
		// but before that, we need to blacklist it first to prevent it from being used again
		userID, err := strconv.Atoi(refreshToken.Subject())

		if err != nil {
			fmt.Printf("err %v\n", err)
			invalidRefreshTokenError(ctx)
			return
		}

		newAccessToken, newRefreshToken, err := generateTokens(userID)

		if err != nil {
			fmt.Printf("err %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{
				"error":   errcode.UnexpectedError,
				"message": "An error occurred when making new tokens.",
			})
			return
		}

		diff := refreshToken.Expiration().Sub(time.Now())
		err = redisClient.Set(ctx, refreshToken.JwtID(), refreshTokenCookie.Value, diff).Err()

		if err != nil {
			fmt.Printf("err %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{
				"error":   errcode.UnexpectedError,
				"message": "An error occurred when making new tokens.",
			})
			return
		}

		SaveTokensToCookies(ctx, newAccessToken, newRefreshToken)
	}

	ctx.AbortWithStatusJSON(http.StatusInternalServerError, map[string]string{
		"error":   errcode.UnexpectedError,
		"message": "An error occurred when verifying tokens.",
	})
}
