package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"golang.org/x/sync/semaphore"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
	"github.com/maxbrc/photo-portfolio/backend/internal/images"
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

	sem := semaphore.NewWeighted(2)
	newUUIDs := make(map[string]string, 0) // original filename -> uuid
	for i := range fileCount {
		file, handler, err := r.FormFile(fmt.Sprintf("file%v", i))
		if err != nil {
			http.Error(w, "Error getting file", http.StatusBadRequest)
			return
		}
		defer file.Close()

		isJPG := strings.HasSuffix(handler.Filename, ".jpg")

		go func() {
			err := sem.Acquire(context.Background(), 1)
			if err != nil {
				resultChannel <- uploadResult{"", "", fmt.Errorf("failed to acquire semaphore: %v", err)}
				return
			}
			defer sem.Release(1)

			uuid, err := images.AddImage(file, isJPG)

			resultChannel <- uploadResult{handler.Filename, uuid, err}
		}()
	}

	for range fileCount {
		result := <-resultChannel

		if result.err != nil {
			http.Error(w, fmt.Sprintf("failed to add image: %v", result.err), 500)
			return
		}

		newUUIDs[result.filename] = result.uuid
	}

	json.NewEncoder(w).Encode(newUUIDs)
}
