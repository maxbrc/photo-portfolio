package auth

import (
	"crypto/ed25519"
	"crypto/rand"
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	privKey  ed25519.PrivateKey
	pubKey   ed25519.PublicKey
	seedPath string = "data/secrets/jwt_seed.bin"
)

func LoadKeys() error {
	var seed []byte
	var err error
	seed, err = os.ReadFile(seedPath)
	if err != nil {
		if os.IsNotExist(err) {
			seed, err = generateSeed()
			if err != nil {
				return fmt.Errorf("Failed to generate ed25519 seed: %v", err)
			}
		} else {
			return fmt.Errorf("failed to read ed25519 key seed: %v", err)
		}
	}

	privKey = ed25519.NewKeyFromSeed(seed)
	pubKey = privKey.Public().(ed25519.PublicKey)

	return nil
}

func generateSeed() ([]byte, error) {
	seed := make([]byte, 32)
	_, err := rand.Read(seed)
	if err != nil {
		return nil, fmt.Errorf("Failed to obtain random bytes: %v", err)
	}

	err = os.MkdirAll("data/secrets", 0700)
	if err != nil && !os.IsExist(err) {
		return nil, fmt.Errorf("Failed to create secrets directory: %v", err)
	}

	err = os.WriteFile(seedPath, seed, 0600)
	if err != nil {
		return nil, fmt.Errorf("Failed to write generated seed: %v", err)
	}

	return seed, nil
}

func generateToken(claims *CustomClaims) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodEdDSA, claims)
	signedString, err := token.SignedString(privKey)
	if err != nil {
		return "", fmt.Errorf("failed to create signed string: %v", err)
	}

	return signedString, nil
}

func GenerateAccessToken(userID string) (string, error) {
	issuedTime := time.Now().UTC()
	expireTime := issuedTime.Add(15 * time.Minute)

	claims := CustomClaims{
		Type: "access",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(issuedTime),
			ExpiresAt: jwt.NewNumericDate(expireTime),
		},
	}

	token, err := generateToken(&claims)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %v", err)
	}

	return token, nil
}

func generateRefreshToken(userID string) (string, error) {
	issuedTime := time.Now().UTC()
	expireTime := issuedTime.Add(30 * 24 * time.Hour)

	claims := CustomClaims{
		Type: "refresh",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			IssuedAt:  jwt.NewNumericDate(issuedTime),
			ExpiresAt: jwt.NewNumericDate(expireTime),
		},
	}

	token, err := generateToken(&claims)
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %v", err)
	}

	return token, nil
}

type CustomClaims struct {
	Type string `json:"type"`
	jwt.RegisteredClaims
}

func parseToken(token string) (*jwt.Token, string, error) {
	parser := jwt.NewParser(jwt.WithValidMethods([]string{"EdDSA"}))
	parsedToken, err := parser.ParseWithClaims(token, &CustomClaims{}, func(*jwt.Token) (interface{}, error) {
		return pubKey, nil
	})
	if err != nil {
		return nil, "", fmt.Errorf("failed to parse token: %v", err)
	}

	if !parsedToken.Valid {
		return nil, "", fmt.Errorf("token is invalid")
	}

	claims, _ := parsedToken.Claims.(*CustomClaims)
	userID, _ := claims.RegisteredClaims.GetSubject()

	return parsedToken, userID, nil
}
