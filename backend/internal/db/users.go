package db

import "fmt"

type RawUser struct {
	ID             int
	Argon2IDString string
	Username       string
}

func InsertUser(user *RawUser) error {
	args := []any{user.Argon2IDString, user.Username}
	res, err := db.Exec("INSERT INTO users (argon2id, username) VALUES (?, ?)", args...)
	if err != nil {
		return fmt.Errorf("failed to insert user: %v", err)
	}

	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get number of affected rows")
	}

	if rowsAffected != 1 {
		return fmt.Errorf("unexpected affected row count other than 1")
	}

	return nil
}

// Returns:
// - *RawUser: User if found
// - bool: true if user exists and false if user doesn't exist
// - error: Database or scanning errors
func GetUserByUsername(username string) (*RawUser, bool, error) {
	rows, err := db.Query("SELECT * FROM users WHERE username = ?", username)
	if err != nil {
		return nil, false, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var user RawUser
	err = rows.Scan(&user.ID, &user.Argon2IDString, &user.Username)
	if err != nil {
		return nil, false, fmt.Errorf("failed to scan row: %v", err)
	}

	return &user, true, nil
}

func GetUserByID(userID int) (*RawUser, bool, error) {
	rows, err := db.Query("SELECT * FROM users WHERE id = ?", userID)
	if err != nil {
		return nil, false, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var user RawUser
	err = rows.Scan(&user.ID, &user.Argon2IDString, &user.Username)
	if err != nil {
		return nil, false, fmt.Errorf("failed to scan row: %v", err)
	}

	return &user, true, nil
}

func DeleteUser(username string) error {
	_, userExists, err := GetUserByUsername(username)
	if err != nil {
		return fmt.Errorf("failed to get whether user exists: %v", err)
	}

	if !userExists {
		return fmt.Errorf("this user does not exist")
	}

	_, err = db.Exec("DELETE FROM users WHERE username = ?", username)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func UpdateUser(targetUserID int, user *RawUser) error {
	_, userExists, err := GetUserByID(targetUserID)
	if err != nil {
		return fmt.Errorf("failed to get whether user exists: %v", err)
	}

	if !userExists {
		return fmt.Errorf("this user does not exist")
	}

	_, err = db.Exec("UPDATE users SET username=?, argon2id=? WHERE id = ?", user.Username, user.Argon2IDString, targetUserID)
	if err != nil {
		return fmt.Errorf("failed to exec db: %v", err)
	}

	return nil
}

func GetUsers() ([]*RawUser, error) {
	rows, err := db.Query("SELECT * FROM users")
	if err != nil {
		return nil, fmt.Errorf("failed to query db: %v", err)
	}

	defer rows.Close()

	users := make([]*RawUser, 0)
	for rows.Next() {
		var user RawUser
		err := rows.Scan(&user.ID, &user.Argon2IDString, &user.Username)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %v", err)
		}

		users = append(users, &user)
	}

	return users, nil
}
