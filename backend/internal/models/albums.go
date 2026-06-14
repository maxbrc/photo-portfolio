package models

type AlbumImagesAssignments map[int]map[string]int // album_id -> images -> rank

type AlbumPatchRequest struct {
	Rank *int `json:"rank"`
}

type Album struct {
	ID             int     `json:"id"`
	Name           string  `json:"name"`
	CoverImageUUID *string `json:"cover_image_uuid"`
	Rank           int     `json:"rank"`
}
