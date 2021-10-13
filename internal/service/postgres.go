package service

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"

	"github.com/kennethnym/OpenKub/internal/ctxval"
)

// InitializePostgres creates a connection to postgres database
func InitializePostgres() *pg.DB {
	opt, err := pg.ParseURL(os.Getenv("DATABASE_URL"))

	if err != nil {
		panic(err)
	}

	db := pg.Connect(opt)

	return db
}

// PostgresMiddleware is a gin middleware that attaches a database instance
// to the context
func PostgresMiddleware(db *pg.DB) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		ctx.Set(ctxval.DbClient, db)
		ctx.Next()
	}
}

func GetDbClient(ctx ctxval.SocketContext) *pg.DB {
	return ctx[ctxval.DbClient].(*pg.DB)
}
