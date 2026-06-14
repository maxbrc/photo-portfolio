package api

import (
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/maxbrc/richard-freier/backend/api/handlers"
	"github.com/maxbrc/richard-freier/backend/config"
)

func SetupRoutes() {
	nodeURL, _ := url.Parse(config.AppConfig.NodeURL)
	nodeProxy := httputil.NewSingleHostReverseProxy(nodeURL)

	mux := http.NewServeMux()

	mux.HandleFunc("GET /photos/", handlers.GetPhotos)

	mux.HandleFunc("GET /api/images/{album_id}", handlers.GetImagesForAlbumID)
	mux.HandleFunc("GET /api/images", handlers.GetImages)
	mux.HandleFunc("POST /api/images", handlers.PostImages)
	mux.HandleFunc("PATCH /api/images/{uuid}", handlers.PatchImages)
	mux.HandleFunc("DELETE /api/images/{uuid}", handlers.DeleteImages)
	mux.HandleFunc("POST /api/images/cleanup", handlers.PostImagesCleanup)

	mux.HandleFunc("GET /api/albums", handlers.GetAlbums)
	mux.HandleFunc("PUT /api/albums", handlers.PutAlbums)
	mux.HandleFunc("POST /api/albums", handlers.PostAlbums)
	mux.HandleFunc("PATCH /api/albums/{album_id}", handlers.PatchAlbums)
	mux.HandleFunc("DELETE /api/albums/{album_id}", handlers.DeleteAlbums)
	mux.HandleFunc("GET /api/albums/assignments", handlers.GetAlbumsAssignments)
	mux.HandleFunc("PUT /api/albums/assignments/{album_id}", handlers.PutAlbumsAssignments)

	mux.HandleFunc("GET /api/site-content", handlers.GetSiteContent)
	mux.HandleFunc("PATCH /api/site-content", handlers.PatchSiteContent)

	mux.HandleFunc("GET /api/users", handlers.GetUsers)
	mux.HandleFunc("POST /api/users", handlers.PostUsers)
	mux.HandleFunc("PATCH /api/users/{user_id}", handlers.PatchUsers)
	mux.HandleFunc("DELETE /api/users/{username}", handlers.DeleteUsers)

	mux.HandleFunc("POST /api/login", handlers.AuthenticateUser)
	mux.HandleFunc("GET /api/refresh-token", handlers.RefreshToken)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		nodeProxy.ServeHTTP(w, r)
	})

	http.ListenAndServe(config.AppConfig.BindAddress, mux)
}
