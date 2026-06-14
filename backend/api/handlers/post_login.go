package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

type SuccessfullLoginResponse struct {
	AccessToken string `json:"access_token"`
}

func AuthenticateUser(w http.ResponseWriter, r *http.Request) {
	reqBody, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	tokens, code, err := auth.AuthenticateUser(reqBody)

	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to authenticate user", 500)
		return
	}

	if code == 401 {
		http.Error(w, "Invalid Credentials", 401)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "refresh_token",
		Value:    tokens.Refresh,
		Path:     "/api/refresh-token",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   30 * 24 * 60 * 60,
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(SuccessfullLoginResponse{AccessToken: tokens.Access})
}
