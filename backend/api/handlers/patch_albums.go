package handlers

import (
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/maxbrc/photo-portfolio/backend/internal/albums"
	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
)

func PatchAlbums(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}

	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	albumID, err := strconv.Atoi(r.PathValue("album_id"))
	if err != nil {
		http.Error(w, "invalid album_id", 400)
		return
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	err = albums.PatchAlbum(reqBody, albumID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to patch album: %v", err), 500)
		return
	}
}
