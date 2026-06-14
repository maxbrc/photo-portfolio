package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/albums"
	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func PostAlbums(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	if !authorized {
		http.Error(w, "you shouldn't see this error.", 401)
		return
	}

	reqBody, err := io.ReadAll(r.Body)

	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	response, err := albums.PostAlbums(reqBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to create album: %v", err), 500)
		return
	}

	json.NewEncoder(w).Encode(response)
}
