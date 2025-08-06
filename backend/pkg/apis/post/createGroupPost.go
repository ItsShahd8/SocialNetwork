package post

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	u "socialnetwork/pkg/apis/user"
	database "socialnetwork/pkg/db"
	"strconv"
	"strings"
)

// CreateGroupPost handles post submission within a group
func CreateGroupPost(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Validate session and get user ID
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// Parse multipart form (up to 10 MB in memory)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Could not parse form", http.StatusBadRequest)
		return
	}

	// Get group ID from form
	groupIDStr := strings.TrimSpace(r.FormValue("group_id"))
	if groupIDStr == "" {
		http.Error(w, "Group ID is required", http.StatusBadRequest)
		return
	}

	groupID, err := strconv.Atoi(groupIDStr)
	if err != nil || groupID <= 0 {
		http.Error(w, "Invalid group ID", http.StatusBadRequest)
		return
	}

	// Check if user is a member of the group
	isMember, err := database.IsUserGroupMember(db, userID, groupID)
	if err != nil {
		log.Println("Error checking group membership:", err)
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	if !isMember {
		http.Error(w, "You must be a member of this group to create posts", http.StatusForbidden)
		return
	}

	// Get text fields
	title := strings.TrimSpace(r.FormValue("title"))
	content := strings.TrimSpace(r.FormValue("content"))
	if title == "" || content == "" {
		http.Error(w, "Title and Content cannot be empty.", http.StatusBadRequest)
		return
	}

	// Handle optional image upload
	imgOrGif := ""
	file, header, err := r.FormFile("imgOrgif")
	if err == nil {
		defer file.Close()

		// Sanitize extension
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if ext != ".gif" && ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
			http.Error(w, "Image must be a GIF, PNG, or JPG.", http.StatusBadRequest)
			return
		}

		// Generate a safe filename
		fname := strings.ReplaceAll(header.Filename, " ", "-")
		dstFile, err := os.Create("../frontend-next/public/img/posts/" + fname)
		if err != nil {
			log.Println("file create error:", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}
		defer dstFile.Close()

		if _, err := io.Copy(dstFile, file); err != nil {
			log.Println("file copy error:", err)
			http.Error(w, "Server error", http.StatusInternalServerError)
			return
		}

		// This is the URL your frontend can use to display the image
		imgOrGif = "/img/posts/" + fname
	} else if err != http.ErrMissingFile {
		http.Error(w, "Error reading uploaded file", http.StatusBadRequest)
		return
	}

	// Parse categories (checkboxes with name="category")
	cats := r.MultipartForm.Value["category"]
	if len(cats) == 0 {
		http.Error(w, "At least one category must be selected.", http.StatusBadRequest)
		return
	}

	// Insert the group post
	postID, createdAt, err := database.InsertGroupPost(db, userID, groupID, title, content, imgOrGif)
	if err != nil {
		log.Println("Error inserting group post:", err)
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	// Insert categories
	for _, catName := range cats {
		catName = strings.TrimSpace(catName)
		if catName == "" {
			continue
		}

		// Get category ID
		catID, err := database.GetCategoryID(db, catName)
		if err != nil {
			log.Println("Error with category:", err)
			continue
		}

		// Link post to category
		err = database.InsertPostCategory(db, int(postID), catID)
		if err != nil {
			log.Println("Error linking post to category:", err)
		}
	}

	// Send success response
	fmt.Fprintf(w, `{"success": true, "message": "Group post created successfully!", "post_id": %d, "created_at": "%s"}`, 
		postID, createdAt.Format("2006-01-02 15:04:05"))
}