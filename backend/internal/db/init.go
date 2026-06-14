package db

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"github.com/maxbrc/photo-portfolio/backend/config"
)

var db *sql.DB

func InitClient() error {
	var err error
	db, err = sql.Open("mysql", config.AppConfig.MySQLConnectionString)
	if err != nil {
		return fmt.Errorf("failed to open sql database connection: %v", err)
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)

	err = db.Ping()
	if err != nil {
		return err
	}

	return nil
}

func InitDatabase() error {
	err := db.QueryRow("SHOW TABLES").Scan()
	if !errors.Is(err, sql.ErrNoRows) {
		return nil
	}

	statements := []string{
		`CREATE TABLE images (
			uuid VARCHAR(255) NOT NULL,
			landscape BOOLEAN NOT NULL,
			PRIMARY KEY (uuid)
		)`,
		`CREATE TABLE albums (
			id INT NOT NULL AUTO_INCREMENT,
			name VARCHAR(50) NOT NULL,
			cover_image_uuid VARCHAR(255),
			rank INT NOT NULL,
			PRIMARY KEY (id),
			FOREIGN KEY (cover_image_uuid) REFERENCES images(uuid)
		)`,
		`CREATE TABLE images_albums (
			image_uuid VARCHAR(255) NOT NULL,
			album_id INT NOT NULL,
			rank INT NOT NULL,
			PRIMARY KEY (image_uuid, album_id),
			FOREIGN KEY (image_uuid) REFERENCES images(uuid),
			FOREIGN KEY (album_id) REFERENCES albums(id)
		)`,
		`CREATE TABLE users (
			id INT NOT NULL AUTO_INCREMENT,
			argon2id VARCHAR(255) NOT NULL,
			username VARCHAR(50) NOT NULL,
			PRIMARY KEY (id)
		)`,
		`INSERT INTO users VALUES (
			0,
			'$argon2id$v=19$m=65536,t=3,p=4$SzJtR2ZBZUNTT1d1eFJXdw$BNkpPtvrJ+IC4bf5kXLD0NMt4e79lGK8TRzoienDsWs',
			'admin'
		)`,
	} // Password: snap!

	for _, statement := range statements {
		_, err := db.Exec(statement)
		if err != nil {
			return fmt.Errorf("Failed to create table: %v", err)
		}
	}

	fmt.Println("Successfully initialized database!")

	return nil
}
