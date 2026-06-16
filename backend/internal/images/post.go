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

func AddImage(data io.Reader, isJPG bool) (string, error) {
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

	newImageFilename := newImageUUID + ".webp"
	newImageFilepath := fmt.Sprintf("data/photos/originals/%s", newImageFilename)
	f, err := os.Create(newImageFilepath)
	if err != nil {
		db.DeleteImage(newImageUUID)
		return "", fmt.Errorf("failed to create new image file: %v", err)
	}

	defer f.Close()

	var options *webp.Options
	if isJPG {
		options = &webp.Options{Quality: 90}
	} else {
		options = &webp.Options{Lossless: true}
	}

	err = webp.Encode(f, image, options)
	if err != nil {
		return "", fmt.Errorf("failed to encode to webp: %v", err)
	}

	err = db.InsertImage(imageObject)
	if err != nil {
		os.Remove(newImageFilepath)
		return "", fmt.Errorf("failed to insert image into database: %v", err)
	}

	return newImageUUID, nil
}
