import { test, expect } from "vitest";
import { formatPrice } from "../../src/modules/orders/money/formatPrice";

test('formats USD correctly', () => {
  const price = formatPrice(123456, {
    currency: 'USD',
    locale: 'en-US',
  })

  expect(price).toBe('$1,234.56')
})

test('formats INR correctly', ()=>{
    const price = formatPrice(15234)

    expect(price).toBe('₹152.34')
})

test('formats INR correctly', ()=>{
    const price = formatPrice(152341928)

    expect(price).toBe('₹15,23,419.28')
})

test('formats without currency symbol when disabled', () => {
  const price = formatPrice(5000000, { showSymbol: false })

  expect(price).toBe('50,000.00')
})

test('throws error for non-integer amount', () => {
  expect(() => formatPrice(10.5)).toThrow()
})

test('formats zero correctly', () => {
  expect(formatPrice(0)).toBe('₹0.00')
})

test('formats negative values correctly', () => {
  const price = formatPrice(-2500)

  expect(price).toBe('-₹25.00')
})

test('uses Indian number grouping for INR', () => {
  const price = formatPrice(12345678)

  expect(price).toBe('₹1,23,456.78')
})

test('does not introduce rounding errors', () => {
  const price = formatPrice(1999)

  expect(price).toBe('₹19.99')
})



