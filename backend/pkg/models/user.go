package models

type User struct {
	ID           string  `db:"id"`
	Email        string  `db:"email"`
	PasswordHash string  `db:"password_hash"`
	FirstName    string  `db:"first_name"`
	LastName     string  `db:"last_name"`
	DOB          string  `db:"dob"`
	AvatarURL    *string `db:"avatar_url"`
	Nickname     *string `db:"nickname"`
	AboutMe      *string `db:"about_me"`
	CreatedAt    string  `db:"created_at"`
	UpdatedAt    string  `db:"updated_at"`
}
