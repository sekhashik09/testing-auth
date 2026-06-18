# User Management REST API

Node.js + Express + MongoDB REST API using **ES Modules** (`"type": "module"`).

---

## Features

- JWT Authentication (signup / login)
- Password hashing with bcrypt
- Get / Update / Delete own profile
- Admin: list, view, update, hard-delete any user
- Soft-delete (deactivate) for regular users
- Pagination & filtering for admin list
- Global error handler (Mongoose & JWT errors)

---

## Project Structure

```
user-api/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js  # signup, login, getMe
│   │   └── userController.js  # CRUD operations
│   ├── middleware/
│   │   ├── auth.js            # protect & adminOnly
│   │   └── errorHandler.js    # global error handler
│   ├── models/
│   │   └── User.js            # Mongoose schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── jwt.js             # generate & verify tokens
│   │   └── response.js        # sendSuccess / sendError helpers
│   ├── app.js                 # Express setup
│   └── server.js              # Entry point
├── .env.example
└── package.json
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# 3. Start (development)
npm run dev

# 4. Start (production)
npm start
```

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint          | Auth | Description       |
|--------|-------------------|------|-------------------|
| POST   | `/signup`         | ❌   | Register new user |
| POST   | `/login`          | ❌   | Login             |
| GET    | `/me`             | ✅   | Get current user  |

#### Signup body
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "password": "secret123",
  "phone": "+91 9876543210",
  "address": {
    "street": "12 Park St",
    "city": "Kolkata",
    "state": "West Bengal",
    "zip": "700001",
    "country": "India"
  }
}
```

#### Login body
```json
{ "email": "alice@example.com", "password": "secret123" }
```

---

### Users — `/api/users`

#### Self-service (any authenticated user)

| Method | Endpoint           | Description              |
|--------|--------------------|--------------------------|
| GET    | `/me`              | Get own profile          |
| PUT    | `/me`              | Update name/phone/address/avatar |
| PUT    | `/me/password`     | Change password          |
| DELETE | `/me`              | Deactivate own account   |

##### Update profile body (all fields optional)
```json
{
  "name": "Alice Updated",
  "phone": "+91 9000000000",
  "address": { "city": "Mumbai" },
  "avatar": "https://example.com/avatar.jpg"
}
```

##### Change password body
```json
{ "currentPassword": "secret123", "newPassword": "newSecret456" }
```

---

#### Admin only (role = "admin")

| Method | Endpoint    | Description                        |
|--------|-------------|------------------------------------|
| GET    | `/`         | List all users (paginated)         |
| GET    | `/:id`      | Get user by ID                     |
| PUT    | `/:id`      | Update any user (incl. role/status)|
| DELETE | `/:id`      | Hard-delete user                   |

##### Admin list query params
```
GET /api/users?page=1&limit=10&role=user&isActive=true
```

---

## Authentication

Add the JWT token to every protected request:

```
Authorization: Bearer <your_token>
```

---

## Response Format

```json
// Success
{ "success": true, "message": "...", "data": { ... } }

// Error
{ "success": false, "message": "...", "errors": [...] }
```
