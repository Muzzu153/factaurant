import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CartDrawer } from '../../src/modules/cart/ui/cartDrawer'
import { cartStore } from '../../src/modules/cart/cart.store'

// Mock placeOrder server function (NO network in unit tests)
vi.mock('../../../src/modules/cart/cart.server', () => ({
  placeOrder: vi.fn(async () => {
    return { ok: true }
  }),
}))

// Mock alert so tests don’t actually popup
beforeEach(() => {
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  cartStore.setState(() => ({ items: [], isOpen: false }))
})

afterEach(cleanup)

describe('CartDrawer UI', () => {
  //   beforeEach(() => {
  //     render(<CartDrawer />)
  //   })

  test('does not render when closed', () => {
    expect(screen.queryByText(/your order/i)).not.toBeInTheDocument()
  })

  test('renders when opened', () => {
    cartStore.setState((s) => ({ ...s, isOpen: true }))

    render(<CartDrawer />)

    expect(screen.getByText(/your order/i)).toBeInTheDocument()
  })

  test('shows empty state message when cart is empty', () => {
    cartStore.setState((s) => ({ ...s, isOpen: true, items: [] }))

    render(<CartDrawer />)

    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  test('renders cart items when cart has items', () => {
    cartStore.setState((s) => ({
      ...s,
      isOpen: true,
      items: [
        {
          productId: 'p1',
          name: 'Burger',
          price: 10000,
          quantity: 2,
          imageUrl: null,
        },
      ],
    }))

    render(<CartDrawer />)

    expect(screen.getByText('Burger')).toBeInTheDocument()
    expect(screen.getByText(/qty:\s*2/i)).toBeInTheDocument()
  })

  test('renders correct total price', () => {
    cartStore.setState((s) => ({
      ...s,
      isOpen: true,
      items: [
        {
          productId: 'p1',
          name: 'Burger',
          price: 10000,
          quantity: 2,
          imageUrl: null,
        }, // $200
        {
          productId: 'p2',
          name: 'Fries',
          price: 5000,
          quantity: 1,
          imageUrl: null,
        }, // $50
      ],
    }))

    render(<CartDrawer />)

    // total = 25000 cents = $250.00
    expect(screen.getByText('$250.00')).toBeInTheDocument()
  })

  test('clicking backdrop closes the drawer', async () => {
    cartStore.setState((s) => ({ ...s, isOpen: true }))

    render(<CartDrawer />)

    // backdrop is the first child div with onClick
    // easiest reliable way: click on the semi-transparent overlay by using document query
    const backdrop = document.querySelector('.bg-black\\/50')
    expect(backdrop).toBeTruthy()

    fireEvent.click(backdrop!)

    // after toggle it should be closed and unmounted
    expect(screen.queryByText(/your order/i)).not.toBeInTheDocument()
  })

  test('remove button removes item from cart', async () => {
    cartStore.setState((s) => ({
      ...s,
      isOpen: true,
      items: [
        {
          productId: 'p1',
          name: 'Burger',
          price: 10000,
          quantity: 1,
          imageUrl: null,
        },
      ],
    }))

    render(<CartDrawer />)

    expect(screen.getByText('Burger')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /remove/i }))

    // item removed → empty state visible
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
  })

  test('Place Order button disabled until form is filled', async () => {
    cartStore.setState((s) => ({
      ...s,
      isOpen: true,
      items: [
        {
          productId: 'p1',
          name: 'Burger',
          price: 10000,
          quantity: 1,
          imageUrl: null,
        },
      ],
    }))

    render(<CartDrawer />)

    const placeOrderBtn = screen.getByRole('button', { name: /place-order/i })
    expect(placeOrderBtn).toBeDisabled()

    await userEvent.type(screen.getByPlaceholderText(/your name/i), 'Muzaffer')
    expect(placeOrderBtn).toBeDisabled()

    await userEvent.type(
      screen.getByPlaceholderText(/delivery address/i),
      'Mumbai',
    )
    expect(placeOrderBtn).toBeEnabled()
  })
})
