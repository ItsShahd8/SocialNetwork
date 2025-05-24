package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"social/pkg/api"
	"social/pkg/db/sqlite"

	"github.com/gorilla/sessions"
)

var store *sessions.CookieStore

func init() {
	secret := os.Getenv("SESSION_KEY")
	if secret == "" {
		secret = "dev-secret-key"
	}
	store = sessions.NewCookieStore([]byte(secret))
	store.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteLaxMode,
	}
}

func main() {
	dbPath := "data/socialnetwork.db"

	if err := os.MkdirAll(filepath.Dir(dbPath), os.ModePerm); err != nil {
		log.Fatal("failed to create db folder:", err)
	}

	db, err := sqlite.ConnectAndMigrate(dbPath, "pkg/db/migrations/sqlite") // ✅ No file://
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/api/register", api.RegisterHandler(db))
	http.HandleFunc("/api/login", api.LoginHandler(db, store))
	http.HandleFunc("/api/logout", api.LogoutHandler(store))

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("👋 Backend is running. Use /api/* endpoints."))
	})
	log.Println("✅ Backend is running on http://localhost:8080/")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
