package models

type Image struct {
	UUID      string `json:"uuid"`
	Landscape bool   `json:"landscape"`
}

type AlbumImage struct {
	UUID      string `json:"uuid"`
	Landscape bool   `json:"landscape"`
	Rank      int    `json:"rank"`
}

type ImagePatchRequest struct {
	Landscape *bool        `json:"landscape"`
	Albums    *map[int]int `json:"albums"`
}
