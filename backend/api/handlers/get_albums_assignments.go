package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/albums"
)

func GetAlbumsAssignments(w http.ResponseWriter, r *http.Request) {
	res, err := albums.GetAlbumImageAssignments()
	if err != nil {
		http.Error(w, fmt.Sprintf("Failed to get album image assignments: %v", err), 500)
	}

	json.NewEncoder(w).Encode(res)
}
