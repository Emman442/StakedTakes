/**
 * Brier score and credibility index calculations for StakedTakes on GenLayer.
 */

export function calculateBrierScore(confidencePercent: number, outcome: 'TRUE' | 'FALSE'): number {
  const p = confidencePercent / 100;
  const o = outcome === 'TRUE' ? 1 : 0;
  return Number(Math.pow(p - o, 2).toFixed(4));
}

/**
 * Calculates a Credibility Index on a 0 - 10,000 scale from an array of Brier scores.
 * Lower Brier score (near 0) corresponds to higher credibility (up to 10,000).
 * Baseline coin-flip (0.25) yields ~5,000.
 */
export function calculateCredibilityIndex(brierScores: number[]): number {
  if (brierScores.length === 0) return 5000;
  const avg = brierScores.reduce((acc, curr) => acc + curr, 0) / brierScores.length;
  // Brier score ranges from 0 (perfect) to 1 (totally wrong).
  // Normalized score: max(0, 1 - Math.sqrt(avg)) or linear mapping
  // A calibrated forecaster with avg Brier 0.10 gets ~8,000+
  const normalized = Math.max(0, Math.min(1, 1 - (avg / 0.5)));
  const baseScore = normalized * 10000;
  // Volume confidence dampener (approaches 1.0 as count reaches 10)
  const volumeFactor = Math.min(1.0, 0.6 + 0.4 * (Math.min(brierScores.length, 10) / 10));
  return Math.round(baseScore * volumeFactor);
}

export function formatGEN(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount) + ' GEN';
}

export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export function formatTimeRemaining(deadlineStr: number): string {
  const deadline = new Date(deadlineStr).getTime();
  const now = Date.now();
  const diffMs = deadline - now;

  if (diffMs <= 0) return 'Expired / Pending';

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h left`;
  }
  if (diffHours > 0) {
    return `${diffHours}h ${diffMins}m left`;
  }
  return `${diffMins}m left`;
}

export function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
