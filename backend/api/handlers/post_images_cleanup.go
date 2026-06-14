package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
	"github.com/maxbrc/photo-portfolio/backend/internal/images"
)

func PostImagesCleanup(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	if !authorized {
		http.Error(w, "you shouldn't see this error.", 401)
		return
	}

	response, err := images.CleanupImages()
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to cleanup images: %v", err), 500)
		return
	}

	json.NewEncoder(w).Encode(response)
}
