package auth

import (
	"fmt"
	"os"
	"strconv"
	"time"

	"github.com/hashicorp/go-uuid"
	"github.com/lestrrat-go/jwx/jwa"
	"github.com/lestrrat-go/jwx/jwt"
)

const issuer = "OpenKub backend"

// generateTokens generates a pair of access and refresh tokens
func generateTokens(userID int) (string, string, error) {
	accessToken := jwt.New()
	now := time.Now()

	accessToken.Set(jwt.SubjectKey, strconv.Itoa(userID))
	accessToken.Set(jwt.ExpirationKey, now.Add(time.Hour).Unix())
	accessToken.Set(jwt.IssuerKey, issuer)

	accessTokenSigned, err := jwt.Sign(accessToken, jwa.HS256, []byte(os.Getenv("ACCESS_TOKEN_SECRET")))

	if err != nil {
		fmt.Printf("Error when signing access token, %v\n", err)
		return "", "", err
	}

	refreshToken := jwt.New()
	tokenID, err := uuid.GenerateUUID()

	if err != nil {
		fmt.Printf("Error when generating refresh token, %v\n", err)
		return "", "", err
	}

	refreshToken.Set(jwt.SubjectKey, strconv.Itoa(userID))
	// refresh token will expire after 7 days
	refreshToken.Set(jwt.ExpirationKey, now.Add(time.Hour*24*7).Unix())
	refreshToken.Set(jwt.IssuerKey, issuer)
	refreshToken.Set(jwt.JwtIDKey, tokenID)

	refreshTokenSigned, err := jwt.Sign(refreshToken, jwa.HS256, []byte(os.Getenv("REFRESH_TOKEN_SECRET")))

	if err != nil {
		fmt.Printf("Error when signing refresh token, %v\n", err)
		return "", "", err
	}

	return string(accessTokenSigned), string(refreshTokenSigned), nil
}
