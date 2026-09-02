import { test, expect } from 'vitest'
import { calculateFinalAmount } from '../../src/modules/orders/money/calculateFinalAmount'

test('calculates final amount with discount and tax', () => {
  const result = calculateFinalAmount({
    items: [
      { price: 20000, quantity: 2 }, // ₹400
      { price: 10000, quantity: 1 }, // ₹100
    ],
    discount: { type: 'percentage', value: 10 }, // 10%
    tax: { region: 'IN_GST' }, // 18%
  })

  expect(result).toEqual({
    subtotal: 50000,        // ₹500
    discountAmount: 5000,   // ₹50
    taxAmount: 8100,        // 18% of 450 = 81
    totalPayable: 53100,    // ₹531
  })
})

test('works without discount', () => {
  const result = calculateFinalAmount({
    items: [{ price: 10000, quantity: 1 }],
    tax: { region: 'IN_GST' },
  })

  expect(result.subtotal).toBe(10000)
  expect(result.discountAmount).toBe(0)
  expect(result.taxAmount).toBe(1800)
  expect(result.totalPayable).toBe(11800)
})


test('works with NO_TAX region', () => {
  const result = calculateFinalAmount({
    items: [{ price: 10000, quantity: 2 }],
    tax: { region: 'NO_TAX' },
  })

  expect(result.taxAmount).toBe(0)
  expect(result.totalPayable).toBe(20000)
})


test('clamps total to zero when discount exceeds subtotal', () => {
  const result = calculateFinalAmount({
    items: [{ price: 10000, quantity: 1 }],
    discount: { type: 'fixed', value: 50000 },
    tax: { region: 'IN_GST' },
  })

  expect(result.subtotal).toBe(10000)
  expect(result.discountAmount).toBe(10000)
  expect(result.taxAmount).toBe(0)
  expect(result.totalPayable).toBe(0)
})

test('empty cart results in zero payable', () => {
  const result = calculateFinalAmount({
    items: [],
    tax: { region: 'IN_GST' },
  })

  expect(result).toEqual({
    subtotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalPayable: 0,
  })
})

test('tax is applied after discount, not before', () => {
  const result = calculateFinalAmount({
    items: [{ price: 100000, quantity: 1 }], // ₹1000
    discount: { type: 'percentage', value: 50 }, // ₹500 off
    tax: { region: 'IN_GST' }, // 18% of 500 = 90
  })

  expect(result.taxAmount).toBe(9000)
  expect(result.totalPayable).toBe(59000)
})
