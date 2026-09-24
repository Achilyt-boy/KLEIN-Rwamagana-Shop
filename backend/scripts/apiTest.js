// API integration test — exercises every endpoint the frontend uses.
// Run from the backend folder:  node scripts/apiTest.js
// (the API server must already be running)

const BASE = process.env.API_URL || 'http://localhost:4000/api'

let passed = 0
let failed = 0

function check(label, condition, detail = '') {
  if (condition) {
    passed += 1
    console.log(`  PASS  ${label}`)
  } else {
    failed += 1
    console.log(`  FAIL  ${label} ${detail}`)
  }
}

async function call(method, path, { body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {
    /* no body */
  }
  return { status: res.status, data }
}

async function main() {
  const stamp = Date.now()
  const email = `tester${stamp}@klein.rw`

  console.log('\n1. Health & product browsing')
  let r = await call('GET', '/health')
  check('GET /health responds ok', r.status === 200 && r.data.status === 'ok')

  r = await call('GET', '/categories')
  check('GET /categories returns 6 categories', r.status === 200 && r.data.length === 6)

  r = await call('GET', '/products?limit=12')
  check('GET /products returns seeded list', r.status === 200 && r.data.total === 24)

  r = await call('GET', '/products?search=bag')
  check('search "bag" finds bags',
    r.status === 200 && r.data.total >= 3 &&
    r.data.products.every((p) => (p.name + p.description).toLowerCase().includes('bag')))

  r = await call('GET', '/products?category=cosmetics')
  check('category filter cosmetics works',
    r.status === 200 && r.data.total === 4 &&
    r.data.products.every((p) => p.categorySlug === 'cosmetics'))

  r = await call('GET', '/products?minPrice=10000&maxPrice=20000')
  check('price range 10k–20k works',
    r.status === 200 && r.data.products.every((p) => Number(p.price) >= 10000 && Number(p.price) <= 20000))

  r = await call('GET', '/products?category=shoes&search=leather&minPrice=30000&maxPrice=60000&sort=price_asc')
  check('combined filters + sort work',
    r.status === 200 && r.data.products.every(
      (p) => p.categorySlug === 'shoes' && Number(p.price) >= 30000 && Number(p.price) <= 60000))

  r = await call('GET', '/products/1')
  check('GET /products/1 detail works', r.status === 200 && r.data.id === 1)

  r = await call('GET', '/products/99999')
  check('GET missing product → 404', r.status === 404)

  console.log('\n2. Authentication')
  r = await call('POST', '/auth/register', { body: { fullName: 'Test User', email, password: 'secret123' } })
  check('register new user → 201 + token', r.status === 201 && !!r.data.token)
  const token = r.data.token

  r = await call('POST', '/auth/register', { body: { fullName: 'Test User', email, password: 'secret123' } })
  check('duplicate email → 409', r.status === 409)

  r = await call('POST', '/auth/register', { body: { fullName: 'X', email: 'bad', password: '1' } })
  check('invalid email → 400', r.status === 400)

  r = await call('POST', '/auth/login', { body: { email, password: 'wrong' } })
  check('wrong password → 401', r.status === 401)

  r = await call('POST', '/auth/login', { body: { email, password: 'secret123' } })
  check('correct login → token', r.status === 200 && !!r.data.token)
  const loginToken = r.data.token

  r = await call('GET', '/auth/me', { token: loginToken })
  check('GET /auth/me returns user', r.status === 200 && r.data.user.email === email)

  r = await call('GET', '/auth/me')
  check('GET /auth/me without token → 401', r.status === 401)

  console.log('\n3. Orders & tracking')
  r = await call('GET', '/orders', { token: loginToken })
  check('empty order history', r.status === 200 && Array.isArray(r.data) && r.data.length === 0)

  const beforeStock = (await call('GET', '/products/1')).data.stock

  r = await call('POST', '/orders', {
    token: loginToken,
    body: {
      items: [{ productId: 1, quantity: 2 }, { productId: 17, quantity: 1 }],
      shipping: { name: 'Test User', phone: '0788111222', address: 'Rwamagana, KG 11 Ave' },
    },
  })
  check('checkout creates order → 201', r.status === 201 && r.data.orderId && r.data.status === 'pending')
  const orderId = r.data.orderId
  const expectedTotal = 28000 * 2 + 12500
  check('order total computed on server', Number(r.data.total) === expectedTotal,
    `(got ${r.data.total}, want ${expectedTotal})`)

  r = await call('POST', '/orders', { token: loginToken, body: { items: [], shipping: {} } })
  check('empty cart checkout → 400', r.status === 400)

  r = await call('POST', '/orders', {
    body: { items: [{ productId: 1, quantity: 1 }], shipping: { name: 'a', phone: '1', address: 'b' } },
  })
  check('checkout without login → 401', r.status === 401)

  r = await call('GET', '/orders', { token: loginToken })
  check('history shows the order with items',
    r.status === 200 && r.data.length === 1 && r.data[0].items.length === 2)

  r = await call('GET', `/orders/${orderId}`, { token: loginToken })
  check('tracking endpoint returns order + items',
    r.status === 200 && r.data.status === 'pending' && r.data.items.length === 2)

  const other = await call('POST', '/auth/register', {
    body: { fullName: 'Other', email: `other${stamp}@klein.rw`, password: 'secret123' },
  })
  r = await call('GET', `/orders/${orderId}`, { token: other.data.token })
  check("another user can't read the order → 404", r.status === 404)

  r = await call('PATCH', `/orders/${orderId}/status`, { token: loginToken, body: { status: 'processing' } })
  check('advance status → processing', r.status === 200 && r.data.status === 'processing')

  r = await call('GET', `/orders/${orderId}`, { token: loginToken })
  check('poll picks up new status', r.status === 200 && r.data.status === 'processing')

  r = await call('PATCH', `/orders/${orderId}/status`, { token: loginToken, body: { status: 'nope' } })
  check('invalid status → 400', r.status === 400)

  r = await call('GET', '/products/1')
  check('stock was reduced by checkout (−2)', r.data.stock === beforeStock - 2,
    `(got ${r.data.stock}, want ${beforeStock - 2})`)

  console.log(`\n${passed} passed, ${failed} failed\n`)
  process.exit(failed > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error('Test run crashed:', err.message)
  process.exit(1)
})
