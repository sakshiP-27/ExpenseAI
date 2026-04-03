import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart as PieIcon,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Wallet,
  Calendar,
  User,
  Mail,
  Clock,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/client';
import type { AnalyticsData, InsightsData } from '@/types';
import styles from './Dashboard.module.css';

const CHART_COLORS = [
  '#a78bfa', '#6ee7b7', '#f9a8d4', '#fde68a',
  '#93c5fd', '#fdba74', '#67e8f9', '#c4b5fd',
  '#f472b6', '#34d399', '#fbbf24', '#60a5fa',
];

export default function Dashboard() {
  const { name, email } = useAuth();
  const displayName = name || email?.split('@')[0] || 'User';

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [analyticsRes, insightsRes] = await Promise.allSettled([
          api.get<AnalyticsData>('/useranalytics'),
          api.get<InsightsData>('/userinsights'),
        ]);
        if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
        if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasData = analytics && Array.isArray(analytics.categoryBreakdown) && analytics.categoryBreakdown.length > 0;

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        {/* ── Profile header ── */}
        <motion.div className={styles.profileCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.avatar}>
            <User size={28} />
          </div>
          <div className={styles.profileInfo}>
            <h1>{displayName}</h1>
            <p><Mail size={14} /> {email}</p>
          </div>
          {hasData && analytics && (
            <div className={styles.profileStat}>
              <Wallet size={18} />
              <div>
                <span className={styles.statLabel}>Total Spent</span>
                <span className={styles.statValue}>{analytics.currency} {analytics.totalSpent.toFixed(2)}</span>
              </div>
            </div>
          )}
        </motion.div>

        {loading && (
          <div className={styles.loadingState}>
            <div className={styles.spinner} />
            <p>Loading your dashboard...</p>
          </div>
        )}

        {!loading && !hasData && (
          <motion.div className={styles.emptyState} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <img src="https://illustrations.popsy.co/violet/app-launch.svg" alt="No data yet" className={styles.emptyIllustration} />
            <h2>No data yet</h2>
            <p>Upload a receipt or add an expense to see your analytics here</p>
          </motion.div>
        )}

        {!loading && hasData && (
          <>
            {/* ── AI Insights ── */}
            {insights && insights.summary && (
              <motion.div className={styles.insightsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ background: 'var(--accent-bg)', color: 'var(--accent-dark)' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2>AI Insights</h2>
                    {insights.computedAt && <span className={styles.timestamp}><Clock size={12} /> {new Date(insights.computedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
                <p className={styles.summary}>{insights.summary}</p>
                {insights.warnings && insights.warnings.length > 0 && (
                  <div className={styles.warnings}>
                    {insights.warnings.map((w, i) => (
                      <div key={i} className={styles.warningItem}>
                        <AlertTriangle size={16} />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Charts grid ── */}
            <div className={styles.chartsGrid}>
              {/* Category breakdown — Pie */}
              <motion.div className={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ background: 'var(--pink-bg)', color: 'var(--pink-dark)' }}>
                    <PieIcon size={20} />
                  </div>
                  <h2>Spending by Category</h2>
                </div>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={analytics!.categoryBreakdown}
                        dataKey="amount"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {analytics!.categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                        }}
                        formatter={(value: any) => [`${analytics!.currency} ${Number(value).toFixed(2)}`, 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className={styles.legend}>
                  {analytics!.categoryBreakdown.map((item, i) => (
                    <div key={item.category} className={styles.legendItem}>
                      <span className={styles.legendDot} style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className={styles.legendLabel}>{item.category}</span>
                      <span className={styles.legendValue}>{analytics!.currency} {item.amount.toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Category breakdown — Bar */}
              <motion.div className={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon} style={{ background: 'var(--green-bg)', color: 'var(--green-dark)' }}>
                    <TrendingUp size={20} />
                  </div>
                  <h2>Category Comparison</h2>
                </div>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics!.categoryBreakdown} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="category" width={120} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                        formatter={(value: any) => [`${analytics!.currency} ${Number(value).toFixed(2)}`, 'Amount']}
                      />
                      <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                        {analytics!.categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Daily spending — Area */}
              {analytics!.dailySpending && analytics!.dailySpending.length > 0 && (
                <motion.div className={`${styles.chartCard} ${styles.chartCardWide}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIcon} style={{ background: 'var(--blue-bg)', color: 'var(--blue-dark)' }}>
                      <Calendar size={20} />
                    </div>
                    <h2>Daily Spending Trend</h2>
                  </div>
                  <div className={styles.chartWrap}>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={analytics!.dailySpending} margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                        <defs>
                          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(d: string) => { const dt = new Date(d); return `${dt.getDate()}/${dt.getMonth() + 1}`; }}
                        />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                          formatter={(value: any) => [`${analytics!.currency} ${Number(value).toFixed(2)}`, 'Spent']}
                          labelFormatter={(d: any) => new Date(String(d)).toLocaleDateString()}
                        />
                        <Area type="monotone" dataKey="amount" stroke="#a78bfa" strokeWidth={2.5} fill="url(#areaGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
