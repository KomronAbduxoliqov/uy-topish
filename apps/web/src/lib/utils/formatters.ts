/**
 * Uzbekistan-First Currency & Phone Formatting Utilities
 * Deterministic formatting to avoid SSR / Hydration mismatch between Node.js and browsers
 */

export function formatNumber(num: number | string): string {
  if (num === null || num === undefined) return '0';
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

export function formatPriceUzs(priceUzs: number): string {
  return `${formatNumber(priceUzs)} so'm`;
}

export const formatUzs = formatPriceUzs;

export function formatPriceUsd(priceUsd: number): string {
  return `$${formatNumber(priceUsd)}`;
}

export function formatShortPriceUzs(priceUzs: number): string {
  if (priceUzs >= 1000000000) {
    return `${(priceUzs / 1000000000).toFixed(1)} mlrd`;
  }
  if (priceUzs >= 1000000) {
    return `${(priceUzs / 1000000).toFixed(1)} mln`;
  }
  return `${Math.round(priceUzs / 1000)}k`;
}

export const formatShortUzs = formatShortPriceUzs;

export function formatUzbekPhone(phone: string): string {
  const clean = phone.replace(/[^\d]/g, '');
  if (clean.length === 12 && clean.startsWith('998')) {
    return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10, 12)}`;
  }
  return phone;
}

export const formatUzPhone = formatUzbekPhone;

export function parseUzPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.length === 9) {
    return `998${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('998')) {
    return digits;
  }
  return digits;
}
