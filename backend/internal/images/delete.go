package images

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/maxbrc/photo-portfolio/backend/internal/db"
)

func DeleteImage(uuid string) error {
	err := db.DeleteImage(uuid)
	if err != nil {
		return fmt.Errorf("failed to delete image in db: %v", err)
	}

	err = DeletePhotos(uuid)
	if err != nil {
		return fmt.Errorf("failed to delete image in directory: %v", err)
	}

	return nil
}

func DeletePhotos(uuid string) error {
	originalsDir := "data/photos/originals"
	derivativesDir := "data/photos/derivatives"

	originalPattern := filepath.Join(originalsDir, uuid+".*")
	originalMatches, err := filepath.Glob(originalPattern)
	if err != nil {
		return fmt.Errorf("failed to find original photos: %v", err)
	}

	if len(originalMatches) == 0 {
		return nil
	}
	originalFile := originalMatches[0]
	extension := filepath.Ext(originalFile)
	err = os.Remove(originalFile)
	if err != nil {
		return fmt.Errorf("failed to delete original %s: %v", originalFile, err)
	}

	pattern := fmt.Sprintf("*_*_%s%s", uuid, extension)
	derivativePattern := filepath.Join(derivativesDir, pattern)
	derivativeMatches, err := filepath.Glob(derivativePattern)
	if err != nil {
		return fmt.Errorf("failed to find derivatives: %v", err)
	}

	for _, file := range derivativeMatches {
		err := os.Remove(file)
		if err != nil {
			return fmt.Errorf("failed to delete derivative photo %s: %v", file, err)
		}
	}

	return nil
}
