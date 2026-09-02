// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ProductCard } from '../../src/modules/menu/ui/ProductCard'
import { Product } from '../../src/core/db/zod-schema/product.schema'
import * as cartModule from '../../src/modules/cart/cart.store'

const mockProduct: Product = {
  id: 'p1',
  name: 'Margherita Pizza',
  price: 12000,
  imageUrl: 'https://example.com/pizza.jpg',
  tenantId: 'c65dfef3-cfef-4470-ad51-700f7387faeb   ',
  isAvailable: true,
}

beforeEach(() => {
  vi.spyOn(cartModule.cartService, 'add').mockClear()
})

describe('ProductCard UI', () => {
  test('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    expect(screen.getByText(/\$120\.00/)).toBeInTheDocument()
  })

  test('renders product image when imageUrl exists', () => {
    render(<ProductCard product={mockProduct} />)

    const img = screen.getByRole('img', { name: /margherita pizza/i })
    expect(img).toHaveAttribute('src', mockProduct.imageUrl)
  })

  test('clicking Add to cart calls cartService.add()', async () => {
    const addSpy = vi.spyOn(cartModule.cartService, 'add')

    render(<ProductCard product={mockProduct} />)

    const addButton = screen.getByRole('button', { name: /add/i })
    await userEvent.click(addButton)

    expect(addSpy).toHaveBeenCalledTimes(1)
    expect(addSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
      }),
    )
  })

  test('does not crash when imageUrl is missing', () => {
    render(
      <ProductCard
        product={{
          ...mockProduct,
          imageUrl: undefined,
        }}
      />,
    )

    expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
  })
})
