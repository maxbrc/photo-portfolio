package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	BindAddress           string
	MySQLConnectionString string
	NodeURL               string
}

var AppConfig Config

func LoadConfig() error {
	godotenv.Load(".env")
	godotenv.Load("../.env")

	AppConfig.BindAddress = requireEnv("BIND_ADDRESS", ":3000")
	AppConfig.NodeURL = requireEnv("NODE_URL", "http://localhost:3010")

	dbUser, err := mustEnv("DB_USER")
	if err != nil {
		return err
	}
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := requireEnv("DB_HOST", "localhost")
	dbPort := requireEnv("DB_PORT", "3306")
	dbName, err := mustEnv("DB_NAME")
	if err != nil {
		return err
	}

	AppConfig.MySQLConnectionString = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s", dbUser, dbPassword, dbHost, dbPort, dbName)

	_, err = os.ReadFile("data/config.json")
	if err != nil {
		if os.IsNotExist(err) {
			data, err := os.ReadFile("config/config.default.json")
			if err != nil {
				return fmt.Errorf("failed to read config.default.json: %v", err)
			}

			err = os.MkdirAll("data", 0755)
			if err != nil {
				return fmt.Errorf("failed to create data directory: %v", err)
			}

			err = os.WriteFile("data/config.json", data, 0644)
			if err != nil {
				return fmt.Errorf("failed to write config.json with defaults: %v", err)
			}
		} else {
			return fmt.Errorf("failed to read config.json: %v", err)
		}
	}

	return nil
}

func requireEnv(key, fallback string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return fallback
}

func mustEnv(key string) (string, error) {
	v, ok := os.LookupEnv(key)
	if !ok || v == "" {
		return "", fmt.Errorf("required env var %s is not set", key)
	}
	return v, nil
}
