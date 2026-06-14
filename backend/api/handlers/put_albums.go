package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/albums"
	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func PutAlbums(w http.ResponseWriter, r *http.Request) {
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

	err = albums.PutAlbum(reqBody)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to update album: %v", err), 500)
		return
	}
}
