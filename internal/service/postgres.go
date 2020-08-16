package service

import (
	"os"

	"github.com/MrCreeper1008/OpenKub/internal/ctxval"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
)

// PostgresMiddleware is a gin middleware that attaches a database instance
// to the context
func PostgresMiddleware() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		opt, err := pg.ParseURL(os.Getenv("DATABASE_URL"))

		if err != nil {
			panic(err)
		}

		db := pg.Connect(opt)

		defer db.Close()

		ctx.Set(ctxval.DbClient, db)
		ctx.Next()
	}
}
