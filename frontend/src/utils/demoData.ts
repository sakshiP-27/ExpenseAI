import type { AnalyticsData, InsightsData } from '@/types';

export const demoAnalytics: AnalyticsData = {
  totalSpent: 24850.75,
  currency: 'INR',
  categoryBreakdown: [
    { category: 'Food & Groceries', amount: 8420.50 },
    { category: 'Dining Out', amount: 4250.00 },
    { category: 'Transportation', amount: 3100.00 },
    { category: 'Shopping', amount: 2800.00 },
    { category: 'Entertainment', amount: 2150.25 },
    { category: 'Health & Pharmacy', amount: 1580.00 },
    { category: 'Utilities', amount: 1350.00 },
    { category: 'Subscriptions', amount: 1200.00 },
  ],
  dailySpending: [
    { date: '2026-03-25', amount: 1250.00 },
    { date: '2026-03-26', amount: 3420.50 },
    { date: '2026-03-27', amount: 845.50 },
    { date: '2026-03-28', amount: 2100.00 },
    { date: '2026-03-29', amount: 4560.25 },
    { date: '2026-03-30', amount: 1890.00 },
    { date: '2026-03-31', amount: 3200.00 },
    { date: '2026-04-01', amount: 2780.50 },
    { date: '2026-04-02', amount: 1650.00 },
    { date: '2026-04-03', amount: 3154.00 },
  ],
  period: 'monthly',
  computedAt: '2026-04-03T14:30:00Z',
};

export const demoInsights: InsightsData = {
  summary:
    'You spent ₹24,850.75 this month. Food & Groceries is your biggest category at 33.9% of total spending. Your daily average is ₹2,485 with a noticeable spike on March 29th.',
  warnings: [
    'Your Dining Out spending (₹4,250) is 17% of your total — consider cooking at home a few more days per week to save ₹1,500+/month.',
    'You have 8 active subscriptions totaling ₹1,200/month. Review if all of them are still being used regularly.',
    'Spending spiked to ₹4,560 on March 29th — that\'s nearly double your daily average. Keep an eye on impulse purchases.',
  ],
  period: 'monthly',
  computedAt: '2026-04-03T14:30:00Z',
};
