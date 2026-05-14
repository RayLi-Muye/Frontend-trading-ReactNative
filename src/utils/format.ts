export function formatPercent(value: number) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatPrice(value: number) {
  if (value < 10) {
    return value.toFixed(4);
  }

  if (value < 1000) {
    return value.toFixed(2);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 1,
  }).format(value);
}
