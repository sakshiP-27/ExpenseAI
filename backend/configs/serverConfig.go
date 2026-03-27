package configs

import (
	"log/slog"
	"os"

	"github.com/joho/godotenv"
)

type ServerConfig struct {
	Port         string
	Host         string
	Env          string
	SecretKey    string
	OpenAIAPIKey string
}

func GetServerConfig() *ServerConfig {
	err := godotenv.Load("../.env")

	if err != nil {
		slog.Warn(
			"Error loading .env file, using system environment variables",
		)
	}

	serverConfig := &ServerConfig{
		Port:         os.Getenv("BACKEND_PORT"),
		Host:         os.Getenv("BACKEND_HOST"),
		Env:          os.Getenv("ENV"),
		SecretKey:    os.Getenv("ENCRYPTION_SECRET_KEY"),
		OpenAIAPIKey: os.Getenv("OPENAI_API_KEY"),
	}

	return serverConfig
}
