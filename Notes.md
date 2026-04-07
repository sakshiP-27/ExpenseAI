## Upcoming performace fixes & features:

1. **DONE** **Receipt Duplication** [Performance]: Here if a user uploads a duplicate receipt basically a receipt which is already uploaded before then we should directly show the data we have stored in the DB for previous receipt and should not do processing for it again. This can be be done simply by preparing the MD5/SHA encoding of the image and storing it and whenever a new receipt is uplaoded we check if the hash matches any existing record.

2. **DONE** **Retry Logic** [Performance]: If for some reason OCR / LLMs fail with an error response then we should add a retry logic where the service tries to retry calling the API thrice before returning error response to the backend and then to frontend showing the user the services are temporarily down.

3. **Confidence Score** [Performance]: We're receiving the confidence scores in the response of the OCR, we should make sure if the OCR confidence_score are above certain threshold value only then we do the further processing otherwise ask the user on the frontend to upload better quality image.

4. **ML & Analytics** [Feature]: For the current analytics we should add another layer where we compare the spending of the current week vs the past week, current month vs the past month. Similarly also add a ML model predicting the users spending for the coming month.

5. **Usopp (Notification Service)** [NewService]: Build a dedicated event-driven microservice to handle outbound communication (e.g., weekly/monthly expense summary emails, budget limits/alerts). This service will integrate via message broker or webhooks.

6. **Implement OAuth** [Feature]: Implement OAuth using Google SSO for the users that don't want to create an account using email and password.

7. **Apply Rate Limiting** [Performance]: Implementing rate limiting on the AI & OCR based APIs so they're not misused by anyone.

8. **Monthly Sync Report** [Feature]: At the start of each month, automatically compile the previous month's spending data (total spent, category breakdown, daily trends, and LLM-generated insights) into a structured summary and email it to the user. This ties into the Usopp notification service (point 5) — the backend triggers a job on the 1st of every month, fetches the user's cached analytics and insights for the previous period, and dispatches the report via the notification service. Users should be able to opt-in/out of this from their profile settings.

9. **Monthly Budget Setting** [Feature]: Allow users to set a monthly spending budget (overall and optionally per-category). Add a `user_budgets` table storing `user_id`, `month`, `overall_limit`, and an optional JSONB `category_limits` field. The dashboard should show a progress bar or gauge comparing current month's spending against the set budget. When a new receipt is uploaded and the cumulative spend crosses 80% or 100% of the budget, trigger a warning — either shown in the dashboard insights section or pushed via the Usopp notification service as an alert email.

10. **PDF Report** [Feature]: Add an on-demand "Export Report" button on the dashboard that generates a downloadable PDF of the user's spending data for a selected month or custom date range. The PDF should include the total spent, category breakdown (with a simple table or chart), daily spending trend, and the AI-generated insights and warnings. This can be implemented as a backend endpoint (`GET /report/pdf?month=2026-03`) that uses a Go PDF library (e.g., `go-pdf/fpdf` or `jung-kurt/gofpdf`) to render the report and stream it back to the frontend as a file download.

11. **Pro Plans (For Paid Users)** [Feature]: Introduce a freemium model with a Pro tier. Free users get unlimited receipt uploads, basic analytics, and standard LLM insights. Pro users unlock PDF report exports, per-category budget tracking, monthly sync reports, and priority access to newer AI models for richer insights. Implement payments using Stripe (or Razorpay for INR users) — add a `subscriptions` table tracking `user_id`, `plan`, `status`, `stripe_customer_id`, and `current_period_end`. The backend validates the user's plan on gated endpoints via middleware, and the frontend shows an upgrade prompt when free-tier limits are hit.


12. **Multi-Currency Normalization** [Feature]: Currently the app stores whatever currency the receipt carries or the user selects, but the dashboard doesn't normalize across currencies. Add a currency conversion layer — when computing analytics, convert all receipt amounts to the user's primary currency (set during signup via the `country` field) using a cached exchange rate table. Rates can be fetched daily from a free API (e.g., Open Exchange Rates or exchangerate.host) via a lightweight cron job or on-demand with a short TTL cache. This ensures the pie charts, daily trends, and budget tracking are all in one consistent currency even if the user uploads receipts from different countries.

13. **Receipt History & Search** [Feature]: Build a paginated "Receipt History" page where users can browse, search, and filter all their past uploads. Support filtering by date range, merchant name, category, and amount range. The backend adds a `GET /receipts?page=1&limit=20&merchant=&category=&from=&to=` endpoint that queries the `receipts` and `items` tables with the applied filters. On the frontend, show each receipt as a card with merchant, date, total, and a category tag strip — clicking a card expands it to show the full line-item breakdown. This gives users a way to actually revisit and audit their data beyond just the dashboard charts.

14. **Image Compression Pipeline** [Performance]: Receipt images are currently sent as-is to the OCR service, but large high-res photos from phone cameras can slow down the upload and OCR processing. Add a server-side image compression step in the genAI service — after decoding the base64 image, resize it to a max dimension (e.g., 1500px on the longest side) and compress to ~80% JPEG quality using Pillow before passing it to Mindee. This reduces OCR latency, lowers bandwidth between services, and keeps storage costs down if images are ever persisted to a bucket. Skip compression if the image is already below the threshold.

15. **Franky (Admin Dashboard Service)** [NewService]: Build an internal admin panel (accessible only to `admin` role users, already supported by the AuthN middleware) for monitoring platform health and user activity. The dashboard should show aggregate stats — total users, total receipts processed, receipts per day trend, most active users, LLM provider success/failure rates, and average OCR confidence scores. This can start as a simple frontend route (`/admin`) gated behind the existing role check, with a few new backend endpoints (`GET /admin/stats`, `GET /admin/users`) that query aggregate data from the existing tables. Keeps the ops team informed without needing to dig through logs.

---

## Build Order & Scenarios (When to pick what)

The remaining 13 items are grouped into 5 phases. Each phase builds on the previous one, so the dependencies flow naturally. Within a phase, items can be worked on in parallel if bandwidth allows.

---

### Phase 1 — Harden the core (Quick wins, zero new infra)

**Step 1 → #3 Confidence Score [Performance]**
- Scenario: Pick this up right now. It's a small change in the genAI `processReceipt.py` — you already have the confidence score computed. Just add a threshold check before proceeding with LLM categorization, and return a clear error to the frontend if it's too low.
- Why first: Prevents garbage data from entering the system. Every feature built after this (budgets, analytics, reports) relies on clean receipt data. Bad OCR → bad categories → bad insights. Fix the input quality before building more on top.
- Effort: ~1 day

**Step 2 → #7 Rate Limiting [Performance]**
- Scenario: Pick this up once the app has any real users, or immediately if it's already deployed. Even a handful of users hammering the upload endpoint can rack up OCR/LLM API costs fast.
- Why here: Protects your wallet and your third-party API quotas. Add middleware-level rate limiting on the backend (e.g., `go-chi/httprate` or a simple token bucket) for the upload and genAI-calling endpoints. Doesn't block any feature work.
- Effort: ~1 day

**Step 3 → #14 Image Compression Pipeline [Performance]**
- Scenario: Pick this up when you notice OCR calls are slow or when users start uploading high-res phone camera photos (12MP+). If you're already seeing 3-5s OCR latency, do it now.
- Why here: Reduces OCR processing time and bandwidth between backend ↔ genAI. A quick Pillow resize/compress step before Mindee. No schema changes, no frontend changes. Pure backend/genAI win.
- Effort: ~0.5 day

---

### Phase 2 — User-facing features that use existing data

**Step 4 → #13 Receipt History & Search [Feature]**
- Scenario: Pick this up as soon as Phase 1 is done. Users are uploading receipts but have no way to go back and see them. This is a core UX gap — the dashboard shows charts but not the actual data behind them.
- Why here: Uses only existing tables (`receipts`, `items`). No new infra. Adds a major missing page to the frontend. Once users can browse their history, they'll naturally want exports (PDF) and budgets — which come next.
- Effort: ~3-4 days (backend endpoint + frontend page with filters)

**Step 5 → #12 Multi-Currency Normalization [Feature]**
- Scenario: Pick this up when you have users uploading receipts in more than one currency, or if you're targeting users who travel. If all your users are single-currency, defer this.
- Why here: The receipt history page from Step 4 will make the currency inconsistency visible. Analytics charts mixing USD and EUR look broken. Fix it before building budgets (which need a single currency to make sense).
- Effort: ~2-3 days (exchange rate caching + conversion layer in analytics computation)

**Step 6 → #6 OAuth (Google SSO) [Feature]**
- Scenario: Pick this up when you're seeing signup drop-off, or when you want to reduce friction for new users. If signups are healthy with email/password, it can wait.
- Why here: Doesn't depend on anything, but doing it after the core features are solid means new users who sign up via Google land on a polished product. No point making onboarding frictionless if the product itself has gaps.
- Effort: ~2-3 days (Google OAuth flow + backend token exchange + frontend login button)

---

### Phase 3 — Smart features (Analytics + Budgets)

**Step 7 → #4 ML & Analytics [Feature]**
- Scenario: Pick this up once you have enough users with 2+ months of data. Week-over-week and month-over-month comparisons are meaningless with one month of receipts. The ML prediction model needs historical patterns.
- Why here: The multi-currency normalization from Phase 2 ensures the comparison data is clean. This enhances the existing dashboard — add comparison cards and a "predicted spend" widget. The ML model can start simple (linear regression on monthly totals) and get smarter over time.
- Effort: ~5-7 days (comparison logic in genAI + ML model + frontend dashboard widgets)

**Step 8 → #9 Monthly Budget Setting [Feature]**
- Scenario: Pick this up right after ML & Analytics. Once users can see their spending trends and predictions, the natural next question is "can I set a limit?" Budget alerts also become more meaningful when you can say "you're on track to exceed your budget based on your predicted spend."
- Why here: Needs the `user_budgets` table (new migration), a settings UI on the frontend, and budget-vs-actual logic in the dashboard. The 80%/100% threshold warnings tie into the notification service later, but for now they can just show in the dashboard.
- Effort: ~3-4 days (migration + backend endpoints + frontend budget UI + dashboard progress bar)

---

### Phase 4 — New services & integrations

**Step 9 → #5 Usopp (Notification Service) [NewService]**
- Scenario: Pick this up once budgets exist (Step 8). The notification service needs something to notify about — budget alerts and monthly reports are its first two consumers. Building it before there's content to send means it sits idle.
- Why here: This is a new microservice (likely Python or Go, event-driven). Start with email via SES or a transactional email provider (Resend, SendGrid). Wire it up to receive events from the backend — "budget threshold crossed" and "month ended, send report."
- Effort: ~5-7 days (new service scaffold + email templates + integration with backend via webhooks/queue)

**Step 10 → #8 Monthly Sync Report [Feature]**
- Scenario: Pick this up immediately after Usopp is live. It's the first scheduled job that uses the notification service — a cron trigger on the 1st of each month that compiles last month's analytics + insights and sends them via Usopp.
- Why here: Depends directly on Usopp being operational. Also benefits from the ML predictions (Step 7) — the monthly report can include "here's what we predict for next month."
- Effort: ~2-3 days (cron job + report template + opt-in/out setting)

**Step 11 → #10 PDF Report [Feature]**
- Scenario: Pick this up alongside or right after the monthly sync report. The data compilation logic is similar — the PDF is just a different output format of the same report. Users who get the email summary will want a downloadable version too.
- Why here: Reuses the report data assembly from Step 10. Add a Go PDF generation endpoint and an "Export PDF" button on the dashboard. Can also attach the PDF to the monthly sync email for a nice touch.
- Effort: ~3-4 days (Go PDF library integration + endpoint + frontend button)

---

### Phase 5 — Monetization & Ops

**Step 12 → #15 Franky (Admin Dashboard) [NewService]**
- Scenario: Pick this up before launching Pro plans. You need visibility into how many users you have, how the system is performing, and which features are being used — before you start charging people. If something breaks for a paying user and you have no admin panel, that's a bad look.
- Why here: Uses existing tables, existing admin role check. It's mostly a new frontend route + a few aggregate query endpoints. Gives you the operational confidence to launch paid plans.
- Effort: ~4-5 days (backend aggregate endpoints + frontend admin page with charts)

**Step 13 → #11 Pro Plans [Feature]**
- Scenario: Pick this up last. By this point you have: budgets, PDF exports, monthly reports, notifications, ML predictions, admin visibility — all the features that make a Pro tier worth paying for. Launching Pro before these exist means there's nothing compelling behind the paywall.
- Why here: This is the monetization layer. Add the `subscriptions` table, integrate Stripe/Razorpay, build the plan-gating middleware, and add the upgrade flow on the frontend. Gate PDF exports, per-category budgets, monthly sync reports, and premium AI models behind Pro.
- Effort: ~7-10 days (payment integration + subscription management + middleware + frontend upgrade flow)

---

### Quick Reference

| Phase | Points | Theme | Total Effort |
|-------|--------|-------|-------------|
| 1 | #3, #7, #14 | Harden the core | ~2.5 days |
| 2 | #13, #12, #6 | User-facing features | ~7-10 days |
| 3 | #4, #9 | Smart analytics + budgets | ~8-11 days |
| 4 | #5, #8, #10 | Services & reports | ~10-14 days |
| 5 | #15, #11 | Ops & monetization | ~11-15 days |
