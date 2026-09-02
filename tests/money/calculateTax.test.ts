import { test, expect } from 'vitest'
import { calculateTax } from '../../src/modules/orders/money/calculateTax'

test('calculates 18% GST correctly', () => {
    const tax = calculateTax(3400, { region: 'IN_GST' })

    expect(tax).toBe(612)
})

test('calculates without GST correctly', () => {
    const tax = calculateTax(5930, { region: 'NO_TAX' })

    expect(tax).toBe(0)
})

test('throws error for negative amount', () => {
    expect(() =>
        calculateTax(-45382, { region: "IN_GST" })
    ).toThrow()
})

test('throws error for non-integer amount', () => {
    expect(() =>
        calculateTax(4538.2, { region: "NO_TAX" })
    ).toThrow()
})

test('throws error for unknown tax region', () => {
    expect(() =>
        calculateTax(39012, { region: "UNKNOWN" })
    ).toThrow()
})

test('Rounds down decimal tax amount', () => {
    const tax = calculateTax(271, { region: "IN_GST" })
    expect(tax
    ).toBe(48)
})

test('stress test for large amount', () => {
    const tax = calculateTax(23_918_032_910, { region: "IN_GST" })
    expect(tax
    ).toBe(4_305_245_923)
})

test('Rounds down decimal tax amount', () => {
    const tax = calculateTax(23_918_032_910, { region: "IN_GST" })
    expect(tax
    ).toBe(4_305_245_923)
})

test('tax is calculated on discounted amount', () => {
    const discountedTotal = 4500
    const tax = calculateTax(discountedTotal, { region: "IN_GST" })

    expect(tax).toBe(810)
})
