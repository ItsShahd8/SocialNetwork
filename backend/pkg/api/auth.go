package api

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/sessions"
	"golang.org/x/crypto/bcrypt"
)

type RegisterPayload struct {
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	DOB       string `json:"dob"`
	Avatar    string `json:"avatar_url,omitempty"`
	Nickname  string `json:"nickname,omitempty"`
	AboutMe   string `json:"about_me,omitempty"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	log.Println("🔥 RegisterHandler called")

	return func(w http.ResponseWriter, r *http.Request) {
		var payload RegisterPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(payload.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}

		now := time.Now().Format(time.RFC3339)

		res, err := db.Exec(`
    INSERT INTO users (
         email, username, password_hash, first_name, last_name, dob,
        avatar_url, nickname, about_me, is_private,
        created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			payload.Email, payload.Username, string(hashedPassword),
			payload.FirstName, payload.LastName, payload.DOB,
			payload.Avatar, payload.Nickname, payload.AboutMe, 0, // is_private = 0 by default
			now, now)

		if err != nil {
			http.Error(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
			return
		}
		userID, err := res.LastInsertId()
		if err != nil {
			http.Error(w, "Failed to fetch new user ID", http.StatusInternalServerError)
			return
		}
		log.Printf("✅ Registered user with ID: %d\n", userID)

		log.Printf("📦 Payload: %+v\n", payload)

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(map[string]string{"message": "Registration successful"})
	}
}

type LoginPayload struct {
	Identifier string `json:"identifier"` // could be email or username
	Password   string `json:"password"`
}

func LoginHandler(db *sql.DB, store *sessions.CookieStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var payload LoginPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Invalid payload", http.StatusBadRequest)
			return
		}

		var id int
		var hashedPassword string

		err := db.QueryRow(`
    SELECT id, password_hash FROM users 
    WHERE email = ? OR username = ?`,
			payload.Identifier, payload.Identifier,
		).Scan(&id, &hashedPassword)

		if err != nil || bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(payload.Password)) != nil {
			http.Error(w, "Invalid credentials", http.StatusUnauthorized)
			return
		}

		session, _ := store.Get(r, "session")
		session.Values["user_id"] = id
		session.Save(r, w)

		json.NewEncoder(w).Encode(map[string]string{"message": "Login successful"})
	}
}

func LogoutHandler(store *sessions.CookieStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		session.Options.MaxAge = -1
		session.Save(r, w)
		json.NewEncoder(w).Encode(map[string]string{"message": "Logout successful"})
	}
}
