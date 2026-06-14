package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/maxbrc/richard-freier/backend/internal/albums"
	"github.com/maxbrc/richard-freier/backend/internal/auth"
)

func DeleteAlbums(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	if !authorized {
		http.Error(w, "you shouldn't see this error.", 401)
		return
	}

	albumIDString := r.PathValue("album_id")
	albumID, err := strconv.Atoi(albumIDString)
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to parse album id: %v", err), 500)
		return
	}

	response, err := albums.DeleteAlbum(albumID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to delete album: %v", err), 500)
		return
	}

	json.NewEncoder(w).Encode(response)
}
