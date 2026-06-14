package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func PostUsers(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}

	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	err = auth.CreateUser(reqBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to create user: %v", err), 500)
		return
	}
}
