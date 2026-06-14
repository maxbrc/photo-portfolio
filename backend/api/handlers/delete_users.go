package handlers

import (
	"fmt"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func DeleteUsers(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}

	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	username := r.PathValue("username")

	err = auth.DeleteUser(username)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get users: %v", err), 500)
	}
}
