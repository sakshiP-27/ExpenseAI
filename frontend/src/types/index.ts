/* ── Auth ─────────────────────────────────────────────────── */
export interface AuthResponse {
  token: string;
  userID: string;
  name: string;
  email: string;
  role: string;
}

/* ── Receipt / Upload ────────────────────────────────────── */
export interface ReceiptItem {
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export interface UploadResponse {
  receiptID: string;
  userID: string;
  email: string;
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  items: ReceiptItem[];
  categoriesSummary: Record<string, number>;
  confidenceScore: number;
}

export interface ManualExpenseRequest {
  merchant: string;
  date: string;
  currency: string;
  items: ReceiptItem[];
}

/* ── Analytics ───────────────────────────────────────────── */
export interface CategoryBreakdown {
  category: string;
  amount: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface AnalyticsData {
  totalSpent: number;
  currency: string;
  categoryBreakdown: CategoryBreakdown[];
  dailySpending: DailySpending[];
  period: string;
  computedAt: string;
}

/* ── Insights ────────────────────────────────────────────── */
export interface InsightsData {
  summary: string;
  warnings: string[];
  period: string;
  computedAt: string;
}

/* ── Today's Receipts ────────────────────────────────────── */
export interface TodayReceipt {
  receiptID: string;
  merchant: string;
  date: string;
  totalAmount: number;
  currency: string;
  confidenceScore: number;
  source: string;
  items: ReceiptItem[];
  categoriesSummary: Record<string, number>;
}

export interface TodayReceiptsResponse {
  receipts: TodayReceipt[];
}
