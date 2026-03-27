package errors

import (
	"encoding/json"
	"net/http"
)

type UnauthorizedError struct {
	Code       int    `json:"code"`
	Message    string `json:"message"`
	InnerError error  `json:"error"`
}

// Implement the error interface
func (e *UnauthorizedError) Error() string {
	if e.InnerError != nil {
		return e.Message + ": " + e.InnerError.Error()
	}
	return e.Message
}

func NewUnauthorizedError(message string, err error) ([]byte, *UnauthorizedError) {
	customError := &UnauthorizedError{
		Code:       http.StatusForbidden,
		Message:    message,
		InnerError: err, // Updated field name
	}

	jsonData, marshalErr := json.Marshal(customError)
	if marshalErr != nil {
		return []byte(`{"code":500,"message":"Internal Server Error","error":"Error while marshaling the internal server error"}`), nil
	}

	return jsonData, customError
}
