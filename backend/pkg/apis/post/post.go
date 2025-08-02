package post

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "net/http"
    u "socialnetwork/pkg/apis/user"
    database "socialnetwork/pkg/db"
    "time"
)

// GetPosts returns posts visible to the current user based on privacy settings
func GetPosts(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Validate session and get user ID
    userID, loggedIn := u.ValidateSession(db, r)
    if !loggedIn {
        http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
        return
    }

    // Query that filters posts based on privacy levels
    // Removed f.status = 'accepted' condition since status column doesn't exist in userFollow table
    query := `
        SELECT DISTINCT 
            p.id, u.username, p.title, p.content, 
            COALESCE(p.privacy_level, 0) as privacy_level, 
            p.imgOrgif, 
            p.created_at,
            COALESCE(likes.count, 0) as likes_count,
            COALESCE(dislikes.count, 0) as dislikes_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN userFollow f ON p.user_id = f.following_id AND f.follower_id = ?
        LEFT JOIN post_permissions pp ON p.id = pp.post_id AND pp.user_id = ?
        LEFT JOIN (
            SELECT post_id, COUNT(*) as count 
            FROM likes 
            WHERE is_like = 1 AND comment_id IS NULL 
            GROUP BY post_id
        ) likes ON p.id = likes.post_id
        LEFT JOIN (
            SELECT post_id, COUNT(*) as count 
            FROM likes 
            WHERE is_like = 0 AND comment_id IS NULL 
            GROUP BY post_id
        ) dislikes ON p.id = dislikes.post_id
        WHERE 
            COALESCE(p.privacy_level, 0) = 0 OR  -- PUBLIC posts (everyone can see)
            p.user_id = ? OR                     -- user's own posts
            (COALESCE(p.privacy_level, 0) = 1 AND f.follower_id IS NOT NULL) OR  -- ALMOST PRIVATE + user is follower
            (COALESCE(p.privacy_level, 0) = 2 AND pp.user_id IS NOT NULL)        -- PRIVATE + user has permission
        ORDER BY p.created_at DESC
    `

    rows, err := db.Query(query, userID, userID, userID)
    if err != nil {
        fmt.Println("Error retrieving posts:", err)
        http.Error(w, "Failed to retrieve posts", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Create a slice to hold posts
    var posts []map[string]interface{}
    for rows.Next() {
        var postID, privacyLevel, likesCount, dislikesCount int
        var username, title, content,  imgOrgif  string
        var createdAt time.Time

        err := rows.Scan(&postID, &username, &title, &content, &privacyLevel, &imgOrgif, &createdAt, &likesCount, &dislikesCount)
        if err != nil {
            fmt.Println("Error scanning post:", err)
            http.Error(w, "Failed to process posts", http.StatusInternalServerError)
            return
        }

        // Fetch categories for this post
        categories, err := database.GetCategoriesByPostID(db, postID)
        if err != nil {
            fmt.Println("Error retrieving categories for post:", err)
            categories = []string{} // Default to empty if error
        }

        // Get privacy level text
        privacyText := "Public"
        switch privacyLevel {
        case 1:
            privacyText = "Almost Private"
        case 2:
            privacyText = "Private"
        }

        // Store post in slice
        post := map[string]interface{}{
            "id":             postID,
            "username":       username,
            "title":          title,
            "content":        content,
            "privacy_level":  privacyLevel,
            "privacy_text":   privacyText,
            "imgOrgif":       imgOrgif,
            "categories":     categories,
            "likes_count":    likesCount,
            "dislikes_count": dislikesCount,
            "createdAt":      createdAt.Format("2006-01-02 15:04:05"),
        }
        posts = append(posts, post)
    }

    // Return posts as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(posts)
}

// GetPublicPosts returns only public posts (privacy_level = 0)
func GetPublicPosts(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Validate session - we still need to check if user is logged in
    _, loggedIn := u.ValidateSession(db, r)
    if !loggedIn {
        http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
        return
    }

    // Query that shows ONLY public posts
    query := `
        SELECT DISTINCT 
            p.id, u.username, p.title, p.content, 
            COALESCE(p.privacy_level, 0) as privacy_level, 
            p.created_at,
            COALESCE(likes.count, 0) as likes_count,
            COALESCE(dislikes.count, 0) as dislikes_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        LEFT JOIN (
            SELECT post_id, COUNT(*) as count 
            FROM likes 
            WHERE is_like = 1 AND comment_id IS NULL 
            GROUP BY post_id
        ) likes ON p.id = likes.post_id
        LEFT JOIN (
            SELECT post_id, COUNT(*) as count 
            FROM likes 
            WHERE is_like = 0 AND comment_id IS NULL 
            GROUP BY post_id
        ) dislikes ON p.id = dislikes.post_id
        WHERE 
            COALESCE(p.privacy_level, 0) = 0  -- ONLY PUBLIC posts
        ORDER BY p.created_at DESC
    `

    rows, err := db.Query(query)
    if err != nil {
        fmt.Println("Error retrieving public posts:", err)
        http.Error(w, "Failed to retrieve posts", http.StatusInternalServerError)
        return
    }
    defer rows.Close()

    // Create a slice to hold posts
    var posts []map[string]interface{}
    for rows.Next() {
        var postID, privacyLevel, likesCount, dislikesCount int
        var username, title, content, imgOrgif string
        var createdAt time.Time

        err := rows.Scan(&postID, &username, &title, &content, &imgOrgif, &privacyLevel ,&createdAt, &likesCount, &dislikesCount)
        if err != nil {
            fmt.Println("Error scanning post:", err)
            http.Error(w, "Failed to process posts", http.StatusInternalServerError)
            return
        }

        // Fetch categories for this post
        categories, err := database.GetCategoriesByPostID(db, postID)
        if err != nil {
            fmt.Println("Error retrieving categories for post:", err)
            categories = []string{} // Default to empty if error
        }

        // Store post in slice
        post := map[string]interface{}{
            "id":         postID,
            "username":   username,
            "title":      title,
            "content":    content,
            "imgOrgif":   imgOrgif,
            "categories": categories,
            "createdAt":  createdAt.Format("2006-01-02 15:04:05"),
        }
        posts = append(posts, post)
    }

    // Return posts as JSON
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(posts)
}
