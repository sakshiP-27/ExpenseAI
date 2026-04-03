package repositories

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthRepository struct {
	DB *pgxpool.Pool
}

type UserRecord struct {
	ID           string
	Name         string
	Email        string
	Country      string
	PasswordHash string
}

func NewAuthRepository(db *pgxpool.Pool) *AuthRepository {
	return &AuthRepository{DB: db}
}

// StoreUserInfo inserts a new user into the database
func (repo *AuthRepository) StoreUserInfo(email string, passwordHash string, country string, name string) error {
	query := `INSERT INTO users (email, password_hash, country, name) VALUES ($1, $2, $3, $4)`
	_, err := repo.DB.Exec(context.Background(), query, email, passwordHash, country, name)
	if err != nil {
		return fmt.Errorf("failed to store user: %w", err)
	}
	return nil
}

// GetUserByEmail fetches a user by email, returns nil if not found
func (repo *AuthRepository) GetUserByEmail(email string) (*UserRecord, error) {
	query := `SELECT id, name, email, country, password_hash FROM users WHERE email = $1`
	row := repo.DB.QueryRow(context.Background(), query, email)

	var user UserRecord
	err := row.Scan(&user.ID, &user.Name, &user.Email, &user.Country, &user.PasswordHash)
	if err != nil {
		if err.Error() == "no rows in result set" {
			slog.Debug("No user found with the given email", slog.String("Email", email))
			return nil, nil
		}
		slog.Error(
			"Error while retrieving the data from the DB",
			slog.Any("Error", err),
		)
		return nil, err
	}

	return &user, nil
}

// CheckUserAdmin takes the user email and checks if the user is present in the admins
func (repo *AuthRepository) CheckUserAdmin(email string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM admins WHERE email = $1)`
	var exists bool

	err := repo.DB.QueryRow(context.Background(), query, email).Scan(&exists)
	if err != nil {
		slog.Error(
			"Error while fetching the admin status for the given mail",
			slog.Any("Error", err),
		)
		return false, err
	}
	return exists, nil
}
