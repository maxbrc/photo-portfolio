package images

import (
	"encoding/json"
	"fmt"

	"github.com/maxbrc/richard-freier/backend/internal/db"
	"github.com/maxbrc/richard-freier/backend/internal/models"
)

func UpdateImage(reqBody []byte, imageUUID string) error {
	var patchRequest models.ImagePatchRequest
	err := json.Unmarshal(reqBody, &patchRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	if patchRequest.Landscape == nil {
		return fmt.Errorf("empty update request")
	}

	err = db.UpdateImage(imageUUID, &patchRequest)
	if err != nil {
		return fmt.Errorf("failed to update image in database: %v", err)
	}

	return nil
}
