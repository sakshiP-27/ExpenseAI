package repositories

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

type SummaryRepository struct {
	DB *pgxpool.Pool
}

func NewSummaryRepository(db *pgxpool.Pool) *SummaryRepository {
	return &SummaryRepository{DB: db}
}
