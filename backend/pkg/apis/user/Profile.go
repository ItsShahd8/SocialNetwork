package user

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
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

	// 3) handle file upload (if any)
	avatarURL := existing.Avatar
	file, header, err := r.FormFile("avatarInput")
	if err == nil {
		defer file.Close()
		// save to disk (adjust path as needed)
		dst, err := os.Create("../frontend-next/public/img/" + header.Filename)
		if err != nil {
			http.Error(w, "could not save avatar", http.StatusInternalServerError)
			return
		}
		defer dst.Close()
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "could not save avatar", http.StatusInternalServerError)
			return
		}
		avatarURL = "/img/" + header.Filename
	} else if err != http.ErrMissingFile {
		// some other error
		http.Error(w, "error reading avatar", http.StatusBadRequest)
		return
	}
	// if no file sent, avatarURL remains existing.Avatar

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
