package albums

import (
	"fmt"

	"github.com/maxbrc/photo-portfolio/backend/internal/db"
	"github.com/maxbrc/photo-portfolio/backend/internal/models"
)

func GetAlbums() ([]*models.Album, error) {
	return db.GetAlbums()
}

func GetAlbumImageAssignments() (models.AlbumImagesAssignments, error) {
	rawAssignments, err := db.GetAlbumImageAssignments()
	if err != nil {
		return nil, fmt.Errorf("failed to get assignments from database: %v", err)
	}

	assignments := make(map[int]map[string]int)
	for _, rawAsg := range rawAssignments {
		if assignments[rawAsg.AlbumID] == nil {
			assignments[rawAsg.AlbumID] = make(map[string]int)
		}

		assignments[rawAsg.AlbumID][rawAsg.ImageUUID] = rawAsg.Rank
	}

	return assignments, nil
}
