import { test, expect } from "vitest";
import { applyDiscount } from "../../src/modules/orders/money/applyDiscount";

test('returns total when no discount is applied', () => {
    expect(applyDiscount(1500)).toBe(1500)
})

test('applies percentage discount correctly', () => {
    expect(applyDiscount(1500, { type: "percentage", value: 35 })).toBe(975)
})

test('applies fixed discount correctly', () => {
    expect(applyDiscount(3620, { type: "fixed", value: 765 })).toBe(2855)
})

test('throws error for percentage over 100', () => {
    expect(() => applyDiscount(2900, { type: "percentage", value: 135 })
    ).toThrow()
})

test('throws error for negative percentage discount', () => {
  expect(() =>
    applyDiscount(100000, {
      type: 'percentage',
      value: -10,
    })
  ).toThrow()
})

test('never returns negative total when discount exceeds total', () => {
  const total = applyDiscount(20000, {
    type: 'fixed',
    value: 50000,
  })

  expect(total).toBe(0)
})

test('100% percentage discount results in zero total', () => {
  const total = applyDiscount(50000, {
    type: 'percentage',
    value: 100,
  })

  expect(total).toBe(0)
})


test('floors discount amount to avoid over-discounting', () => {
  const total = applyDiscount(999, {
    type: 'percentage',
    value: 10,
  })

  // 10% of 999 = 99.9 → 99
  expect(total).toBe(900)
})

