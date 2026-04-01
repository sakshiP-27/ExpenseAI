package services

import "Backend/repositories"

type SummaryService struct {
	Repo *repositories.SummaryRepository
}

func NewSummaryService(repo *repositories.SummaryRepository) *SummaryService {
	return &SummaryService{Repo: repo}
}
