// pkg/db/sqlite/sqlite.go
package sqlite

import (
	"database/sql"
	"fmt"
	"log"
	"social/pkg/models"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func ConnectAndMigrate(dbPath, migrationsPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open sqlite db: %w", err)
	}

	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return nil, fmt.Errorf("sqlite driver instance error: %w", err)
	}

	m, err := migrate.NewWithDatabaseInstance(
		"file://"+migrationsPath,
		"sqlite3", driver)
	if err != nil {
		return nil, fmt.Errorf("migration instance error: %w", err)
	}

	if err := m.Up(); err != nil && err.Error() != "no change" {
		return nil, fmt.Errorf("migration error: %w", err)
	}

	log.Println("Migrations applied successfully")
	return db, nil
}

func InsertUser(db *sql.DB, user models.User) error {
	query := `
    INSERT INTO users (id, email, password_hash, first_name, last_name, dob, avatar_url, nickname, about_me, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
	_, err := db.Exec(query,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.FirstName,
		user.LastName,
		user.DOB,
		user.AvatarURL,
		user.Nickname,
		user.AboutMe,
		user.CreatedAt,
		user.UpdatedAt,
	)
	return err
}

func GetUserByEmail(db *sql.DB, email string) (models.User, error) {
	var user models.User
	query := `SELECT id, email, password_hash, first_name, last_name, dob, avatar_url, nickname, about_me, created_at, updated_at FROM users WHERE email = ?`
	row := db.QueryRow(query, email)

	err := row.Scan(
		&user.ID,
		&user.Email,
		&user.PasswordHash,
		&user.FirstName,
		&user.LastName,
		&user.DOB,
		&user.AvatarURL,
		&user.Nickname,
		&user.AboutMe,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	return user, err
}
