import { useQuery } from '@tanstack/react-query'
import { getMenu } from '../menu.server'
import { cartService } from '../../cart/cart.store'

export function MenuList() {
  const { data: products } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenu(), // Server Function
  })

  if (!products) return <div>Loading Menu...</div>

  return (
    <div className="menu-container">
      <h2>Our Menu</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {products.map((item) => (
          <li
            key={item.id}
            style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>{item.name}</strong>
              <span>${item.price.toFixed(2)}</span>
              <button
                onClick={() => cartService.add(item)}
                className="bg-(--accent) text-(--text) py-1 px-3"
              >
                Add
              </button>
            </div>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              {item.description}
            </p>
            <em style={{ fontSize: '0.8em' }} className="text-blue-400">
              {item.isAvailable}
            </em>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default MenuList
