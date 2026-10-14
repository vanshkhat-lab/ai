# ShopEasy frontend

ShopEasy is a React storefront for the Express/MongoDB API in `../backend`. It
supports account registration and login, browsing and filtering products,
adding products, cart management, checkout, and order history.

## Run locally

1. Start the backend from `../backend` with `npm run dev`.
2. Start the frontend from this directory with `npm run dev`.
3. Open the URL printed by Vite and register an account to use the store.

The frontend calls `http://localhost:5000/api` by default. To use another API
origin, create a `.env` file in this directory and set:

```env
VITE_API_URL=https://your-api-host.example/api
```

Product listing and product creation use the authenticated `/api/products`
routes. The backend seed script can populate its sample catalog with
`npm run seed` from the backend directory.

Seeded catalog photos are stored locally under `public/product-photos`, so the
storefront does not need to fetch them from an external image host. The
photographs are sourced from [Unsplash](https://unsplash.com/license) and
[Pexels](https://www.pexels.com/license/).

## Admin product management

New registrations are regular users. To grant admin access, first register the
account, then run this from `../backend`:

```sh
npm run make-admin -- admin@example.com
```

The command updates only that existing account. The user must sign out and back
in to receive an admin token. Admins can add, edit, and delete products; the
backend also enforces this role, so regular users cannot manage products by
calling the API directly.

## Production checks

```sh
npm run lint
npm run build
```
