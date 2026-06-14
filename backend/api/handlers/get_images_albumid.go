package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/maxbrc/richard-freier/backend/internal/images"
)

func GetImagesForAlbumID(w http.ResponseWriter, r *http.Request) {
	albumIDString := r.PathValue("album_id")

	var albumID *int
	if albumIDString == "null" {
		albumID = nil
	} else {
		parsedAlbumID, err := strconv.Atoi(albumIDString)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to parse album id: %v", err), 500)
			return
		}

		albumID = &parsedAlbumID
	}

	res, err := images.GetImagesForAlbumID(albumID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get images: %v", err), 500)
	}

	json.NewEncoder(w).Encode(res)
}
