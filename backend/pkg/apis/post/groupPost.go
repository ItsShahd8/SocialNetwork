package post

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"socialnetwork/pkg/apis/user"
)

// GroupPostRequest represents the payload for creating a group post
type GroupPostRequest struct {
	GroupID int    `json:"group_id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}

// CreateGroupPost handles creating a post inside a group
func CreateGroupPost(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, loggedIn := user.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var postData GroupPostRequest
	if err := json.NewDecoder(r.Body).Decode(&postData); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	_, err := db.Exec(`
		INSERT INTO group_posts (group_id, user_id, title, content, created_at)
		VALUES (?, ?, ?, ?, datetime('now'))
	`, postData.GroupID, userID, postData.Title, postData.Content)

	if err != nil {
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": true})
}
