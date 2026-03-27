package utils

import (
	"Backend/errors"
	stderrors "errors"
	"log/slog"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	// hashing the password using bcrypt
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err != nil {
		slog.Error(
			"Error while hashing the password",
			slog.Any("Error", err),
		)
		_, customError := errors.NewInternalServerError("Error while hashing the password", err)
		return "", customError
	}

	return string(hashedPassword), nil
}

func ComparePassword(hashedPassword string, password string) error {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))

	if err != nil {
		if stderrors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return err
		}

		slog.Error(
			"Error while comparing the hashed password with regular password",
			slog.Any("Error", err),
		)
		_, customError := errors.NewInternalServerError("Error while comparing the hashed password with regular password", err)
		return customError
	}
	return nil
}
