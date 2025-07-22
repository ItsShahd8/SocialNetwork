package user

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type UserProfile struct {
	Username  string `json:"username"`
	Fname     string `json:"fname"`
	Lname     string `json:"lname"`
	Email     string `json:"email"`
	Age       int    `json:"age"`
	Gender    string `json:"gender"`
	Password  string `json:"password"`
	Bio       string `json:"bio"`
	Avatar    string `json:"avatar"`
	IsPrivate bool   `json:"isPrivate"`
}

func GetProfileHandler(db *sql.DB, w http.ResponseWriter, r *http.Request, username string) {
	var bio sql.NullString
	var profile UserProfile

	err := db.QueryRow(`
    SELECT username, firstname, lastname, email, age, gender, password, bio , avatar_url, isPrivate
    FROM users WHERE username = ?`,
		username).Scan(
		&profile.Username,
		&profile.Fname,
		&profile.Lname,
		&profile.Email,
		&profile.Age,
		&profile.Gender,
		&profile.Password,
		&bio,
		&profile.Avatar,
		&profile.IsPrivate,
	)
	if bio.Valid {
		profile.Bio = bio.String
	} else {
		profile.Bio = "" // Default value when NULL
	}
	if err != nil {
		fmt.Println("Error fetching user:", err)
		http.Error(w, "Profile not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func UpdateProfileHandler(db *sql.DB, w http.ResponseWriter, r *http.Request, currentUsername string) {
	// 1) parse multipart form (up to 10 MB in memory)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "could not parse form", http.StatusBadRequest)
		return
	}

	// 2) load existing user
	var existing UserProfile
	var existingBio sql.NullString
	err := db.QueryRow(`
        SELECT username, firstname, lastname, email, age, gender, password, bio, avatar_url, isPrivate
        FROM users WHERE username = ?`, currentUsername).
		Scan(
			&existing.Username,
			&existing.Fname,
			&existing.Lname,
			&existing.Email,
			&existing.Age,
			&existing.Gender,
			&existing.Password,
			&existingBio,
			&existing.Avatar,
			&existing.IsPrivate,
		)
	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if existingBio.Valid {
		existing.Bio = existingBio.String
	}

	// 3) determine avatarURL: reset, upload, or keep existing
	avatarURL := existing.Avatar

	// 3a) reset flag takes highest precedence
	if r.FormValue("resetAvatar") == "true" {
		avatarURL = "/img/images.png"

	} else {
		// 3b) otherwise, check for a new upload
		file, header, err := r.FormFile("avatarInput")
		if err != nil && err != http.ErrMissingFile {
			http.Error(w, "error reading avatar", http.StatusBadRequest)
			return
		}

		// no file at all (or empty filename) → keep existing
		if err == http.ErrMissingFile || header.Filename == "" {
			avatarURL = existing.Avatar

		} else {
			// sanitize filename
			safeName := strings.ReplaceAll(header.Filename, " ", "-")
			ext := strings.ToLower(filepath.Ext(safeName))
			if ext != ".png" && ext != ".jpg" && ext != ".jpeg" {
				http.Error(w, "Image must be a PNG or JPG.", http.StatusBadRequest)
				return
			}

			// build and create upload directory
			uploadDir := filepath.Join("..", "frontend-next", "public", "img", "avatars")
			if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
				log.Println("avatar save: MkdirAll error:", err)
				http.Error(w, "could not save avatar", http.StatusInternalServerError)
				return
			}

			// write the file
			dstPath := filepath.Join(uploadDir, safeName)
			dst, err := os.Create(dstPath)
			if err != nil {
				log.Println("avatar save: Create error:", err)
				http.Error(w, "could not save avatar", http.StatusInternalServerError)
				return
			}
			defer dst.Close()
			defer file.Close()

			if _, err := io.Copy(dst, file); err != nil {
				log.Println("avatar save: Copy error:", err)
				http.Error(w, "could not save avatar", http.StatusInternalServerError)
				return
			}

			// set the URL that your frontend FileServer will serve
			avatarURL = "/img/avatars/" + safeName
		}
	}

	// 4) read text fields, falling back on existing
	get := func(key, old string) string {
		v := strings.TrimSpace(r.FormValue(key))
		if v == "" {
			return old
		}
		return v
	}
	ageStr := r.FormValue("age")
	age, _ := strconv.Atoi(ageStr)
	if age == 0 {
		age = existing.Age
	}
	isPrivate := r.FormValue("isPrivate") == "on"

	// build final “input” values
	username := get("username", existing.Username)
	fname := get("fname", existing.Fname)
	lname := get("lname", existing.Lname)
	email := get("email", existing.Email)
	gender := get("gender", existing.Gender)
	bio := get("bio", existing.Bio)

	// 5) run the UPDATE
	_, err = db.Exec(`
        UPDATE users 
        SET username = ?, firstname = ?, lastname = ?, email = ?, age = ?, gender = ?, bio = ?, avatar_url = ?, isPrivate = ?
        WHERE username = ?`,
		username, fname, lname, email, age, gender, bio, avatarURL, isPrivate,
		currentUsername,
	)
	if err != nil {
		http.Error(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	// 6) respond
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Profile updated",
	})
}

func GetOtherProfile(db *sql.DB, username string) (UserProfile, error) {
	var bio sql.NullString
	var profile UserProfile

	err := db.QueryRow(`
		SELECT username, firstname, lastname, email, age, gender, password, bio, avatar_url, isPrivate
		FROM users WHERE username = ?`,
		username).Scan(
		&profile.Username,
		&profile.Fname,
		&profile.Lname,
		&profile.Email,
		&profile.Age,
		&profile.Gender,
		&profile.Password,
		&bio,
		&profile.Avatar,
		&profile.IsPrivate,
	)

	if err != nil {
		return UserProfile{}, err
	}

	profile.Bio = ""
	if bio.Valid {
		profile.Bio = bio.String
	}

	return profile, nil
}
