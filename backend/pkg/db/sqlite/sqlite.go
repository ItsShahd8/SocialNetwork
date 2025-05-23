package sqlite

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/sqlite"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "modernc.org/sqlite"
)

func ConnectAndMigrate(dbPath, migrationsPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open DB: %v", err)
	}

	dbURL := fmt.Sprintf("sqlite://%s", dbPath)
	sourceURL := fmt.Sprintf("file://%s", migrationsPath) // ✅ adds file:// only once

	m, err := migrate.New(sourceURL, dbURL)
	if err != nil {
		return nil, fmt.Errorf("migration init error: %v", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return nil, fmt.Errorf("migration failed: %v", err)
	}

	log.Println("✅ Migrations applied successfully")
	return db, nil
}
