package albums

import (
	"encoding/json"
	"fmt"

	"github.com/maxbrc/richard-freier/backend/internal/db"
	"github.com/maxbrc/richard-freier/backend/internal/models"
)

func PatchAlbum(reqBody []byte, albumID int) error {
	var req models.AlbumPatchRequest
	if err := json.Unmarshal(reqBody, &req); err != nil {
		return fmt.Errorf("failed to unmarshal request: %v", err)
	}

	if req.Rank == nil {
		return fmt.Errorf("empty patch request")
	}

	return db.PatchAlbumRank(albumID, *req.Rank)
}
