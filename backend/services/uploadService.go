package services

import "net/http"

type UploadService struct{}

const MaxFileSize = 5 * 1024 * 1024

func NewUploadService() *UploadService {
	return &UploadService{}
}

func (*UploadService) ProcessReceiptImage(r *http.Request) {

}
