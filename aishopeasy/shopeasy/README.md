# ShopEasy — Simple Full Stack E-Commerce (Student Project)

A beginner-friendly MERN-style app to teach:

- React frontend (pages, forms, routing)
- Express backend (routes, controllers)
- MongoDB with Mongoose
- JWT login / protected routes

---

## Project Structure

```
capstone_project/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/authMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── seed.js
│   └── server.js
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── services/api.js
        └── css/
```

---

## What Students Learn

| Topic | Where |
|--------|--------|
| Register / Login | `authController.js`, Login & Register pages |
| JWT token | login response → `localStorage` → axios interceptor |
| Protected pages | `ProtectedRoute.jsx` + `authMiddleware.js` |
| CRUD products | `productController.js` + Home / Add / Details pages |
| API calls | `frontend/src/services/api.js` |

---

## Setup

### 1. Install MongoDB

Make sure MongoDB is running on your computer (`mongodb://localhost:27017`).

### 2. Backend

```bash
cd backend
npm install
npm run seed    # add sample products
npm run dev     # start server on port 5000
```

### 3. Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev     # open the URL Vite prints (usually http://localhost:5173)
```

---

## How to Use the App

1. Open the frontend URL
2. **Register** a new account
3. **Login** (token is saved in browser)
4. See products on **Home**
5. Click **View Details** or **Add Product**
6. **Logout** clears the token

---

## API Endpoints

### Auth
- `POST /api/auth/register` — create user
- `POST /api/auth/login` — get JWT token
- `GET /api/auth/profile` — needs token

### Products (all need token)
- `GET /api/products` — list all
- `GET /api/products/:id` — one product
- `POST /api/products` — create
- `PUT /api/products/:id` — update
- `DELETE /api/products/:id` — delete

Send token like this:

```
Authorization: Bearer <your-token>
```

---

## Teaching Tips

1. Start with backend only — test APIs in Postman / Thunder Client
2. Then build Register → Login → save token
3. Then show Home fetching products with the token
4. Finally add Product Details and Add Product forms

Keep code simple. Prefer clear steps over advanced patterns.
