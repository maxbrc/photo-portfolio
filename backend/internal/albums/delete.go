package albums

import (
	"fmt"

	"github.com/maxbrc/richard-freier/backend/internal/db"
)

func DeleteAlbum(albumID int) (string, error) {
	err := db.DeleteAlbum(albumID)
	if err != nil {
		return "", fmt.Errorf("failed to delete album: %v", err)
	}

	return "success", nil
}
