package handlers

import (
	"Backend/errors"
	"Backend/services"
	"encoding/json"
	"log/slog"
	"net/http"
)

// Request structure
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Country  string `json:"country"`
}

// Response structure
type AuthResponse struct {
	Token  string `json:"token"`
	UserID string `json:"userID"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

type AuthHandler struct {
	Service *services.AuthService
}

func (s *AuthHandler) HandleLogin(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte(`{"error": "Only POST method allowed"}`))
		return
	}

	var loginReq LoginRequest
	err := json.NewDecoder(r.Body).Decode(&loginReq)

	if err != nil {
		slog.Warn("Failed to decode login request body")
		errorJson, badRequestError := errors.NewBadRequestError("Incorrect request object sent", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(badRequestError.Code)
		w.Write(errorJson)
		return
	}

	slog.Info("Login attempt received")

	token, userID, userEmail, role, serviceErr, errJson, errCode := s.Service.Login(loginReq.Email, loginReq.Password)

	if serviceErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(errCode)
		w.Write(errJson)
		slog.Warn("Login failed", slog.Int("StatusCode", errCode))
		return
	}

	response := AuthResponse{Token: token, UserID: userID, Email: userEmail, Role: role}
	responseJson, _ := json.Marshal(response)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJson)

	slog.Info("Login successful", slog.String("UserID", userID), slog.String("Role", role))
}

func (s *AuthHandler) HandleSignUp(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte(`{"error": "Only POST method allowed"}`))
		return
	}

	var signupReq LoginRequest
	err := json.NewDecoder(r.Body).Decode(&signupReq)

	if err != nil {
		slog.Warn("Failed to decode signup request body")
		errJson, badRequestError := errors.NewBadRequestError("Incorrect signup request object sent!", err)
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(badRequestError.Code)
		w.Write(errJson)
		return
	}

	slog.Info("Signup attempt received")

	token, userID, userEmail, role, serviceErr, errJson, errCode := s.Service.Signup(signupReq.Email, signupReq.Password, signupReq.Country)

	if serviceErr != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(errCode)
		w.Write(errJson)
		slog.Warn("Signup failed", slog.Int("StatusCode", errCode))
		return
	}

	response := AuthResponse{Token: token, UserID: userID, Email: userEmail, Role: role}
	responseJson, _ := json.Marshal(response)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(responseJson)

	slog.Info("Signup successful", slog.String("UserID", userID), slog.String("Role", role))
}
