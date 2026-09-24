# Challenges Faced and Solutions

An honest list of what actually went wrong, roughly in the order it cost me
time.

## 1. MySQL kept dying between commands

**What happened.** XAMPP's MySQL on this machine isn't registered as a Windows
service, so it wasn't running at all to begin with. I started it once and it
*looked* fine — port 3306 was listening, and then moments later the next
command got `ECONNRESET` and nothing was listening anymore. The log said
`Could not open required defaults file: C:\xampp\mysql\my.ini`, which was
confusing because it *had* started once.

Two separate problems hiding behind one symptom. The defaults file actually
lives at `C:\xampp\mysql\bin\my.ini`, not where mysqld first looked, and a
process launched with `nohup … &` from a bash session on Windows gets torn
down when that session exits — nohup doesn't protect it the way it does on
Linux.

**Solution.** Launch mysqld detached through PowerShell's `Start-Process`, and
pass `--defaults-file` pointing at the real `bin/my.ini`. It's been up ever
since. Worth noting for anyone reproducing this: if your MySQL *is* a proper
service, none of this applies — you just start it normally.

## 2. Two identical React contexts (the app wouldn't render at all)

**What happened.** After splitting the context hooks out into their own file,
loading the page gave a completely blank screen. The browser console had the
clue:

```
Uncaught TypeError: Cannot destructure property 'user' of 'useAuth(...)' as it is null.
```

`useAuth()` returns `useContext(AuthContext)` — returning null means "no
provider above me", except there obviously *was* a provider.

**Cause.** The folder ended up with two files differing only by case:

```
AuthContext.jsx   ← the provider
authContext.js    ← the context + hook
```

Windows filesystems are case-insensitive, so when a component imported
`'../context/AuthContext'` (no extension), the resolver matched
`authContext.js` — under a *different URL* than the `'./authContext'` import
used inside the provider file. The browser treats URLs as case-sensitive, so
both files got loaded twice, `createContext()` ran twice, and the provider was
handing its value to context instance #1 while components listened on instance
#2. Every consumer saw `null`.

The nastiest part: `npm run build` succeeded the whole time, because the
production bundler canonicalised the paths. Only the dev server hit it — which
is exactly why the browser check earned its place in the test plan.

**Solution.** Renamed the provider files so nothing differs only by case
(`AuthProvider.jsx`, `CartProvider.jsx`) and pointed every consumer at the
exact lowercase module (`'../context/authContext'`). Verified with a headless
Chrome load afterwards: full DOM, clean console.

## 3. My own tests failed — and the app was right

First run of the API suite: 26/28. Two "failures":

- search `bag` — I'd asserted ≥ 4 results, API returned 3. All 3 were
  legitimate matches; the 4th product is a "Canvas Backpack", which doesn't
  contain the substring "bag" anywhere.
- category `cosmetics` — I'd asserted 6 products; the seed data has 4.

And on the next run, the stock test failed because I'd hardcoded
`24 → 22` while the API had correctly reduced the stock on run one — so run
two saw `20`.

**Lesson I'm keeping:** a failing test is a claim, not a verdict. Check which
side is wrong before touching code. All three were fixed on the test side —
the search assertion now checks the substring the way the SQL does, the
category count matches the seed, and stock is measured before and after each
run instead of assumed.

## 4. React's "setState in effect" warnings

The lint rule flagged `setLoading(true)` sitting synchronously inside
`useEffect` on both data pages — the classic pattern everyone copies, and
technically a double render plus a chance for stale responses to overwrite
fresh ones.

**Solution.** Instead of a loading boolean, results are stored tagged with a
key describing the query they answer (a JSON string of the current URL
params). Loading is then *derived*: tag ≠ current params means we're loading.
Same for the product detail page, where the loaded `id` is compared against
the one in the URL. This kills the warning, removes the redundant render, and
fixed a real latent bug — a slow old request can no longer clobber a fast new
one, because its response won't match the current key.

## 5. Making order tracking feel "real-time"

The naive version — refetch on a timer — leaked intervals: navigating away
left timers running in the background, and the effect wanted `fetchOrder` in
its dependency array, which rebuilt the interval on every render.

**Solution.** `fetchOrder` wrapped in `useCallback` keyed on the order id, the
interval created in `useEffect` with proper cleanup, and a `useRef` for the
timer handle. Result: one poll every 5 seconds while you're on the page,
cancelled the moment you leave. A visible "updated at" pulse makes the
liveness obvious during the demo.

## 6. Small things worth remembering

- **Re-runnable schema.** The first schema run choked on a half-created
  database from an earlier failed attempt (`ECONNRESET` mid-setup). The script
  now does `DROP DATABASE IF EXISTS klein_ecommerce` first — fine for a dev
  seed, and clearly commented so nobody runs it against something important.
- **Client-side prices are a lie.** Checkout totals are computed by the server
  from database prices; the client only ever sends `{ productId, quantity }`.
  Anything else is a security hole waiting for someone with devtools open.
- **Emoji product tiles.** Real product photos weren't available, and broken
  image icons would have wrecked the "clean UI" criterion. Gradient tiles with
  the category emoji look intentional, need zero assets, and gracefully
  upgrade to photos the moment `image_url` has a value.
- **Detached processes on Windows.** `timeout`, `nohup`, and background `&`
  all behave a little differently than on Linux; what survived turned out to
  be `(node server.js > log 2>&1 &)` and PowerShell `Start-Process`. Spawning
  a server and *then* checking it in a separate command is the reliable
  pattern here.
