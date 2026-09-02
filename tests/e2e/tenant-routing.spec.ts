import { test, expect } from '@playwright/test'

const PIZZA_URL = 'http://pizza-king.localhost:3000/'
const SUSHI_URL = 'http://sushi-master.localhost:3000/'

test('Pizza King homepage loads', async ({ page }) => {
    // await page.setExtraHTTPHeaders({
    //     host: 'http://pizza-king.localhost:3000/'
    // })

    await page.goto(PIZZA_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading')).toContainText(/Hot & Fresh/i)
})

test('Unknown tenant returns 404', async ({ page }) => {
    //  await page.setExtraHTTPHeaders({
    //     host: 'http://fake-shop.localhost:3000/'
    // })

    const res = await page.goto('http://fake-shop.localhost:3000/', { waitUntil: 'domcontentloaded' })

    // ✅ Usually TanStack sends 404 response
    expect(res?.status()).toBe(404)
})

test('Sushi Master homepage loads and differs from Pizza', async ({ page }) => {
    //  await page.setExtraHTTPHeaders({
    //     host: 'http://sushi-master.localhost:3000/'
    // })

    await page.goto(SUSHI_URL, { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('heading')).toContainText(/Artisan Sushi/i)
})
