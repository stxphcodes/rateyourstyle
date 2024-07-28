package main

import (
	"fmt"
)

const cookieName = "rys-login"

func createCookieStr(cookie string) string {
	return fmt.Sprintf(
		"%s=%s",
		cookieName,
		cookie,
	)
}
