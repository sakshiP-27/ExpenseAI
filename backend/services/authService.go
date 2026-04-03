package services

import (
	"Backend/errors"
	"Backend/repositories"
	"Backend/utils"
	"log/slog"
	"net/http"
)

type AuthService struct {
	Repo *repositories.AuthRepository
}

func NewAuthService(repo *repositories.AuthRepository) *AuthService {
	return &AuthService{Repo: repo}
}

func (s *AuthService) Login(email string, password string) (string, string, string, string, string, error, []byte, int) {
	// get the hashed password from the database
	userInfo, err := s.Repo.GetUserByEmail(email)

	if err != nil {
		slog.Error(
			"Error while retrieving the user data from the DB",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while retrieving the user data from the DB", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	if userInfo == nil {
		slog.Debug(
			"User not present please login!",
			slog.String("Email", email),
		)
		errorJson, badRequestError := errors.NewBadRequestError("User not present please signup!", nil)
		return "", "", "", "", "", badRequestError, errorJson, badRequestError.Code
	}

	// fetch the hashed password from the returned user data
	hashedPassword := userInfo.PasswordHash

	// send this hashedPassword and original password for comparison
	err = utils.ComparePassword(hashedPassword, password)

	if err != nil {
		slog.Error(
			"Password is incorrect, please retry",
			slog.Any("Error", err),
		)
		errorJson, badRequestError := errors.NewBadRequestError("Password is incorrect, please retry", err)
		return "", "", "", "", "", badRequestError, errorJson, badRequestError.Code
	}

	// extracting the userID from the mail itself
	userID := userInfo.ID
	userName := userInfo.Name

	// Getting the user role by checking the email in db
	var role string = "user"
	exists, err := s.Repo.CheckUserAdmin(email)

	if err != nil {
		slog.Error(
			"Error while fetching the admin status from the DB",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while fetching the admin status from the DB", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	// if the email exists in the db (admin table) then mark them as admin
	if exists {
		role = "admin"
	}

	// generating the JWT token for this part
	jwtToken, err := utils.GenerateToken(userID, email, role)

	if err != nil {
		slog.Error(
			"Error while generating the JWT token",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while generating the JWT token", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	return jwtToken, userID, userName, email, role, nil, nil, 0
}

func (s *AuthService) Signup(name string, email string, password string, country string) (string, string, string, string, string, error, []byte, int) {
	// check if the user already exists in the DB
	slog.Debug("Checking the DB if the signup user is already exists")

	userInfo, err := s.Repo.GetUserByEmail(email)
	if userInfo != nil {
		errorJson, badRequestError := errors.NewBadRequestError("User already exists, please login instead", nil)
		return "", "", "", "", "", badRequestError, errorJson, badRequestError.Code
	}

	if err != nil {
		slog.Error(
			"Error while retrieving the data from the DB",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while retrieving the data from the DB", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	// Hash the incoming password
	hashedPassword, err := utils.HashPassword(password)

	if err != nil {
		slog.Error(
			"Error while hashing the password",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while hashing the password", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	slog.Debug("Successfully hashed the incoming password", slog.String("Email", email))

	// store the hashedpassword along with the mail in the database
	err = s.Repo.StoreUserInfo(email, hashedPassword, country, name)

	if err != nil {
		slog.Error(
			"Error while storing the user data in the DB",
			slog.Any("Error", err),
		)
		errorJson, internalServerError := errors.NewInternalServerError("Error while storing the user data in the DB", err)
		return "", "", "", "", "", internalServerError, errorJson, internalServerError.Code
	}

	slog.Debug("Stored the user hashed password in the database (repository)", slog.String("Email", email))

	// once the signup process is completed then autologin
	jwttoken, userID, userName, userEmail, role, err, errJson, errorCode := s.Login(email, password)

	if err != nil {
		if errorCode == http.StatusBadRequest {
			slog.Debug(
				"Invalid credentials! Either email or password is incorrect",
				slog.String("Email", email),
				slog.Any("Error", err),
			)
			return "", "", "", "", "", err, errJson, errorCode
		} else if errorCode == http.StatusInternalServerError {
			slog.Error(
				"Error while generating the Jwt Token",
				slog.Any("Error", err),
			)
			return "", "", "", "", "", err, errJson, errorCode
		}
	}

	slog.Debug(
		"JWT Token generated successfully",
		slog.String("Email", email),
	)
	return jwttoken, userID, userName, userEmail, role, nil, nil, 0
}
