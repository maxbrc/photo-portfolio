package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/maxbrc/photo-portfolio/backend/internal/auth"
)

var allowedSiteContentKeys = map[string]bool{
	"hero":      true,
	"socials":   true,
	"equipment": true,
	"about":     true,
	"impressum": true,
}

func PatchSiteContent(w http.ResponseWriter, r *http.Request) {
	authorized, err := auth.ProcessAuthorizationHeader(r)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to authorize: %v", err), 401)
		return
	}
	if !authorized {
		http.Error(w, "You shouldn't see this error", 500)
		return
	}

	current, err := os.ReadFile("data/config.json")
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read site content: %v", err), 500)
		return
	}

	var doc map[string]json.RawMessage
	if err := json.Unmarshal(current, &doc); err != nil {
		http.Error(w, fmt.Sprintf("failed to parse site content: %v", err), 500)
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to read request body: %v", err), 500)
		return
	}

	var patch map[string]json.RawMessage
	if err := json.Unmarshal(body, &patch); err != nil {
		http.Error(w, fmt.Sprintf("invalid request body: %v", err), 400)
		return
	}

	for key, value := range patch {
		if !allowedSiteContentKeys[key] {
			http.Error(w, fmt.Sprintf("unknown site content key: %q", key), 400)
			return
		}
		doc[key] = value
	}

	updated, err := json.MarshalIndent(doc, "", "    ")
	if err != nil {
		http.Error(w, fmt.Sprintf("failed to serialize site content: %v", err), 500)
		return
	}

	if err := os.WriteFile("data/config.json", updated, 0644); err != nil {
		http.Error(w, fmt.Sprintf("failed to write site content: %v", err), 500)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
