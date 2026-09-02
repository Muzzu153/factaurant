import { test, expect } from 'vitest'
import { db } from '../../src/core/db/client' 

test('database is reachable', async () => {
  const tenant = await db.query.tenants.findFirst()
  expect(tenant).toBeTruthy()
})




// test('tenant resolves by domain', async ({ request }) => {
//     const res = await request.get('/', {
//         headers: { host: 'pizza-king.localhost' },
//     })

//     expect(res.status()).toBe(200)
// })