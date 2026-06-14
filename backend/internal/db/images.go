package db

import (
	"fmt"
	"strings"

	"github.com/maxbrc/photo-portfolio/backend/internal/models"
)

type AlbumImageAssignment struct {
	ImageUUID string
	AlbumID   int
	Rank      int
}

func GetAllImages() ([]*models.Image, error) {
	rows, err := db.Query("SELECT * FROM images")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	images := make([]*models.Image, 0)
	for rows.Next() {
		var image models.Image
		err := rows.Scan(&image.UUID, &image.Landscape)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		images = append(images, &image)
	}

	return images, nil
}

func GetImagesForAlbumID(albumID *int) ([]*models.AlbumImage, error) {
	rows, err := db.Query("SELECT i.*, ia.rank FROM images i JOIN images_albums ia ON i.uuid = ia.image_uuid WHERE ia.album_id = ? ORDER BY ia.rank ASC", albumID)
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	images := make([]*models.AlbumImage, 0)
	for rows.Next() {
		var image models.AlbumImage
		err := rows.Scan(&image.UUID, &image.Landscape, &image.Rank)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		images = append(images, &image)
	}

	return images, nil
}

func GetAlbumsForImage(uuid string) (map[int]int, error) {
	rows, err := db.Query("SELECT album_id, rank FROM images_albums WHERE image_uuid = ?", uuid)
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}

	defer rows.Close()

	albums := make(map[int]int, 0)
	for rows.Next() {
		var albumID, rank int
		err := rows.Scan(&albumID, &rank)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		albums[albumID] = rank
	}

	return albums, nil
}

func InsertImage(img *models.Image) error {
	err := insertImageOnly(img)
	if err != nil {
		return err
	}

	return nil
}

func insertImageOnly(img *models.Image) error {
	_, err := db.Exec("INSERT INTO images VALUES (?, ?)", img.UUID, img.Landscape)
	if err != nil {
		return fmt.Errorf("failed to exec database: %v", err)
	}

	return nil
}

func UpdateImage(uuid string, patchObject *models.ImagePatchRequest) error {
	query := "UPDATE images SET"
	var values []string
	var args []any

	if patchObject.Landscape != nil {
		values = append(values, "landscape = ?")
		args = append(args, *patchObject.Landscape)
	}

	if len(values) > 0 {
		query += " " + strings.Join(values, ", ") + " WHERE uuid = ?"
		args = append(args, uuid)

		_, err := db.Exec(query, args...)
		if err != nil {
			return fmt.Errorf("failed to run database exec: %v", err)
		}
	}

	return nil
}

func GetAlbumImageAssignments() ([]AlbumImageAssignment, error) {
	rows, err := db.Query("SELECT * FROM images_albums")
	if err != nil {
		return nil, fmt.Errorf("failed to query database: %v", err)
	}

	defer rows.Close()

	assignments := make([]AlbumImageAssignment, 0)
	for rows.Next() {
		var assignment AlbumImageAssignment
		err := rows.Scan(&assignment.ImageUUID, &assignment.AlbumID, &assignment.Rank)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		assignments = append(assignments, assignment)
	}

	return assignments, nil
}

func ReplaceAlbumImageAssignments(albumID int, patchObject map[string]int) error {
	_, err := db.Exec("DELETE FROM images_albums WHERE album_id = ?", albumID)
	if err != nil {
		return fmt.Errorf("failed to exec database: %v", err)
	}

	for imageUUID, rank := range patchObject {
		_, err := db.Exec("INSERT INTO images_albums VALUES (?, ?, ?)", imageUUID, albumID, rank)
		if err != nil {
			return fmt.Errorf("failed to exec database: %v", err)
		}
	}

	return nil
}

func AssignImageToAlbums(imageUUID string, toAlbums map[int]int) error {
	for albumID, rank := range toAlbums {
		_, err := db.Exec("INSERT INTO images_albums VALUES (?, ?, ?)", imageUUID, albumID, rank)
		if err != nil {
			return fmt.Errorf("failed to assign image to album: %v", err)
		}
	}

	return nil
}

func RemoveImageFromAlbum(imageUUID string, fromAlbumID *int) error {
	res, err := db.Exec("DELETE FROM images_albums WHERE image_uuid = ? AND album_id = ?", imageUUID, fromAlbumID)
	if err != nil {
		return fmt.Errorf("failed to exec database: %v", err)
	}

	rowsAffected, _ := res.RowsAffected()
	if rowsAffected != 1 {
		return fmt.Errorf("this image is not assigned to that album!")
	}

	return nil
}

func RemoveImageFromAllAlbums(uuid string) error {
	_, err := db.Exec("DELETE FROM images_albums WHERE image_uuid = ?", uuid)
	if err != nil {
		return fmt.Errorf("failed to exec database: %v", err)
	}

	return nil
}

func DeleteImage(uuid string) error {
	err := RemoveImageFromAllAlbums(uuid)
	if err != nil {
		return fmt.Errorf("failed to remove image from all albums: %v", err)
	}

	_, err = db.Exec("DELETE FROM images WHERE uuid = ?", uuid)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}
