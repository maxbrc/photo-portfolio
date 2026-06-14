package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/albums"
)

func PutAlbumsAssignments(w http.ResponseWriter, r *http.Request) {
	albumID := r.PathValue("album_id")
	if albumID == "" {
		http.Error(w, "must provide an album id!", 400)
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	err = albums.ReplaceAlbumImageAssignments(reqBody, albumID)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to update album image assignments: %v", err), 500)
		return
	}
}
