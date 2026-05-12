export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  }
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (n >= 10_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  // Show commas for 1,000–9,999 as per spec ("1,234")
  return Math.floor(n).toLocaleString();
}