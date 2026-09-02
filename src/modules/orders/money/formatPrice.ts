export type FormatPriceOptions = {
  currency?: 'INR' | 'USD'
  locale?: string
  showSymbol?: boolean
}

export function formatPrice(
  amount: number,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = 'INR',
    locale = currency === 'INR' ? 'en-IN' : 'en-US',
    showSymbol = true,
  } = options

  if (!Number.isInteger(amount)) {
    throw new Error('Amount must be an integer (minor units)')
  }

  const value = amount / 100

  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(value)
}
