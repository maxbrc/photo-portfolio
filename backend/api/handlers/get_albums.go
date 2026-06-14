package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxbrc/richard-freier/backend/internal/albums"
)

func GetAlbums(w http.ResponseWriter, r *http.Request) {
	res, err := albums.GetAlbums()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get albums: %v", err), 500)
	}
	json.NewEncoder(w).Encode(res)
}
