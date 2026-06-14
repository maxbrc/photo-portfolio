package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/maxbrc/richard-freier/backend/internal/auth"
	"github.com/maxbrc/richard-freier/backend/internal/images"
)

type uploadResult struct {
	filename string
	uuid     string
	err      error
}

func PostImages(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, err.Error(), 401)
		return
	}

	if !authorized {
		http.Error(w, "you shouldn't see this error.", 401)
		return
	}

	r.ParseMultipartForm(1024 * 1024 * 1024) // 1 GiB

	fileCountString := r.FormValue("file_count")
	fileCount, err := strconv.Atoi(fileCountString)
	if err != nil {
		http.Error(w, "Failed to parse file_count form value", 500)
		return
	}

	resultChannel := make(chan uploadResult, fileCount)

	newUUIDs := make(map[string]string, 0) // original filename -> uuid
	for i := range fileCount {
		file, handler, err := r.FormFile(fmt.Sprintf("file%v", i))
		if err != nil {
			http.Error(w, "Error getting file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		go func() {
			uuid, err := images.AddImage(file)

			resultChannel <- uploadResult{handler.Filename, uuid, err}
		}()

	}

	for range fileCount {
		result := <-resultChannel

		if result.err != nil {
			http.Error(w, fmt.Sprintf("failed to add image: %v", err), 500)
			return
		}

		newUUIDs[result.filename] = result.uuid
	}

	json.NewEncoder(w).Encode(newUUIDs)
}
