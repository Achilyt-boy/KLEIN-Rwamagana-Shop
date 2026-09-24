# KLEIN - Rwamagana Shop

KLEIN is a full-stack e-commerce application for a retail start-up in Rwamagana, Rwanda. It lets customers browse products, search and filter the catalogue, create accounts, manage a cart, place orders, and follow order status changes.

This project was built for the **Integrated/Summative Assessment - Frontend React.js Module**. The frontend consumes the provided REST API instead of connecting directly to MySQL.

## What Is Included

- Responsive React 19 shopping interface
- Product catalogue with real API data
- Search, category filtering, price filtering, sorting, pagination, and product details
- Product images from database URLs, with category-based Unsplash fallbacks for the seeded catalogue
- English, French, and Kinyarwanda translations
- Registration, login, logout, protected routes, JWT session restore, and password hashing
- Cart add, quantity update, remove, subtotal, and persistent browser storage
- Authenticated checkout with server-side price calculation
- Order history and order tracking with automatic status refresh
- Express API, MySQL schema, seed data, and API integration tests
- Responsive visual design with Tailwind CSS 4 and custom CSS variables

## Technology Stack

### Frontend

- React 19 with functional components and hooks
- Vite development server and production bundler
- React Router for page routing and protected routes
- Axios for API requests
- `react-i18next`, `i18next`, and browser language detection for translations
- Tailwind CSS 4 plus `frontend/src/index.css` for the KLEIN visual system
- Oxlint for code quality checks

### Backend

- Node.js and Express
- MySQL through `mysql2/promise`
- JWT for authentication
- `bcryptjs` for password hashing
- `cors` for frontend API access
- `dotenv` for local configuration

## Project Structure

```text
KLEIN platform/
├── backend/
│   ├── config/db.js              MySQL connection pool
│   ├── database/schema.sql       Database, tables, categories, and products
│   ├── middleware/auth.js        JWT authentication middleware
│   ├── routes/auth.js            Register, login, and current-user API
│   ├── routes/products.js        Categories, catalogue, filters, and details
│   ├── routes/orders.js          Checkout, history, tracking, and status
│   ├── scripts/setupDb.js        Applies the schema and seed data
│   ├── scripts/apiTest.js        End-to-end API checks
│   ├── .env                      Local backend settings, not for production
│   └── server.js                 Express application and CORS setup
├── frontend/
│   ├── src/api/client.js         Shared Axios client and error handling
│   ├── src/components/           Navbar, footer, cards, spinner, timeline, etc.
│   ├── src/context/              Auth and cart state providers
│   ├── src/locales/              en.json, fr.json, and rw.json
│   ├── src/pages/                Home, products, auth, cart, checkout, orders
│   ├── src/utils/format.js       Price, date, and status formatting
│   ├── src/utils/productImages.js Category image fallbacks
│   ├── src/App.jsx               Routes and application shell
│   └── src/index.css             Global visual design and responsive styles
├── docs/                         Assessment reports
└── README.md                     This guide
```

## Requirements

- Node.js 18 or newer
- npm
- MySQL 8 or MariaDB
- XAMPP is supported for local MySQL, but XAMPP alone does not start the Express API

## Installation And Local Setup

Open three terminals from the project root.

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Start MySQL

Start **MySQL** in XAMPP. Apache is not required for this project. Confirm that MySQL is listening on port `3306`.

### 3. Configure the backend

The backend reads `backend/.env`:

```env
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=klein_ecommerce
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

Use a strong private `JWT_SECRET` outside classroom development. Never commit real production credentials.

### 4. Create the database

Run this once from `backend/`:

```bash
npm run db:setup
```

This creates `klein_ecommerce`, the users/products/orders tables, six categories, and 24 sample products. The script intentionally drops and recreates the development database, so do not run it against important data.

### 5. Start the API

From `backend/`:

```bash
npm start
```

The API runs at `http://localhost:4000`. Check it with:

```text
http://localhost:4000/api/health
```

Expected response:

```json
{ "status": "ok", "service": "klein-api" }
```

### 6. Start the frontend

From `frontend/`:

```bash
npm run dev
```

Open `http://localhost:5173`.

The frontend API URL defaults to `http://localhost:4000/api`. To use another API:

```env
VITE_API_URL=http://localhost:4000/api
```

Put that variable in `frontend/.env.local` and restart Vite after changing it.

## Frontend Routes

| Route           | Component           | Purpose                                             |
| --------------- | ------------------- | --------------------------------------------------- |
| `/`             | `Home.jsx`          | Hero, categories, and featured products             |
| `/products`     | `Products.jsx`      | Search, filters, sorting, pagination, and catalogue |
| `/products/:id` | `ProductDetail.jsx` | Product information and add-to-cart quantity        |
| `/login`        | `Login.jsx`         | Existing user authentication                        |
| `/register`     | `Register.jsx`      | New account creation                                |
| `/cart`         | `Cart.jsx`          | Cart quantities, removal, totals, and checkout link |
| `/checkout`     | `Checkout.jsx`      | Protected delivery form and order creation          |
| `/orders`       | `Orders.jsx`        | Protected order history                             |
| `/orders/:id`   | `OrderTracking.jsx` | Protected order status timeline                     |

`ProtectedRoute.jsx` prevents checkout and order pages from being opened without a valid login session.

## How Each Functionality Works

### Product browsing

`Products.jsx` reads search, category, price, sort, and page values from the URL query string. This means filters can be refreshed, bookmarked, and shared. It calls `GET /api/products` and renders each result through `ProductCard.jsx`.

`ProductDetail.jsx` calls `GET /api/products/:id`. The customer can select a quantity and add the item through `CartProvider.jsx`.

### Product images

The database `image_url` column is optional. `getProductImage()` in `frontend/src/utils/productImages.js` uses the database URL when one exists; otherwise it selects a category image from Unsplash. This keeps the seeded catalogue visually complete without placing image files inside the repository.

If a remote image cannot load, the product tile still keeps its coloured image area and category identity. For production, replace the remote URLs with approved hosted product images or local assets.

### Authentication

`Register.jsx` and `Login.jsx` call the auth methods exposed by `AuthProvider.jsx`.

1. The frontend sends the form to the API.
2. The backend validates the input.
3. Passwords are hashed with `bcryptjs` before storage.
4. The API returns a JWT and safe user data.
5. The frontend stores the token in `localStorage` under `klein_token`.
6. `api/client.js` attaches the token to later requests.
7. On refresh, `AuthProvider.jsx` calls `/auth/me` to restore the session.

Logout removes the token and clears the current user state. The backend never returns a password hash to the frontend.

### Shopping cart

`CartProvider.jsx` owns cart state globally. It provides `addItem`, `updateQuantity`, `removeItem`, `clearCart`, `items`, `count`, and `subtotal` to the pages and components. The cart is saved in `localStorage` so a refresh does not immediately empty it.

The client sends product IDs and quantities at checkout. It does not trust client-side prices.

### Checkout and orders

`Checkout.jsx` sends delivery details and cart lines to `POST /api/orders`. The backend reads current product prices from MySQL, checks stock, calculates the total, creates the order and order items in a transaction, then reduces stock.

`Orders.jsx` loads the authenticated user's history. `OrderTracking.jsx` polls the order endpoint every few seconds while the page is open and cleans up the timer when the user leaves.

### Internationalisation

`i18n.js` loads English (`en`), French (`fr`), and Kinyarwanda (`rw`) locale files. `LanguageSwitcher.jsx` changes the language and stores the selection in `localStorage` under `klein_lang`. Components use the `t('section.key')` function rather than hard-coded interface text.

### Visual design and responsiveness

The main design tokens live in `frontend/src/index.css`:

- Deep green ink for navigation and primary actions
- Coral accent for calls to action and stock notices
- Cream background and pale sage surfaces
- Rounded product cards with restrained shadows
- Responsive product grids for desktop, tablet, and mobile
- Editorial hero shapes and readable retail typography

Tailwind utility classes handle local layout, while named CSS classes such as `.hero`, `.card`, `.panel`, `.btn`, and `.footer__grid` handle shared visual patterns.

## Backend API

All routes are prefixed with `http://localhost:4000/api`.

### Public endpoints

| Method | Endpoint         | Purpose                                            |
| ------ | ---------------- | -------------------------------------------------- |
| `GET`  | `/health`        | API health check                                   |
| `GET`  | `/categories`    | List product categories                            |
| `GET`  | `/products`      | Product listing, search, filters, sort, pagination |
| `GET`  | `/products/:id`  | Product details                                    |
| `POST` | `/auth/register` | Create an account and return a JWT                 |
| `POST` | `/auth/login`    | Authenticate and return a JWT                      |

Example catalogue request:

```text
GET /api/products?search=bag&category=bags&minPrice=10000&maxPrice=50000&sort=price_asc&page=1&limit=12
```

### Protected endpoints

Protected requests require:

```text
Authorization: Bearer <jwt>
```

| Method  | Endpoint             | Purpose                                   |
| ------- | -------------------- | ----------------------------------------- |
| `GET`   | `/auth/me`           | Restore the logged-in user                |
| `GET`   | `/orders`            | Current user's order history              |
| `POST`  | `/orders`            | Create an order from cart items           |
| `GET`   | `/orders/:id`        | Read one user's order and items           |
| `PATCH` | `/orders/:id/status` | Update order status for the demo workflow |

Valid order statuses are `pending`, `processing`, `shipped`, `delivered`, and `cancelled`.

## Database Tables

- `users` - account details and bcrypt password hashes
- `categories` - the six product groups and display emoji
- `products` - names, descriptions, RWF prices, stock, and optional image URLs
- `orders` - customer, delivery details, total, status, and timestamps
- `order_items` - immutable product name, quantity, and unit price for each order

The order API uses a database transaction so stock and order records stay consistent when checkout succeeds or fails.

## Testing And Quality Checks

Run the backend integration suite while the API and database are running:

```bash
cd backend
npm test
```

The suite covers health checks, categories, product listing, search, filters, product details, registration, duplicate accounts, login, JWT-protected routes, checkout, stock reduction, order history, tracking, and status validation.

Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

The production build confirms that Vite can compile the complete React application. The linter may report a warning for the existing unused `slug` parameter in `src/utils/format.js`.

## Troubleshooting

### The browser says Network Error during registration

XAMPP MySQL is only the database. The Express API must also be running:

```bash
cd backend
npm start
```

Then verify `http://localhost:4000/api/health`. If the API is running on another port, update `VITE_API_URL` and restart Vite.

### MySQL connection errors

- Confirm MySQL is started in XAMPP.
- Check that port `3306` is free and matches `DB_PORT`.
- Confirm `DB_USER`, `DB_PASSWORD`, and `DB_NAME` in `backend/.env`.
- Run `npm run db:setup` from `backend/` for a fresh development database.

### CORS errors

The API accepts the configured frontend origin and local `localhost` or `127.0.0.1` origins. Restart the backend after editing `backend/server.js` or `.env`. Keep the frontend URL consistent, for example use `http://localhost:5173` in both the browser and configuration.

### Product images do not appear

The fallback images require internet access to Unsplash. The shop still works without them. For an offline or production deployment, put approved images in `frontend/public/` or set `image_url` values in the products table.

### Port already in use

Change `PORT` in `backend/.env` and set the matching `VITE_API_URL` in `frontend/.env.local`, then restart both applications.

## Assessment Documentation

- [UI design explanation](docs/UI-DESIGN.md)
- [API integration documentation](docs/API-INTEGRATION.md)
- [Testing report](docs/TESTING-REPORT.md)
- [Challenges faced and solutions](docs/CHALLENGES.md)

## Security Notes

- Passwords are hashed before they reach the database.
- JWTs are checked by protected backend routes.
- Checkout totals are calculated from database prices, not browser values.
- SQL values are passed as parameters through `mysql2`.
- Production deployments should use HTTPS, secure cookies or a stronger token strategy, a private JWT secret, restricted CORS, and a managed database user instead of MySQL root.
