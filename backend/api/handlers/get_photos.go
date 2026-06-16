package handlers

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"golang.org/x/sync/semaphore"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
)

const (
	originalsDir   = "data/photos/originals"
	derivativesDir = "data/photos/derivatives"
)

var sem *semaphore.Weighted = semaphore.NewWeighted(4)

func GetPhotos(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/photos/")
	filename := filepath.Base(path)

	if filename == "" || filename == "." {
		http.Error(w, "Invalid filename", http.StatusBadRequest)
		return
	}

	widthStr := r.URL.Query().Get("width")
	heightStr := r.URL.Query().Get("height")

	width, widthErr := strconv.Atoi(widthStr)
	height, heightErr := strconv.Atoi(heightStr)

	if widthErr != nil && heightErr != nil {
		originalPath := filepath.Join(originalsDir, filename)
		if _, err := os.Stat(originalPath); err != nil {
			http.Error(w, "Image not found", http.StatusNotFound)
			return
		}
		http.ServeFile(w, r, originalPath)
		return
	}

	if width <= 0 || height <= 0 || width > 4000 || height > 4000 {
		http.Error(w, "Invalid dimensions (must be between 1 and 4000)", http.StatusBadRequest)
		return
	}

	originalPath := filepath.Join(originalsDir, filename)
	resizedPath := filepath.Join(derivativesDir, fmt.Sprintf("%d_%d_%s", width, height, filename))

	if _, err := os.Stat(resizedPath); err == nil {
		http.ServeFile(w, r, resizedPath)
		return
	}

	ok := func() bool {
		err := sem.Acquire(context.Background(), 1)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to acquire semaphore: %v", err), 500)
			return false
		}
		defer sem.Release(1)

		src, err := imaging.Open(originalPath)
		if err != nil {
			http.Error(w, "Image not found", http.StatusNotFound)
			return true
		}

		dst := imaging.Fill(src, width, height, imaging.Center, imaging.Lanczos)

		f, err := os.Create(resizedPath)
		if err != nil {
			http.Error(w, fmt.Sprintf("Failed to create resized image file: %v", err), 500)
			return false
		}
		defer f.Close()

		err = webp.Encode(f, dst, &webp.Options{Quality: 90})
		if err != nil {
			http.Error(w, fmt.Sprintf("failed to encode resized image to WebP: %v", err), 500)
			return false
		}

		return true
	}()

	if !ok {
		return
	}

	http.ServeFile(w, r, resizedPath)
}
