package errors

import (
	"encoding/json"
	"net/http"
)

type InternalServerError struct {
	Code       int    `json:"code"`
	Message    string `json:"message"`
	InnerError error  `json:"error"`
}

// Implement the error interface
func (e *InternalServerError) Error() string {
	if e.InnerError != nil {
		return e.Message + ": " + e.InnerError.Error()
	}
	return e.Message
}

func NewInternalServerError(message string, err error) ([]byte, *InternalServerError) {
	customError := &InternalServerError{
		Code:       http.StatusInternalServerError,
		Message:    message,
		InnerError: err,
	}

	jsonData, err := json.Marshal(customError)
	if err != nil {
		return []byte(`{"code":500,"message":"Internal Server Error","error":"Error while marshaling the internal server error"}`), nil
	}

	return jsonData, customError
}
