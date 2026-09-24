# Testing Report

Testing happened in three layers: automated API tests, static checks
(lint/build), and actually loading the pages in a browser to see them work.

---

## 1. API integration testing (automated)

Script: `backend/scripts/apiTest.js` — run with `npm test` from the backend
folder while the API is running. It hits every endpoint the frontend uses and
asserts on real responses, including the awkward cases.

**Result: 28 / 28 passed** (re-runnable — ran it twice back to back to be sure).

| Area | What was checked | Result |
|---|---|---|
| Health | `/api/health` responds `ok` | ✅ |
| Listing | 24 seeded products returned, pagination envelope correct | ✅ |
| Search | `search=bag` returns only items whose name/description contains "bag" | ✅ |
| Category filter | `category=cosmetics` returns exactly that category | ✅ |
| Price filter | `minPrice=10000&maxPrice=20000` — every result inside the range | ✅ |
| Combined | category + search + price + sort all at once | ✅ |
| Detail | `/products/1` returns the product; `/products/99999` → 404 | ✅ |
| Register | new account → 201 + token | ✅ |
| Register | duplicate email → 409; malformed email → 400 | ✅ |
| Login | wrong password → 401; correct login → token | ✅ |
| Session | `/auth/me` with token → user; without token → 401 | ✅ |
| Checkout | valid order → 201, status `pending`, total computed server-side | ✅ |
| Checkout | empty cart → 400; no token → 401 | ✅ |
| Stock | stock reduced by exactly the quantity ordered (measured before/after) | ✅ |
| History | order appears with its two line items grouped in | ✅ |
| Isolation | a *different* user's token gets 404 on someone else's order | ✅ |
| Tracking | order status readable, updates picked up on the next poll | ✅ |
| Status PATCH | valid transition works; garbage status → 400 | ✅ |

Some of these are worth calling out. The stock check deliberately compares a
before/after reading instead of a hard-coded number, because the first version
of the test hardcoded `24 → 22` and started failing on the second run — the
test was wrong, not the code. Same with the `bag` search: it returns 3 items,
not the 4 I originally guessed, and all three are genuinely matches ("Travel
Duffel" matches on its description). Fixing the expectations rather than the
app is the correct move when the behaviour is actually right.

## 2. Static checks

| Check | Command | Result |
|---|---|---|
| Lint | `npm run lint` (oxlint, React hooks rules) | **0 warnings, 0 errors** |
| Production build | `npm run build` | ✅ builds clean (~426 KB JS, ~33 KB CSS gzipped to ~139 KB) |
| i18n bundle | grep the built JS for all three languages | EN, FR and RW strings all present |

The lint run wasn't zero on the first try — it caught a React
`exhaustive-deps` violation in the polling effect and two unused imports, all
of which were fixed properly (see challenges doc), not suppressed.

## 3. Functional testing (UI in a real browser)

The frontend was loaded in headless Chrome at every route, and the rendered
DOM was inspected for the right content, alongside the browser console for
errors.

| Page | Checked | Result |
|---|---|---|
| `/` | Hero text, category chips, featured product cards render | ✅ |
| `/products` | 12 cards on page 1, search bar, "Filters" sidebar, prices | ✅ |
| `/products/1` | Product name, 28,000 RWF, description, stock, back link | ✅ |
| `/login` | "Welcome back", email + password fields, submit button | ✅ |
| `/cart`, `/checkout`, `/orders` | Route resolves, no crash, shell renders | ✅ |

This round was not wasted: the first browser check came back with an **empty
root div** and a console error — `Cannot destructure property 'user' of
'useAuth(...)' as it is null`. React had crashed before painting anything.
That's how the duplicate-context bug in the challenges doc was found. After
the fix, the same check shows the full page and a clean console.

Manual walkthroughs performed against the running dev server:

- [x] Register a new account → lands logged in, navbar shows the user
- [x] Log out → navbar flips back to login/register
- [x] Log in → session survives a page refresh (token + `/auth/me`)
- [x] Wrong password → error message shown, no navigation
- [x] Search "bag" → grid narrows, URL shows `?search=bag`
- [x] Pick category + price range together → combined filtering works
- [x] Sort by price ascending → order visibly changes
- [x] Back button after filtering → previous filter view restored (URL state)
- [x] Switch language to French, then Kinyarwanda → whole UI changes,
      choice persists after reload
- [x] Add to cart from a card and from the detail page → badge increments
- [x] Change quantity, remove an item → subtotal recalculates
- [x] Refresh with items in cart → cart still there (localStorage)
- [x] Checkout → order created, cart emptied, tracking page opens
- [x] Order status advanced via the demo control → timeline moved on the
      next 5-second poll, no manual refresh
- [ ] Two users buying the last unit simultaneously — **not** tested in the
      browser; covered by design (row locks + transaction) and the stock
      assertion in the API tests

## Known gaps

Fair warnings about what this testing does *not* prove:

1. The status PATCH endpoint is owner-only, not admin-only. Fine for the
   demo, wrong for production — a real system needs a staff role.
2. No test coverage for very large catalogues or slow networks; the
   pagination logic is exercised but not stress-tested.
3. Browser checks were run in Chrome only.
4. There's no automated UI test suite (Playwright/Cypress) — the UI checks
   above are scripted page loads plus a manual click-through. Adding a
   component test for `ProductCard` and one end-to-end checkout test would be
   the natural next step.
