package post

import (
    "database/sql"
    "encoding/json"
    "fmt"
    "net/http"
    u "socialnetwork/pkg/apis/user"
    "socialnetwork/pkg/db"
)

// Post structure with privacy
type Post struct {
    Title             string   `json:"title"`
    Content           string   `json:"content"`
    Categories        []string `json:"categories"`
    PrivacyLevel      int      `json:"privacy_level"`      // 0=public, 1=followers, 2=selected
    SelectedFollowers []int    `json:"selected_followers"` // for privacy level 2
}

// CreatePost handles post submission with privacy
func CreatePost(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    userID, loggedIn := u.ValidateSession(db, r)
    if !loggedIn {
        http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
        return
    }

    // Parse request body
    var postData Post
    decoder := json.NewDecoder(r.Body)
    if err := decoder.Decode(&postData); err != nil {
        fmt.Println("JSON Decoding Error:", err)
        http.Error(w, "Failed to parse JSON", http.StatusBadRequest)
        return
    }

    // Validate post fields
    if postData.Title == "" || postData.Content == "" {
        http.Error(w, "Title and Content cannot be empty.", http.StatusBadRequest)
        return
    }

    // Validate privacy level
    if postData.PrivacyLevel < 0 || postData.PrivacyLevel > 2 {
        postData.PrivacyLevel = 0 // Default to public
    }

    // Insert the post into the database with privacy
    postID, createdAt, err := database.InsertPostWithPrivacy(db, userID, postData.Title, postData.Content, postData.PrivacyLevel)
    if err != nil {
        fmt.Println("Error inserting post:", err)
        http.Error(w, "Failed to create post", http.StatusInternalServerError)
        return
    }

    // Handle categories
    if len(postData.Categories) < 1 {
        category := "none"
        categoryID, err := database.GetCategoryID(db, category)
        if err != nil {
            fmt.Println("Error getting category ID:", err)
            http.Error(w, "Failed to retrieve category", http.StatusInternalServerError)
            return
        }
        err = database.InsertPostCategory(db, int(postID), categoryID)
        if err != nil {
            fmt.Println("Error linking post to category:", err)
            http.Error(w, "Failed to associate post with category", http.StatusInternalServerError)
            return
        }
    } else {
        // Insert categories into the database
        for _, categoryName := range postData.Categories {
            categoryID, err := database.GetCategoryID(db, categoryName)
            if err != nil {
                fmt.Println("Error getting category ID:", err)
                http.Error(w, "Failed to retrieve category", http.StatusInternalServerError)
                return
            }
            err = database.InsertPostCategory(db, int(postID), categoryID)
            if err != nil {
                fmt.Println("Error linking post to category:", err)
                http.Error(w, "Failed to associate post with category", http.StatusInternalServerError)
                return
            }
        }
    }

    // Handle private post permissions (privacy level 2)
    if postData.PrivacyLevel == 2 && len(postData.SelectedFollowers) > 0 {
        err = database.AddPostPermissions(db, int(postID), postData.SelectedFollowers)
        if err != nil {
            fmt.Println("Error adding post permissions:", err)
            http.Error(w, "Failed to set post permissions", http.StatusInternalServerError)
            return
        }
    }

    // Send success response
    response := map[string]interface{}{
        "success":       true,
        "message":       "Post created successfully.",
        "postID":        postID,
        "createdAt":     createdAt,
        "privacy_level": postData.PrivacyLevel,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}

// GetUserFollowers returns followers for post privacy selection
func GetUserFollowers(db *sql.DB, w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Validate session
    userID, loggedIn := u.ValidateSession(db, r)
    if !loggedIn {
        http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
        return
    }

    // Get followers
    followers, err := database.GetUserFollowers(db, userID)
    if err != nil {
        fmt.Println("Error getting followers:", err)
        http.Error(w, "Failed to get followers", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "followers": followers,
    })
}
