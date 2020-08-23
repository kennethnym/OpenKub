package util

import "github.com/rs/xid"

var guid = xid.New()

// GenerateID generates a globally unique ID
func GenerateID() string {
	return guid.String()
}
