# 0. Start both Go Service and Python Service
uvicorn main:app --port 4000 --reload
go run main.go

# 1. Login or Signup
curl -s -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "<YOUR_PASSWORD>"}'

# 2. Upload a receipt (multipart form)
curl -s -X POST http://localhost:3000/uploadreceipt \
  -H "Authorization: Bearer <AUTH_TOKEN>" \
  -F "image=@Receipt1.jpeg" \
  -F "currency=INR" | python3 -m json.tool