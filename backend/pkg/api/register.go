package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"social/pkg/db/sqlite"
	"social/pkg/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email     string  `json:"email"`
	Password  string  `json:"password"`
	FirstName string  `json:"first_name"`
	LastName  string  `json:"last_name"`
	DOB       string  `json:"dob"` // expecting ISO8601 date string "YYYY-MM-DD"
	AvatarURL *string `json:"avatar_url"`
	Nickname  *string `json:"nickname"`
	AboutMe   *string `json:"about_me"`
}

func RegisterHandler(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req RegisterRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request", http.StatusBadRequest)
			return
		}

		// Validate required fields
		if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" || req.DOB == "" {
			http.Error(w, "Missing required fields", http.StatusBadRequest)
			return
		}

		// Hash password
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			http.Error(w, "Error hashing password", http.StatusInternalServerError)
			return
		}

		now := time.Now().Format(time.RFC3339)
		newUser := models.User{
			ID:           uuid.New().String(),
			Email:        req.Email,
			PasswordHash: string(hashedPassword),
			FirstName:    req.FirstName,
			LastName:     req.LastName,
			DOB:          req.DOB,
			AvatarURL:    req.AvatarURL,
			Nickname:     req.Nickname,
			AboutMe:      req.AboutMe,
			CreatedAt:    now,
			UpdatedAt:    now,
		}

		err = sqlite.InsertUser(db, newUser)
		if err != nil {
			http.Error(w, "Error saving user: "+err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusCreated)
		w.Write([]byte("User registered successfully"))
	}
}
