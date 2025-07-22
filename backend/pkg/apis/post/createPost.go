package post

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	u "socialnetwork/pkg/apis/user"
	database "socialnetwork/pkg/db"
	"strings"
)

// Post structure
type Post struct {
	Title      string   `json:"title"`
	Content    string   `json:"content"`
	ImgOrGif   string   `json:"imgOrgif"`
	Categories []string `json:"categories"`
}

// CreatePost handles post submission
func CreatePost(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1) validate session
	userID, loggedIn := u.ValidateSession(db, r)
	if !loggedIn {
		http.Error(w, "Unauthorized. Please log in.", http.StatusUnauthorized)
		return
	}

	// 2) parse multipart form (up to 10 MB in memory)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "Could not parse form", http.StatusBadRequest)
		return
	}

	// 3) pull out text fields
	title := strings.TrimSpace(r.FormValue("title"))
	content := strings.TrimSpace(r.FormValue("content"))
	if title == "" || content == "" {
		http.Error(w, "Title and Content cannot be empty.", http.StatusBadRequest)
		return
	}

	// 4) handle optional image upload
	imgOrGif := ""
	file, header, err := r.FormFile("imgOrgif")
	if err == nil {
		defer file.Close()

		// sanitize extension
		ext := strings.ToLower(filepath.Ext(header.Filename))
		if ext != ".gif" && ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
			http.Error(w, "Image must be a GIF, PNG, or JPG.", http.StatusBadRequest)
			return
		}

		// generate a safe filename
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

		// this is the URL your frontend can use to display the image
		imgOrGif = "/img/posts/" + fname
	} else if err != http.ErrMissingFile {
		http.Error(w, "Error reading uploaded file", http.StatusBadRequest)
		return
	}

	// 5) parse categories (checkboxes with name="category")
	cats := r.MultipartForm.Value["category"]
	if len(cats) == 0 {
		cats = []string{"none"}
	}

	// 6) insert the post record
	postID, createdAt, err := database.InsertPost(db, userID, title, content, imgOrGif)
	if err != nil {
		log.Println("InsertPost error:", err)
		http.Error(w, "Failed to create post", http.StatusInternalServerError)
		return
	}

	// 7) link categories
	for _, catName := range cats {
		catID, err := database.GetCategoryID(db, catName)
		if err != nil {
			log.Println("GetCategoryID error:", err)
			http.Error(w, "Failed to retrieve category", http.StatusInternalServerError)
			return
		}
		if err := database.InsertPostCategory(db, int(postID), catID); err != nil {
			log.Println("InsertPostCategory error:", err)
			http.Error(w, "Failed to link category", http.StatusInternalServerError)
			return
		}
	}

	// 8) success
	resp := map[string]interface{}{
		"success":   true,
		"message":   "Post created successfully.",
		"postID":    postID,
		"createdAt": createdAt,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}
