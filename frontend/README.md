# AutoAdvisor Frontend (React + Vite)

    npm install
    npm run dev        # http://localhost:5173  (Vite proxies /api to http://localhost:5000)
    npm run build      # one JS chunk per lazy route in dist/assets


## Structure
components/ reusable UI · pages/ lazy routes · context/StoreContext (auth, wishlist ids, compare, catalogue) · services/api.js (fetch client with JWT) · hooks/ (useAsync, useDebounce, useFetch) · utils/ · data/options.js · styles/

## Flow
Landing (`/`) -> Explore Cars (`/explore`, customer website) · Login/Register -> customer: website, dealer: `/dealer` only, admin: `/admin` only. Role guards are client-side convenience; the API enforces roles.

## Course coverage
- React + Vite, JSX, props, component composition and reuse.
- useState, React Router v6 (BrowserRouter, Routes, NavLink, nested layouts, protected routes), controlled forms.
- API integration: `useAsync`/`useFetch` with async/await + useEffect; loading, error (with retry) and data states; dynamic lists. Public NHTSA API in Car Details plus the project's own `/api` backend.
- Full CRUD from the UI: My Tasks page (create -> view -> update -> delete) data persists in MongoDB across refresh.
- Performance: React.lazy + Suspense on every route. Run `npm run build` and compare the chunk list; DevTools > Network > Slow 4G shows the "Loading page chunk…" fallback.
