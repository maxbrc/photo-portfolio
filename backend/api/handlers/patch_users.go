package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
)

func PatchUsers(w http.ResponseWriter, r *http.Request) {
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

	userID := r.PathValue("user_id")

	err = auth.UpdateUser(reqBody, userID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to update user: %v", err), 500)
		return
	}
}
