export function detectSpike(bill, provider) {
  const baseline = provider.baseline_amount || bill.amount
  const variance = ((bill.amount - baseline) / baseline) * 100
  const threshold = provider.spike_threshold_pct || 10

  if (Math.abs(variance) >= threshold) {
    return {
      flagged: true,
      variance_pct: variance,
      flag_reason: variance > 0
        ? `Exceeds baseline by ${variance.toFixed(1)}%`
        : `Below baseline by ${Math.abs(variance).toFixed(1)}%`,
    }
  }
  return { flagged: false, variance_pct: variance }
}
