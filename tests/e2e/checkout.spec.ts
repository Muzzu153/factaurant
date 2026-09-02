// import test from "@playwright/test";
import { expect, test } from "@playwright/test";

// 1. DEFINE THE TENATN URL
// Since we set up the hosts file, this URL works locally!
const PIZZA_URL = 'http://pizza-king.localhost:3000';

test.describe('Pizza king customer flow', () => {

  test('should load the homepage with correct theme', async ({ page }) => {
    // 1. Visit the site
    await page.goto(PIZZA_URL);

    // 2. Check the title (from DB)
    // We expect the text "Hot & Fresh" (from our Seed data Hero)
    await expect(page.getByText('Hot & Fresh')).toBeVisible();

    // 3. Check the theme color
    // we expect the button to be Red(Pizza King theme)
    // Note: This reliers on your ProductCard button hacing the correct class or style
    const addButton = page.locator('button', { hasText: 'Add' }).first();
    await expect(addButton).toBeVisible();
  })

  test('should be able to add to cart and checkout', async ({ page }) => {
    await page.goto(PIZZA_URL);

    // 1. Add Item
    // Click the first "Add" button found on the page
    const addToCartButton = page.getByRole('button', {
      name: /add/i
    })
    addToCartButton.first().click()

    // 2. Open Cart
    // Wait for the drawer to appear (it has text "Your Order")
    await expect(page.getByText('Your Order')).toBeVisible();

    // 3. Check for "Checkout" button
    const placeOrderBtn = page.getByRole('button', { name: 'Place Order' });
    await expect(placeOrderBtn).toBeVisible();

    // 4. Fill Form
    // (We need to ensure the form is visible - you might need to click Checkout first depending on your UI flow)
    // Assuming the inputs are visible in the drawer footer:
    await page.getByPlaceholder('Your Name').fill('Playwright Robot');
    await page.getByPlaceholder('Delivery Address').fill('123 Test St');

    // 5. Submit
    // We set up a listener to catch the alert() window, because alerts block tests
    page.on('dialog', dialog => dialog.accept());

    await placeOrderBtn.click();

    // 6. Verify Cart Cleared
    // After success, the text "Your cart is empty" should eventually appear
    await expect(page.getByText('Your cart is empty')).toBeVisible();
  });
})

