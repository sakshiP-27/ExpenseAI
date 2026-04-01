#!/bin/bash

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Local Test Commands - Copy & Paste to run
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Replace TOKEN with the actual JWT token from signup/login response
# Replace /path/to/receipt.jpg with your actual image path


# ── 1. Health Check ──

curl -s http://localhost:8080/health | jq


# ── 2. Signup ──

curl -s -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234",
    "country": "IN"
  }' | jq


# ── 3. Login ──

curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234"
  }' | jq


# ── 4. Upload Receipt (requires GenAI service running) ──

curl -s -X POST http://localhost:8080/uploadreceipt \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/path/to/receipt.jpg" \
  -F "currency=INR" | jq


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Error Cases
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


# ── 5. Duplicate Signup (expect 400) ──

curl -s -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Test@1234",
    "country": "IN"
  }' | jq


# ── 6. Login with Wrong Password (expect 400) ──

curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "WrongPass123"
  }' | jq


# ── 7. Upload without Auth Token (expect 400) ──

curl -s -X POST http://localhost:8080/uploadreceipt \
  -F "image=@/path/to/receipt.jpg" \
  -F "currency=INR" | jq


# ── 8. Upload with Invalid Token (expect 400) ──

curl -s -X POST http://localhost:8080/uploadreceipt \
  -H "Authorization: Bearer invalidtoken123" \
  -F "image=@/path/to/receipt.jpg" \
  -F "currency=INR" | jq


# ── 9. Upload Missing Currency (expect 400) ──

curl -s -X POST http://localhost:8080/uploadreceipt \
  -H "Authorization: Bearer TOKEN" \
  -F "image=@/path/to/receipt.jpg" | jq
