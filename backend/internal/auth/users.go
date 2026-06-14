package auth

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/maxbrc/photo-portfolio/backend/internal/db"
)

type UserRequest struct {
	Username *string `json:"username"`
	Password *string `json:"password"`
}

type ReducedUser struct {
	ID       int    `json:"id"`
	Username string `json:"username"`
}

type TokenBundle struct {
	Access  string `json:"access"`
	Refresh string `json:"refresh"`
}

func UpdateUser(reqBody []byte, rawUserID string) error {
	var updateRequest UserRequest
	err := json.Unmarshal(reqBody, &updateRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	targetUserID, err := strconv.Atoi(rawUserID)
	if err != nil {
		return fmt.Errorf("failed to parse user id parameter: %v", err)
	}

	currentUser, userExists, err := db.GetUserByID(targetUserID)
	if err != nil {
		return fmt.Errorf("failed to check if user already exists: %v", err)
	}

	if !userExists {
		return fmt.Errorf("user with that id already exists")
	}

	rawUser := *currentUser

	if updateRequest.Password != nil && *updateRequest.Password != "" {
		passwordHash := GeneratePasswordHash(*updateRequest.Password)
		rawUser.Argon2IDString = passwordHash
	}
	if updateRequest.Username != nil && *updateRequest.Username != "" {
		rawUser.Username = *updateRequest.Username
	}

	err = db.UpdateUser(targetUserID, &rawUser)
	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func GetUsers() ([]*ReducedUser, error) {
	rawUsers, err := db.GetUsers()
	if err != nil {
		return nil, fmt.Errorf("failed to get users: %v", err)
	}

	reducedUsers := make([]*ReducedUser, 0)
	for _, rawUser := range rawUsers {
		reducedUser := ReducedUser{
			ID:       rawUser.ID,
			Username: rawUser.Username,
		}

		reducedUsers = append(reducedUsers, &reducedUser)
	}

	return reducedUsers, nil
}

func DeleteUser(username string) error {
	err := db.DeleteUser(username)
	if err != nil {
		return fmt.Errorf("failed to delete user: %v", err)
	}

	return nil
}

func CreateUser(reqBody []byte) error {
	var creationRequest UserRequest
	err := json.Unmarshal(reqBody, &creationRequest)
	if err != nil {
		return fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	if creationRequest.Username == nil || creationRequest.Password == nil || *creationRequest.Username == "" || *creationRequest.Password == "" {
		return fmt.Errorf("need both a username and password that is not empty")
	}

	_, userExists, err := db.GetUserByUsername(*creationRequest.Username)
	if err != nil {
		return fmt.Errorf("failed to check if user already exists: %v", err)
	}

	if userExists {
		return fmt.Errorf("user with that username already exists")
	}

	passwordHash := GeneratePasswordHash(*creationRequest.Password)

	rawUser := db.RawUser{
		Username:       *creationRequest.Username,
		Argon2IDString: passwordHash,
	}

	err = db.InsertUser(&rawUser)
	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

func VerifyUser(user *UserRequest) (bool, error) {
	rawUser, userFound, err := db.GetUserByUsername(*user.Username)
	if err != nil {
		return false, fmt.Errorf("failed to get user: %v", err)
	}

	if !userFound {
		return false, nil
	}

	valid, err := VerifyPasswordHash(*user.Password, rawUser.Argon2IDString)
	if err != nil {
		return false, fmt.Errorf("failed to verify password hash: %v", err)
	}

	return valid, nil
}

func AuthenticateUser(reqBody []byte) (*TokenBundle, int, error) {
	var user UserRequest
	err := json.Unmarshal(reqBody, &user)
	if err != nil {
		return nil, 500, fmt.Errorf("failed to unmarshal request body: %v", err)
	}

	userVerified, err := VerifyUser(&user)
	if err != nil {
		return nil, 500, fmt.Errorf("failed to verify user: %v", err)
	}

	if !userVerified {
		return nil, 401, nil
	}

	rawUser, _, err := db.GetUserByUsername(*user.Username)
	if err != nil {
		return nil, 500, fmt.Errorf("failed to get user: %v", err)
	}

	accessToken, err := GenerateAccessToken(fmt.Sprint(rawUser.ID))
	if err != nil {
		return nil, 500, fmt.Errorf("failed to generate access token: %v", err)
	}

	refreshToken, err := generateRefreshToken(fmt.Sprint(rawUser.ID))
	if err != nil {
		return nil, 500, fmt.Errorf("failed to generate refresh token: %v", err)
	}

	return &TokenBundle{Access: accessToken, Refresh: refreshToken}, 200, nil
}

func ValidateToken(token string, tokenType string) (bool, string, error) {
	parsedToken, userID, err := parseToken(token)
	if err != nil {
		return false, "", fmt.Errorf("failed to parse token: %v", err)
	}

	claims, ok := parsedToken.Claims.(*CustomClaims)
	if !ok {
		return false, "", fmt.Errorf("failed to parse claims")
	}

	expiresAt, err := claims.RegisteredClaims.GetExpirationTime()
	if err != nil {
		return false, "", fmt.Errorf("failed to get exp claim: %v", err)
	}

	if time.Now().UTC().After(expiresAt.Time) {
		return false, "", fmt.Errorf("Token expired")
	}

	if claims.Type != tokenType {
		return false, "", fmt.Errorf("Invalid token type used")
	}

	return true, userID, nil
}

func ProcessAuthorizationHeader(r *http.Request) (bool, error) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return false, fmt.Errorf("no Authorization header present")
	}

	if !strings.HasPrefix(authHeader, "Bearer ") {
		return false, fmt.Errorf("authorization scheme should be bearer token")
	}

	receivedAccessToken := strings.TrimPrefix(authHeader, "Bearer ")

	tokenValid, _, err := ValidateToken(receivedAccessToken, "access")
	if err != nil {
		return false, fmt.Errorf("failed to validate token: %v", err)
	}

	if !tokenValid {
		return false, fmt.Errorf("You shouldn't see this error message. The token is invalid.")
	}

	return true, nil
}
