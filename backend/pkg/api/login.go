package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"social/pkg/db/sqlite"

	"github.com/gorilla/sessions"

	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func LoginHandler(db *sql.DB, store *sessions.CookieStore) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		var req LoginRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		user, err := sqlite.GetUserByEmail(db, req.Email)
		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
		if err != nil {
			http.Error(w, "Invalid email or password", http.StatusUnauthorized)
			return
		}

		// Create session
		session, _ := store.Get(r, "session")
		session.Values["user_id"] = user.ID
		session.Save(r, w)

		w.Write([]byte("Logged in successfully"))
	}
}
