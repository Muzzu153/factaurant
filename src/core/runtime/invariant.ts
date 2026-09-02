export function invariant(conditon: unknown, message: string): asserts conditon {
    if (!conditon) {
        throw new Error(`Invariant Failed: ${message}`)
    }
}

