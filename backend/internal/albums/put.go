package albums

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/maxbrc/richard-freier/backend/internal/db"
	"github.com/maxbrc/richard-freier/backend/internal/models"
)

func PutAlbum(reqBody []byte) error {
	var album models.Album

	err := json.Unmarshal(reqBody, &album)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	err = db.ReplaceAlbum(&album)
	if err != nil {
		return fmt.Errorf("failed to replace album: %v", err)
	}

	return nil
}

func ReplaceAlbumImageAssignments(reqBody []byte, albumID string) error {
	var patchObject map[string]int
	err := json.Unmarshal(reqBody, &patchObject)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	parsedAlbumID, err := strconv.Atoi(albumID)
	if err != nil {
		return fmt.Errorf("failed to parse album id: %v", err)
	}

	return db.ReplaceAlbumImageAssignments(parsedAlbumID, patchObject)
}
