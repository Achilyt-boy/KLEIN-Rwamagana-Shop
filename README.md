# KLEIN — E-commerce Web Application

An online shop for KLEIN, a retail start-up in Rwamagana. Customers can browse
products, search and filter, switch between English / French / Kinyarwanda, create
an account, fill a cart, check out, and follow their order as its status changes.

The whole thing is split in two:

- **`backend/`** — REST API built with Node.js, Express and MySQL
- **`frontend/`** — single-page app built with React 19, Vite and Tailwind CSS 4

---

## Running it locally

You need Node.js (18+) and MySQL. I used XAMPP's MySQL, but any server works —
just update `backend/.env` if your credentials are different.

**1. Set up the database**

```bash
cd backend
npm install
npm run db:setup     # creates the klein_ecommerce database and fills it with sample data
```

**2. Start the API** (terminal 1)

```bash
cd backend
npm start            # runs on http://localhost:4000
```

**3. Start the frontend** (terminal 2)

```bash
cd frontend
npm install
npm run dev          # runs on http://localhost:5173
```

Open http://localhost:5173 and you're in. The API base URL lives in
`frontend/src/api/client.js` and can be overridden with a `VITE_API_URL`
environment variable.

## Testing

```bash
cd backend
npm test             # 28 API integration tests — needs the API running
```

The frontend has its own checks: `npm run lint` (oxlint) and `npm run build`.

## Project layout

```
KLEIN platform/
├── backend/
│   ├── database/schema.sql        # tables + seed data, the file to submit
│   ├── scripts/setupDb.js         # applies the schema
│   ├── scripts/apiTest.js         # integration tests
│   ├── config/db.js               # MySQL connection pool
│   ├── middleware/auth.js         # JWT check
│   ├── routes/auth.js             # register / login / me
│   ├── routes/products.js         # listing, search, filters, detail
│   ├── routes/orders.js           # checkout, history, status
│   └── server.js
└── frontend/
    └── src/
        ├── api/client.js          # shared axios instance
        ├── components/            # Navbar, ProductCard, StatusTimeline, …
        ├── context/               # auth + cart state
        ├── locales/               # en.json, fr.json, rw.json
        ├── pages/                 # one file per route
        └── utils/format.js        # price/date/status helpers
```

## Documentation

The written reports live in `docs/`:

- [UI design explanation](docs/UI-DESIGN.md)
- [API integration documentation](docs/API-INTEGRATION.md)
- [Testing report](docs/TESTING-REPORT.md)
- [Challenges faced and how they were solved](docs/CHALLENGES.md)
