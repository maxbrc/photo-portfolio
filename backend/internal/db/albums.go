package db

import (
	"fmt"

	"github.com/maxbrc/richard-freier/backend/internal/models"
)

func GetAlbums() ([]*models.Album, error) {
	rows, err := db.Query("SELECT * FROM albums ORDER BY rank DESC")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	albums := make([]*models.Album, 0)
	for rows.Next() {
		var album models.Album
		err := rows.Scan(&album.ID, &album.Name, &album.CoverImageUUID, &album.Rank)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		albums = append(albums, &album)
	}

	return albums, nil
}

func ReplaceAlbum(album *models.Album) error {
	_, err := db.Exec("UPDATE albums SET id=?, name=?, cover_image_uuid=?, rank=? WHERE id=?", album.ID, album.Name, album.CoverImageUUID, album.ID, album.Rank)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func CreateAlbum(album *models.Album) error {
	_, err := db.Exec("INSERT INTO albums VALUES (?, ?, ?, ?)", album.ID, album.Name, album.CoverImageUUID, album.Rank)
	if err != nil {
		return fmt.Errorf("failed to create album: %v", err)
	}

	return nil
}

func PatchAlbumRank(albumID int, rank int) error {
	_, err := db.Exec("UPDATE albums SET rank=? WHERE id=?", rank, albumID)
	if err != nil {
		return fmt.Errorf("failed to patch album rank: %v", err)
	}
	return nil
}

func DeleteAlbum(albumID int) error {
	_, err := db.Exec("DELETE FROM images_albums WHERE album_id = ?", albumID)
	if err != nil {
		return err
	}

	_, err = db.Exec("DELETE FROM albums WHERE id = ?", albumID)
	if err != nil {
		return fmt.Errorf("failed to delete album: %v", err)
	}

	return nil
}

func RowCount(albumName, filterKey string, filterValue int) (int, error) {
	var count int
	query := fmt.Sprintf("SELECT COUNT(*) FROM %s WHERE %s = ?", albumName, filterKey)
	err := db.QueryRow(query, filterValue).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to query db: %v", err)
	}

	return count, nil
}
