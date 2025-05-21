package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	handlers "social/pkg/api"
	"social/pkg/db/sqlite"

	"github.com/gorilla/sessions"
)

var store = sessions.NewCookieStore([]byte("your-secret-key")) // replace with secure random key

func main() {
	dbPath := "data/socialnetwork.db"

	if err := os.MkdirAll(filepath.Dir(dbPath), os.ModePerm); err != nil {
		log.Fatal("failed to create db folder:", err)
	}

	db, err := sqlite.ConnectAndMigrate(dbPath, "pkg/db/migrations/sqlite")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	http.HandleFunc("/api/register", handlers.RegisterHandler(db))
	http.HandleFunc("/api/login", handlers.LoginHandler(db, store)) // if session store is setup
	log.Println("Backend is running...")
	log.Println("http://localhost:8080/")
	log.Fatal(http.ListenAndServe(":8080", nil))

}

func IsAuthenticated(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		userID, ok := session.Values["user_id"]
		if !ok || userID == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}
		next.ServeHTTP(w, r)
	})
}
