package auth

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/gin-gonic/gin"
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwt"
)

// Middleware blocks requests that don't have "Authorization" header
func Middleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		authHeader := ctx.GetHeader("Authorization")

		if authHeader == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Authorization header is not present.",
			})
			return
		}

		split := strings.Split(authHeader, " ")

		if split[0] != "Bearer" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid authorization type.",
			})
			return
		}

		if len(split) == 1 {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid authorization header.",
			})
			return
		}

		if split[1] == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid access token.",
			})
			return
		}

		parsed, err := jwt.ParseString(
			split[1],
			jwt.WithVerify(jwa.HS256, []byte(os.Getenv("ACCESS_TOKEN_SECRET"))),
		)

		if err != nil {
			fmt.Printf("err %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid access token.",
			})
			return
		}

		err = jwt.Verify(parsed, jwt.WithIssuer(issuer))

		if err != nil {
			fmt.Printf("err %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid access token.",
			})
			return
		}

		// the user id stored in the "sub" claim
		strID := parsed.Subject()

		if strID == "" {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid access token.",
			})
			return
		}

		userID, err := strconv.Atoi(strID)

		if err != nil {
			fmt.Printf("err %v\n", err)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, map[string]string{
				"error":   unauthorizedRequest,
				"message": "Invalid access token.",
			})
			return
		}

		ctx.Set(ctxval.UserID, userID)
	}
}
