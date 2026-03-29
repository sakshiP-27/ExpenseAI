package repositories

import "database/sql"

type UploadRepository struct {
	DB *sql.DB
}

func NewUploadRepository(db *sql.DB) *UploadRepository {
	return &UploadRepository{DB: db}
}
