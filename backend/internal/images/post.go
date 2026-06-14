package images

import (
	"fmt"
	"io"
	"os"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/google/uuid"
	"github.com/maxbrc/photo-portfolio/backend/internal/db"
	"github.com/maxbrc/photo-portfolio/backend/internal/models"
)

func AddImage(data io.Reader) (string, error) {
	newImageUUID := uuid.New().String()

	image, err := imaging.Decode(data, imaging.AutoOrientation(true))
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %v", err)
	}

	imageBounds := image.Bounds()
	imageWidth := imageBounds.Dx()
	imageHeight := imageBounds.Dy()

	isLandscape := imageWidth >= imageHeight

	imageObject := &models.Image{
		UUID:      newImageUUID,
		Landscape: isLandscape,
	}

	err = db.InsertImage(imageObject)
	if err != nil {
		return "", fmt.Errorf("failed to insert image into database: %v", err)
	}

	newImageFilename := newImageUUID + ".webp"
	f, err := os.Create(fmt.Sprintf("data/photos/originals/%s", newImageFilename))
	if err != nil {
		db.DeleteImage(newImageUUID)
		return "", fmt.Errorf("failed to create new image file: %v", err)
	}

	defer f.Close()

	options := &webp.Options{Lossless: true}
	err = webp.Encode(f, image, options)
	if err != nil {
		return "", fmt.Errorf("failed to encode to webp: %v", err)
	}

	return newImageUUID, nil
}
