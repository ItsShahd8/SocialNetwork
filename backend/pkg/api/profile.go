package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gorilla/sessions"
)

type Profile struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	DOB       string `json:"dob"`
	AvatarURL string `json:"avatar_url"`
	Nickname  string `json:"nickname"`
	AboutMe   string `json:"about_me"`
	IsPrivate bool   `json:"is_private"`
}

func GetMyProfileHandler(db *sql.DB, store *sessions.CookieStore) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, "session")
		userID, ok := session.Values["user_id"].(int)
		fmt.Println(userID)
		if !ok {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		var p Profile
		err := db.QueryRow(`
			SELECT id, email, username, first_name, last_name, dob,
			       avatar_url, nickname, about_me, is_private
			FROM users WHERE id = ?`, userID).
			Scan(&p.ID, &p.Email, &p.Username, &p.FirstName, &p.LastName, &p.DOB,
				&p.AvatarURL, &p.Nickname, &p.AboutMe, &p.IsPrivate)

		if err != nil {
			http.Error(w, "Profile not found", http.StatusNotFound)
			return
		}

		json.NewEncoder(w).Encode(p)
	}
}
