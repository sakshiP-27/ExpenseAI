<p align="center">
  <img src="frontend/src/assets/hero.png" alt="Visora" width="120" />
</p>

<h1 align="center">Visora</h1>

<p align="center">
  AI-powered expense tracking — scan receipts, log expenses, and get intelligent spending insights.
</p>

---

## Overview

Visora is a full-stack expense tracker that uses OCR and LLMs to turn receipt photos into structured, categorized expense data. Users can also log expenses manually. The app computes analytics (category breakdowns, daily trends) and generates AI-driven spending insights — all surfaced through a clean, animated dashboard.

The project is split into three independently running services:

| Service | Stack | Purpose |
|---------|-------|---------|
| `backend/` | Go (Chi router), PostgreSQL | REST API, auth, data persistence, orchestration |
| `frontend/` | React 19, TypeScript, Vite | SPA with receipt upload, manual entry, dashboard |
| `genAI/` | Python, FastAPI | OCR (Mindee), LLM categorization & insights (Gemini / Groq) |

---

## System Architecture

> A system diagram would be a great addition here for portfolio visibility — it shows the inter-service communication, external API integrations, and data flow at a glance.

![System Architecture](docs/HighLevelDesign.png)

---

## Features

- **Receipt Scanning** — Upload a receipt image; Mindee OCR extracts merchant, date, items, and totals. Gemini/Groq then categorizes each line item.
- **Manual Expense Entry** — Log expenses by hand with merchant, date, currency, and itemized entries with categories.
- **AI Spending Insights** — LLM-generated summaries and actionable warnings about spending patterns (round-robin between Gemini and Groq).
- **Analytics Dashboard** — Category breakdown (pie chart), daily spending trends (area chart), and period-based analytics via Recharts.
- **Multi-Currency Support** — Users select their currency; all analytics respect it.
- **Today's Activity Feed** — See all receipts logged today with expandable item details.
- **JWT Authentication** — Signup/login with hashed passwords (bcrypt) and role-based access control (user/admin).
- **Dark / Light Theme** — Toggle persisted via context.
- **Cached Analytics** — Analytics and insights are computed on each upload and cached in PostgreSQL to keep dashboard loads fast.

---

## Tech Stack

**Backend**
- Go 1.25, Chi v5 (router)
- pgx v5 (PostgreSQL driver + connection pool)
- golang-jwt v5, bcrypt
- Structured logging via `slog`
- Embedded SQL migrations (`embed.FS`)

**Frontend**
- React 19, React Router v7
- TypeScript, Vite 6
- Framer Motion (animations)
- Recharts (charts)
- Lucide React (icons)
- CSS Modules

**GenAI Service**
- Python, FastAPI, Uvicorn
- Mindee SDK (OCR)
- Google GenAI SDK (Gemini)
- Groq SDK (LLaMA via Groq)
- Pandas, Pillow

**Database**
- PostgreSQL with UUID primary keys
- Tables: `users`, `categories`, `receipts`, `items`, `user_analytics`, `user_insights`, `admins`

---

## Project Structure

```
.
├── backend/                  # Go REST API
│   ├── configs/              # Environment config loader
│   ├── db/                   # Database connection + embedded migrations
│   │   └── migrations/       # 6 SQL migration files
│   ├── errors/               # Typed HTTP error constructors
│   ├── handlers/             # HTTP handlers (auth, upload, summary)
│   ├── middlewares/          # CORS, logging, AuthZ (JWT), AuthN (role check)
│   ├── models/               # Request/response structs
│   ├── repositories/         # Database queries
│   ├── services/             # Business logic + GenAI HTTP calls
│   ├── utils/                # JWT + password helpers
│   └── main.go               # Entrypoint, router setup, graceful shutdown
│
├── frontend/                 # React SPA
│   └── src/
│       ├── api/              # HTTP client (fetch wrapper with auth headers)
│       ├── components/       # Navbar, Illustrations
│       ├── context/          # AuthContext, ThemeContext
│       ├── pages/            # Landing, Login, Home (upload/manual), Dashboard
│       ├── types/            # TypeScript interfaces
│       └── utils/            # Currency list, demo data
│
├── genAI/                    # Python AI service
│   ├── configs/              # Environment config
│   ├── models/               # Pydantic request/response models
│   ├── services/             # ProcessReceipt, ComputeAnalytics, BuildInsights
│   ├── utils/                # Category list
│   └── main.py               # FastAPI app with 3 endpoints
│
├── schemas/                  # JSON schema contracts for API payloads
├── tests/                    # Python tests (OCR, analytics, insights)
├── template.env              # Environment variable template
└── README.md
```

---

## API Endpoints

### Backend (Go)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/health` | No | Health check |
| `POST` | `/auth/login` | No | Login, returns JWT |
| `POST` | `/auth/signup` | No | Register new user |
| `POST` | `/uploadreceipt` | JWT | Upload receipt image (multipart) |
| `POST` | `/manualexpense` | JWT | Log expense manually (JSON) |
| `GET` | `/useranalytics` | JWT | Get cached spending analytics |
| `GET` | `/userinsights` | JWT | Get cached AI-generated insights |
| `GET` | `/todayreceipts` | JWT | Get today's receipts for the user |

### GenAI (Python)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/uploadreceipt` | OCR + LLM categorization of receipt image |
| `POST` | `/generatesummary` | Generate analytics + insights from receipt data |
| `POST` | `/getanalytics` | Compute category breakdown and daily spending |

---

## Authentication Flow

1. User signs up or logs in via `/auth/signup` or `/auth/login`
2. Backend hashes passwords with bcrypt, generates a JWT containing `userID`, `email`, and `role`
3. Frontend stores the JWT in `localStorage` and attaches it as a `Bearer` token on all subsequent requests
4. Protected routes pass through two middleware layers:
   - **AuthZ** — Validates the JWT and extracts user claims into request context
   - **AuthN** — Checks role-based access (e.g., `/admin/*` routes require `admin` role)

---

## How Receipt Processing Works

1. User uploads a receipt image from the frontend (multipart form with currency)
2. Backend forwards the base64-encoded image to the GenAI service
3. GenAI runs **Mindee OCR** to extract raw receipt data (merchant, date, items, totals)
4. The extracted data is then sent to **Gemini or Groq** for intelligent item categorization against 24 predefined categories
5. Structured response flows back to the backend, which persists the receipt + items in PostgreSQL
6. Backend then triggers an async analytics recomputation — calling GenAI to regenerate category breakdowns, daily spending, and LLM-powered insights
7. Results are cached in `user_analytics` and `user_insights` tables for fast dashboard loads

---

## License

This is proprietary software. All rights reserved.

---

<p align="center">Crafted with ❤️ by <a href="https://www.linkedin.com/in/sakshi-paygude/">Sakshi</a> & <a href="https://www.linkedin.com/in/sash2721/">Sahil</a>™</p>