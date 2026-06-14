package albums

import (
	"encoding/json"
	"fmt"

	"github.com/maxbrc/richard-freier/backend/internal/db"
	"github.com/maxbrc/richard-freier/backend/internal/models"
)

func PostAlbums(req []byte) (string, error) {
	var requestBody models.Album
	err := json.Unmarshal(req, &requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to parse request body: %v", err)
	}

	err = db.CreateAlbum(&requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to create album: %v", err)
	}

	return "success", nil
}
