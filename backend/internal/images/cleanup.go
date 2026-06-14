package images

import (
	"fmt"
	"path/filepath"
	"slices"
	"strings"

	"github.com/maxbrc/photo-portfolio/backend/internal/db"
)

func CleanupImages() (int, error) {
	originalsDir := "../photos/originals"

	originalMatches, err := filepath.Glob(filepath.Join(originalsDir, "*"))
	if err != nil {
		return 0, fmt.Errorf("failed to find original photos: %v", err)
	}

	var dirList []string
	for _, path := range originalMatches {
		base := filepath.Base(path)
		dotIndex := strings.Index(base, ".")
		uuid := base[:dotIndex]
		dirList = append(dirList, uuid)
	}

	dbImageUUIDs, err := db.GetAllImages()
	if err != nil {
		return 0, fmt.Errorf("failed to get all images: %v", err)
	}

	var dbList []string
	for _, image := range dbImageUUIDs {
		dbList = append(dbList, image.UUID)
	}

	count := 0
	for _, uuid := range dirList {
		if !(slices.Contains(dbList, uuid)) {
			err := DeletePhotos(uuid)
			if err != nil {
				return 0, fmt.Errorf("failed to delete photo %s: %v", uuid, err)
			}
			count++
		}
	}

	return count, nil
}
