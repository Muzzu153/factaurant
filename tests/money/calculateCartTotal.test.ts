import { describe, test, expect } from "vitest";
import { calculateCartTotal } from "../../src/modules/orders/money/calculateCartTotal";

describe('calculateCartTotal', () => {
    test('returns 0 for empty cart', () => {
        const total = calculateCartTotal([])
        expect(total).toBe(0)
    })

    test('calculates total for multiple items', () => {
        const total = calculateCartTotal([
            { price: 19900, quantity: 2 }, // ₹398
            { price: 9900, quantity: 1 },  // ₹99
        ])

        expect(total).toBe(49700)
    })

    test('multiplies price by quantity', () => {
        const total = calculateCartTotal([
            { price: 15000, quantity: 3 }
        ])

        expect(total).toBe(45000)
    })

    test('throws error for negative price', () => {
        expect(() =>
            calculateCartTotal([
                { price: -100, quantity: 1 }
            ])
        ).toThrow()
    })

    test('throws error for zero quantity', () => {
        expect(() =>
            calculateCartTotal([
                { price: 1000, quantity: 0 }
            ])
        ).toThrow()
    })


    test('throws error for negative quantity', () => {
        expect(() =>
            calculateCartTotal([
                { price: 1000, quantity: -2 }
            ])
        ).toThrow()
    })


    test('avoids floating point precision bugs', () => {
        const total = calculateCartTotal([
            { price: 100, quantity: 1 },
            { price: 208, quantity: 1 },
        ])

        expect(total).toBe(308)
    })

})
