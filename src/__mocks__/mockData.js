const today = new Date()
const fmt = (d) => d.toISOString().split('T')[0]
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const subDays = (d, n) => addDays(d, -n)

export const mockBills = [
  { id: '1', provider: 'Rogers', category: 'Telecom', amount: 145.50, expected: 130.00, variance_pct: 11.9, due_date: fmt(addDays(today, 2)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'RGR-001', payment_method: 'Credit Card', flagged: true, flag_reason: 'Exceeds baseline by 11.9%', status: 'upcoming' },
  { id: '2', provider: 'Enbridge', category: 'Utilities', amount: 189.00, expected: 190.00, variance_pct: -0.5, due_date: fmt(addDays(today, 5)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'ENB-002', payment_method: 'Bank Transfer', flagged: false, flag_reason: '', status: 'upcoming' },
  { id: '3', provider: 'Netflix', category: 'Streaming', amount: 22.99, expected: 22.99, variance_pct: 0, due_date: fmt(addDays(today, 10)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'NFX-003', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'upcoming' },
  { id: '4', provider: 'Hydro One', category: 'Utilities', amount: 210.00, expected: 160.00, variance_pct: 31.3, due_date: fmt(addDays(today, 1)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'HYD-004', payment_method: 'Bank Transfer', flagged: true, flag_reason: 'Exceeds baseline by 31.3%', status: 'upcoming' },
  { id: '5', provider: 'Spotify', category: 'Streaming', amount: 11.99, expected: 11.99, variance_pct: 0, due_date: fmt(addDays(today, 15)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'SPT-005', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'upcoming' },
  { id: '6', provider: 'Bell', category: 'Telecom', amount: 95.00, expected: 95.00, variance_pct: 0, due_date: fmt(subDays(today, 5)), billing_period_start: fmt(subDays(today, 60)), billing_period_end: fmt(subDays(today, 30)), account_number: 'BEL-006', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'paid' },
  { id: '7', provider: 'Intact', category: 'Insurance', amount: 185.00, expected: 180.00, variance_pct: 2.8, due_date: fmt(subDays(today, 2)), billing_period_start: fmt(subDays(today, 60)), billing_period_end: fmt(subDays(today, 30)), account_number: 'INT-007', payment_method: 'Bank Transfer', flagged: false, flag_reason: '', status: 'overdue' },
  { id: '8', provider: 'Disney+', category: 'Streaming', amount: 13.99, expected: 13.99, variance_pct: 0, due_date: fmt(addDays(today, 20)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'DSN-008', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'upcoming' },
  { id: '9', provider: 'TekSavvy', category: 'Internet', amount: 65.00, expected: 65.00, variance_pct: 0, due_date: fmt(addDays(today, 8)), billing_period_start: fmt(subDays(today, 30)), billing_period_end: fmt(today), account_number: 'TEK-009', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'upcoming' },
  { id: '10', provider: 'Rogers', category: 'Telecom', amount: 130.00, expected: 130.00, variance_pct: 0, due_date: fmt(subDays(today, 32)), billing_period_start: fmt(subDays(today, 60)), billing_period_end: fmt(subDays(today, 30)), account_number: 'RGR-001', payment_method: 'Credit Card', flagged: false, flag_reason: '', status: 'paid' },
]

export const mockProviders = [
  { id: 'p1', provider_name: 'Rogers', category: 'Telecom', baseline_amount: 130, spike_threshold_pct: 10, first_seen: '2024-01-01', active: true },
  { id: 'p2', provider_name: 'Enbridge', category: 'Utilities', baseline_amount: 190, spike_threshold_pct: 10, first_seen: '2024-01-01', active: true },
  { id: 'p3', provider_name: 'Netflix', category: 'Streaming', baseline_amount: 22.99, spike_threshold_pct: 5, first_seen: '2024-01-01', active: true },
  { id: 'p4', provider_name: 'Hydro One', category: 'Utilities', baseline_amount: 160, spike_threshold_pct: 15, first_seen: '2024-01-01', active: true },
  { id: 'p5', provider_name: 'Spotify', category: 'Streaming', baseline_amount: 11.99, spike_threshold_pct: 5, first_seen: '2024-01-01', active: true },
  { id: 'p6', provider_name: 'Bell', category: 'Telecom', baseline_amount: 95, spike_threshold_pct: 10, first_seen: '2024-01-01', active: true },
  { id: 'p7', provider_name: 'Intact', category: 'Insurance', baseline_amount: 180, spike_threshold_pct: 10, first_seen: '2024-01-01', active: true },
  { id: 'p8', provider_name: 'Disney+', category: 'Streaming', baseline_amount: 13.99, spike_threshold_pct: 5, first_seen: '2024-01-01', active: true },
  { id: 'p9', provider_name: 'TekSavvy', category: 'Internet', baseline_amount: 65, spike_threshold_pct: 5, first_seen: '2024-01-01', active: true },
]

export const mockSettings = {
  default_threshold: 10,
  currency: 'CAD',
  timezone: 'America/Toronto',
}

export const mockMonthlyTrend = [
  { month: 'Jan', total: 780 },
  { month: 'Feb', total: 720 },
  { month: 'Mar', total: 810 },
  { month: 'Apr', total: 760 },
  { month: 'May', total: 850 },
  { month: 'Jun', total: 933.47 },
]

export const mockCategorySpend = [
  { name: 'Telecom', value: 145.50 },
  { name: 'Utilities', value: 399.00 },
  { name: 'Streaming', value: 48.97 },
  { name: 'Insurance', value: 185.00 },
  { name: 'Internet', value: 65.00 },
]

export const mockActualVsExpected = [
  { provider: 'Rogers', expected: 130, actual: 145.50 },
  { provider: 'Enbridge', expected: 190, actual: 189 },
  { provider: 'Hydro One', expected: 160, actual: 210 },
  { provider: 'Intact', expected: 180, actual: 185 },
  { provider: 'TekSavvy', expected: 65, actual: 65 },
  { provider: 'Netflix', expected: 22.99, actual: 22.99 },
  { provider: 'Spotify', expected: 11.99, actual: 11.99 },
]
