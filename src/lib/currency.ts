export const EXCHANGE_RATE = 15745;

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function toIDR(amount: number, currency: string): number {
  return currency === "IDR" ? amount : amount * EXCHANGE_RATE;
}

export function toUSD(amount: number, currency: string): number {
  return currency === "USD" ? amount : amount / EXCHANGE_RATE;
}

export function formatAmount(
  amount: number,
  currency: string,
  displayCurrency: "IDR" | "USD"
): string {
  if (displayCurrency === "IDR") {
    return `Rp ${formatIDR(toIDR(amount, currency))}`;
  }
  return `$${formatUSD(toUSD(amount, currency))}`;
}

export function formatAmountAlt(
  amount: number,
  currency: string,
  displayCurrency: "IDR" | "USD"
): string {
  // Returns the "other" currency as secondary display
  if (displayCurrency === "IDR") {
    return `$${formatUSD(toUSD(amount, currency))}`;
  }
  return `Rp ${formatIDR(toIDR(amount, currency))}`;
}
