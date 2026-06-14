package images

import (
	"fmt"

	"github.com/maxbrc/photo-portfolio/backend/internal/db"
	"github.com/maxbrc/photo-portfolio/backend/internal/models"
)

func GetImagesForAlbumID(albumID *int) ([]*models.AlbumImage, error) {
	images, err := db.GetImagesForAlbumID(albumID)
	if err != nil {
		return nil, fmt.Errorf("failed to get image uuids: %v", err)
	}

	return images, nil
}

func GetAllImages() ([]*models.Image, error) {
	images, err := db.GetAllImages()
	if err != nil {
		return nil, fmt.Errorf("failed to get all images: %v", err)
	}

	return images, nil
}
