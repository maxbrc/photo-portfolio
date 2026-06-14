package handlers

import (
	"fmt"
	"io"
	"net/http"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
	"github.com/maxbrc/photo-portfolio/backend/internal/images"
)

func PatchImages(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}

	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	reqBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	imageUUID := r.PathValue("uuid")

	err = images.UpdateImage(reqBody, imageUUID)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to update image: %v", err), 500)
		return
	}
}
