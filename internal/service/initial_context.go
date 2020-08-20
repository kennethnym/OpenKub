package service

import "github.com/gin-gonic/gin"

// InitialContext attaches initial context values to gin context
func InitialContext(initialCtx map[string]interface{}) gin.HandlerFunc {
	return func(ctx *gin.Context) {
		for ctxkey, ctxval := range initialCtx {
			ctx.Set(ctxkey, ctxval)
		}
 	}
}
