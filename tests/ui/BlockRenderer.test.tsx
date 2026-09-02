// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BlockRenderer } from '../../src/core/ui/BlockRenderer'

// Mock tenant hook
const mockTenant = {
  blocks: {
    hero_1: { type: 'hero_text', props: { text: 'Hello World' } },
    menu_1: { type: 'menu_grid', props: {} },
    bad_1: { type: 'unknown_block', props: {} },
  },
  pages: {
    home: {
      layout: {
        main: ['hero_1', 'bad_1', 'menu_1'],
      },
    },
  },
}

// 2️ Mock registry
vi.mock('../../src/modules/hero/registry', () => ({
  COMPONENT_REGISTRY: {
    hero_text: () => <div>Hello World</div>,
    menu_grid: () => <div>Menu Grid</div>,
    // ❌ unknown_block intentionally missing
  },
}))

const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

describe('BlockRenderer crash safety', () => {
  test('renders valid blocks', () => {
    render(
      <BlockRenderer tenant={mockTenant} pageSlug="home" areaSlug="main" />,
    )

    expect(screen.getByText('Hello World')).toBeInTheDocument()
    expect(screen.getByText('Menu Grid')).toBeInTheDocument()
  })

  test('skips unknown blocks without crashing', () => {
    expect(() => {
      render(
        <BlockRenderer tenant={mockTenant} pageSlug="home" areaSlug="main" />,
      )
    }).not.toThrow()
  })

  test('continues rendering after unknown block', () => {
    render(
      <BlockRenderer tenant={mockTenant} pageSlug="home" areaSlug="main" />,
    )

    const blocks = screen.getAllByText(/Hello World|Menu Grid/)
    expect(blocks.length).toBe(2)
  })
})

spy.mockRestore()
