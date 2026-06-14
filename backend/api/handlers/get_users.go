package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func GetUsers(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}

	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	res, err := auth.GetUsers()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get users: %v", err), 500)
	}

	json.NewEncoder(w).Encode(res)
}
