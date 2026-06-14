package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/images"
)

func GetImages(w http.ResponseWriter, r *http.Request) {
	res, err := images.GetAllImages()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to get all images: %v", err), 500)
		return
	}
	json.NewEncoder(w).Encode(res)
}
