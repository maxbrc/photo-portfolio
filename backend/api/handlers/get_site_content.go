package handlers

import (
	"fmt"
	"net/http"
	"os"
)

func GetSiteContent(w http.ResponseWriter, r *http.Request) {
	data, err := os.ReadFile("data/config.json")
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read site content configuration: %v", err), 500)
		return
	}

	w.Header().Add("Content-Type", "application/json")

	w.Write(data)
}
