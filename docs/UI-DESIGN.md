# UI Design Explanation

## Overall approach

I wanted the shop to look like something you'd actually buy from — not a
coursework prototype. So the design leans neutral: white cards on a very light
grey background, near-black text, and one accent colour (emerald) for the
actions that matter, like "Add to cart" and "Place order". Everything sits on
an 8px-ish spacing rhythm and cards use the same rounded corners and light
shadow, which is what keeps the pages feeling consistent even though they're
built by different people at different times — well, one person across a few
days.

The font is Plus Jakarta Sans, loaded from Google Fonts with a system-font
fallback, so it still looks fine offline.

**Colours:** `zinc-900` for text and primary buttons, `emerald-600` for accents
and success states, plus a small fixed palette for order statuses (amber =
pending, blue = processing, violet = shipped, green = delivered, rose =
cancelled).

## Layout structure

Every route renders inside the same shell:

```
Navbar (sticky)
└── <main>          ← page content from React Router
Footer
```

- **Navbar** carries the logo, the main links, the language switcher, a cart
  icon with a live item-count badge, and either the login/register buttons or
  the user's name + logout. On mobile it collapses behind a hamburger button.
- **Footer** is a simple three-column block: about, quick links, contact.

`App.jsx` also contains a small `ScrollToTop` component, because otherwise a
new page opens wherever the last one was scrolled to, which is confusing.

## Pages

| Route | What it does |
|---|---|
| `/` | Hero banner, the six categories as tappable chips, 8 newest products, "why KLEIN" cards |
| `/products` | The main browsing page: filter sidebar + search bar + sortable grid + pagination |
| `/products/:id` | Product detail with quantity picker and add-to-cart |
| `/login`, `/register` | Single-card forms centred on the page |
| `/cart` | Line items with quantity steppers, remove buttons, and an order summary panel |
| `/checkout` | Delivery form (name, phone, address) next to the order summary |
| `/orders` | Order history — each order shows its status chip, total, and a track button |
| `/orders/:id` | Live tracking: status timeline, items, shipping info, auto-refreshing |

## Product browsing — the important one

The listing page splits into a sidebar (about 240px) and the results grid.

- **Search** sits above the grid. Submitting it writes `?search=` into the URL.
- **Category filter** is a stack of buttons in the sidebar, "All categories"
  first. The active one turns black so you can see what's applied.
- **Price filter** is two number inputs (min/max) with a Search button.
- **Sort** dropdown: newest, price low→high, price high→low.
- Filters combine, and a "Clear filters" link resets everything.

The decision I'm happiest about here: **all filter state lives in the URL**
(via `useSearchParams`) rather than in component state. That means you can
bookmark a filtered view, share it in a message, or hit the back button and
land exactly where you were. It also made the code simpler — one place owns
the state instead of five `useState` calls that have to stay in sync.

Behind the scenes, results are stored tagged with a "query key" (a JSON string
of the current params). If the tag doesn't match the URL, we're loading. That
gives a correct spinner without the classic bug where a slow old request
overwrites a fast new one — stale responses get discarded.

## Product tiles

KLEIN's seed products don't have photos, and broken images look terrible, so
each product shows its **category emoji on a coloured gradient** instead
(👕 violet for clothes, 💄 fuchsia for cosmetics, etc.). The gradient classes
live in `index.css` as `.tile-clothes`, `.tile-shoes`, … If a real
`image_url` ever comes from the database, the card renders the photo instead —
the emoji is just the fallback. Same component, both cases.

## Multi-language support

A dropdown in the navbar switches between English, French and Kinyarwanda.
It's built on i18next + react-i18next:

- `src/locales/{en,fr,rw}.json` hold every visible string, organised by page
  (`nav.*`, `cart.*`, `status.*`…).
- The chosen language is saved to localStorage and restored on reload; a new
  visitor gets detected from the browser language.
- Numbers and dates are formatted with `Intl`, so switching language also
  switches `24 Oct 2025` → `24 oct. 2025`.
- The `lang` attribute on `<html>` is kept in sync, which matters for screen
  readers.

Adding a fourth language would literally mean dropping in one more JSON file.

## Responsiveness

Mobile-first habits throughout: grids go `grid-cols-2 → sm:3 → lg:4`, the
sidebar stacks above the results on small screens, the navbar collapses to a
hamburger, and the cart switches from a two-column layout to a single column.
No horizontal scrolling anywhere at 360px width.

## Component structure

Kept deliberately boring — pages in `pages/`, reusable pieces in `components/`:

```
components/
├── Navbar.jsx            sticky header, cart badge, language, auth menu
├── Footer.jsx
├── LanguageSwitcher.jsx  the EN/FR/RW dropdown
├── ProductCard.jsx       grid tile: emoji/photo, price, quick add-to-cart
├── StatusTimeline.jsx    order status stepper (+ StatusBadge export)
├── ProtectedRoute.jsx    redirects to /login when logged out
└── Spinner.jsx           loading state

context/
├── AuthProvider.jsx      login/register/logout, session restore
├── authContext.js        the context itself + useAuth()
├── CartProvider.jsx      add/update/remove, totals, localStorage
└── cartContext.js        the context itself + useCart()
```

State handling: auth and cart are contexts (they're needed in many places and
must survive navigation); everything else is local page state fetched with
hooks — `useState` for data, `useEffect` for fetching, `useCallback` where a
function goes into a dependency array, `useRef` for the polling timer, and
`useMemo` for the cart totals. No Redux, no data-fetching library — the
assignment calls for hooks and this is the right size for them.
