package handlers

import (
	"fmt"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
	"github.com/maxbrc/photo-portfolio/backend/internal/images"
)

func DeleteImages(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	if !authorized {
		http.Error(w, "you shouldn't see this error.", 401)
		return
	}

	imageUUID := r.PathValue("uuid")

	err = images.DeleteImage(imageUUID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to delete image: %v", err), 500)
		return
	}
}
