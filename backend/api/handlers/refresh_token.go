package handlers

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func RefreshToken(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie("refresh_token")

	if err != nil {
		if errors.Is(err, http.ErrNoCookie) {
			http.Error(w, "Required refresh_token cookie is not present. Please (re-)authenticate.", 401)
			return
		} else {
			http.Error(w, "Failed to get refresh_token cookie.", 500)
			return
		}
	}

	token := cookie.Value
	valid, userID, err := auth.ValidateToken(token, "refresh")

	if !valid {
		http.Error(w, fmt.Sprintf("Invalid JWT / refresh token: %v", err), 401)
		return
	}

	accessToken, err := auth.GenerateAccessToken(userID)

	if err != nil {
		http.Error(w, fmt.Sprintf("failed to generate access token: %v", err), 500)
		return
	}

	json.NewEncoder(w).Encode(SuccessfullLoginResponse{AccessToken: accessToken})
}
