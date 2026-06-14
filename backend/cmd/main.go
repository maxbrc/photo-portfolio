package main

import (
	"fmt"
	"os"

	"github.com/maxbrc/richard-freier/backend/api"
	"github.com/maxbrc/richard-freier/backend/config"
	"github.com/maxbrc/richard-freier/backend/internal/auth"
	"github.com/maxbrc/richard-freier/backend/internal/db"
)

func main() {
	err := config.LoadConfig()
	if err != nil {
		fmt.Printf("Failed to load config: %v", err)
		os.Exit(1)
	}

	err = auth.LoadKeys()
	if err != nil {
		fmt.Printf("Failed to load keys: %v", err)
		os.Exit(1)
	}

	err = db.InitClient()
	if err != nil {
		panic(err)
	}

	err = db.InitDatabase()
	if err != nil {
		panic(err)
	}

	err = os.MkdirAll("data/photos/originals", 0755)
	if err != nil {
		panic(fmt.Sprintf("failed to create photos directory: %v", err))
	}

	err = os.MkdirAll("data/photos/derivatives", 0755)
	if err != nil {
		panic(fmt.Sprintf("Failed to create derivatives directory: %v", err))
	}

	fmt.Println("Backend running...")
	api.SetupRoutes()
}
