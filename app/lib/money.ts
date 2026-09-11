export const CURRENCY = 'PKR';

export function money(value: number | string | null | undefined) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}
