package handlers

import (
	"Backend/services"
	"net/http"
)

type SummaryHandler struct {
	Service *services.SummaryService
}

func (s *SummaryHandler) HandleAnalyticsInsights(w http.ResponseWriter, r *http.Request) {

}
