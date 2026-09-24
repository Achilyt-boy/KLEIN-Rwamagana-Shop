# API Integration Documentation

## The setup

The backend is an Express server on `http://localhost:4000` talking to a MySQL
database (`klein_ecommerce`). The frontend never touches the database — it only
ever goes through these endpoints.

All requests go through **one shared axios instance**
(`frontend/src/api/client.js`):

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('klein_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

Two things that interceptor gives us:

1. Every call is just `api.get('/products')` — the base URL is handled once.
2. The JWT is attached automatically, so pages never remember to do it.

There's also an `errorMessage()` helper that pulls the backend's
`{ message: "..." }` out of an error response, so forms show the real reason
something failed ("Only 2 left of …") instead of some axios string.

## Endpoints

### Products (public)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/health` | `{ status: "ok" }` — used to check the API is alive |
| GET | `/api/categories` | 6 rows: id, name, slug, emoji — feeds the sidebar |
| GET | `/api/products` | Query params: `search`, `category` (slug), `minPrice`, `maxPrice`, `sort` (`newest` / `price_asc` / `price_desc`), `page`, `limit` |
| GET | `/api/products/:id` | Single product, 404 if missing |

Listing returns a paged envelope:

```json
{
  "products": [
    {
      "id": 1,
      "name": "Classic Denim Jacket",
      "description": "Washed blue denim jacket…",
      "price": "28000.00",
      "stock": 24,
      "image_url": null,
      "categoryId": 1,
      "categoryName": "Clothes",
      "categorySlug": "clothes",
      "categoryEmoji": "👕"
    }
  ],
  "page": 1, "limit": 12, "total": 24, "totalPages": 2
}
```

Filtering and searching happen **in SQL**, not in the browser — the frontend
sends the parameters and renders what comes back. That's the only way it stays
correct once there are thousands of products.

Example call from `Products.jsx`:

```js
api.get('/products', {
  params: { search, category, minPrice, maxPrice, sort, page, limit: 12 },
})
```

### Authentication (public)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `fullName`, `email`, `password` | `201 { token, user }` |
| POST | `/api/auth/login` | `email`, `password` | `200 { token, user }` |
| GET | `/api/auth/me` | — (Bearer header) | `{ user }`, or 401 |

Passwords never touch the database in plain text — `bcrypt` hashes them (cost
10) at registration and `bcrypt.compare` checks them at login. Emails are
lower-cased and unique (a duplicate register returns 409). Error responses are
deliberately vague for bad logins ("Wrong email or password.") so you can't
probe which emails exist.

The flow on the frontend:

1. Login/register succeeds → token + user come back → token goes into
   localStorage, user into `AuthContext`.
2. `AuthContext` runs `GET /auth/me` once on app start, so refreshing the page
   doesn't log you out. If the token has expired, the catch branch clears it.
3. Every request afterwards carries the token via the interceptor.
4. Logout = remove the token from localStorage, set user to null.
5. `ProtectedRoute` wraps `/checkout`, `/orders`, `/orders/:id`. Logged out?
   You get redirected to `/login` and sent back where you were after login
   (`location.state.from`).

### Orders (require login — Bearer token)

| Method | Path | Notes |
|---|---|---|
| POST | `/api/orders` | Checkout. Body: `{ items: [{productId, quantity}], shipping: {name, phone, address} }` |
| GET | `/api/orders` | Current user's history, newest first, items grouped in |
| GET | `/api/orders/:id` | One order + items — what the tracking page polls |
| PATCH | `/api/orders/:id/status` | `{ status: "processing" }` — moves the order along |

Checkout is the most careful endpoint on the server. It runs inside a MySQL
transaction with `SELECT … FOR UPDATE` on each product row, because two people
buying the last jacket at the same time shouldn't both get it:

1. Validate the items and shipping info.
2. Lock each product row, check stock ≥ requested quantity. Not enough stock →
   roll everything back and return 409 with a human message.
3. Decrement stock, insert the `orders` row, insert one `order_items` row per
   line — **prices are read from the database, never trusted from the client**,
   so the total can't be tampered with in devtools.
4. Commit. Any error anywhere → rollback, so you can't end up with stock
   reduced but no order.

Response: `201 { orderId, total, status: "pending" }`, and the frontend
navigates straight to `/orders/:id`.

## Real-time order tracking

"Real-time" here is **polling** — the tracking page re-fetches
`GET /api/orders/:id` every 5 seconds using `setInterval` inside a
`useEffect`, with `useCallback` so the interval isn't rebuilt every render and
`clearInterval` on unmount so it stops when you leave the page:

```js
const fetchOrder = useCallback(() => { /* api.get(`/orders/${id}`) */ }, [id])

useEffect(() => {
  fetchOrder()
  timerRef.current = setInterval(fetchOrder, POLL_MS)  // 5000ms
  return () => clearInterval(timerRef.current)
}, [fetchOrder])
```

The page shows a pulsing "updated at" dot so it's obvious the data is live.
For the demo there's a small control panel that calls the PATCH endpoint to
push the order `pending → processing → shipped → delivered`, and you can watch
the timeline move on the next tick without touching refresh.

Why polling and not WebSockets? For an order page that's looked at a handful
of times, five seconds of latency is invisible, and polling survives
reconnection for free. WebSockets would need a whole extra layer of
infrastructure for zero user-visible benefit at this scale.

Note: status changes are owner-only (your token, your orders). In a real
deployment the PATCH would sit behind a separate staff/admin role — it's
mentioned as a known simplification in the challenges doc.

## Error handling convention

The backend returns errors as `{ "message": "human sentence" }` with an
appropriate status code (400 validation, 401 auth, 404 missing, 409 conflict,
500 anything unexpected — the last one goes through a central Express error
handler so stack traces never reach the browser). The frontend's `errorMessage()`
helper surfaces that sentence directly in the UI, in whatever language is
active via the translation files.
