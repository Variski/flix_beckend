# FLIX Backend — Implementation Plan

Backend production-ready untuk aplikasi rekomendasi film **FLIX**, dibangun di atas Node.js + Express.js + PostgreSQL + Prisma ORM + JWT.

---

## Stack & Dependensi

| Package | Kegunaan |
|---|---|
| `express` | HTTP framework |
| `@prisma/client` + `prisma` | ORM & migrations |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `zod` | Request validation |
| `cors` | CORS middleware |
| `helmet` | Security headers |
| `morgan` | HTTP request logging |
| `express-rate-limit` | Rate limiting |
| `dotenv` | Environment variables |
| `nanoid` / `crypto` | Generate share code watchlist |

---

## Struktur Folder

```
final_project/
├── prisma/
│   └── schema.prisma          # Prisma schema (konversi dari SQL)
│
├── src/
│   ├── config/
│   │   └── prisma.js          # Prisma client singleton
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT verify + req.user
│   │   ├── authorize.js       # Role-based access (user/mod/admin)
│   │   ├── validate.js        # Zod validation wrapper
│   │   └── errorHandler.js    # Global error handler
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── film.controller.js
│   │   ├── rating.controller.js
│   │   ├── review.controller.js
│   │   ├── discussion.controller.js
│   │   ├── reply.controller.js
│   │   ├── like.controller.js
│   │   ├── watchlist.controller.js
│   │   ├── notification.controller.js
│   │   ├── report.controller.js
│   │   ├── follow.controller.js
│   │   └── user.controller.js
│   │
│   ├── routes/
│   │   ├── index.js           # Router aggregator
│   │   ├── auth.routes.js
│   │   ├── film.routes.js
│   │   ├── rating.routes.js
│   │   ├── review.routes.js
│   │   ├── discussion.routes.js
│   │   ├── reply.routes.js
│   │   ├── like.routes.js
│   │   ├── watchlist.routes.js
│   │   ├── notification.routes.js
│   │   ├── report.routes.js
│   │   ├── follow.routes.js
│   │   └── user.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── film.service.js
│   │   ├── rating.service.js
│   │   ├── review.service.js
│   │   ├── discussion.service.js
│   │   ├── reply.service.js
│   │   ├── like.service.js
│   │   ├── watchlist.service.js
│   │   ├── notification.service.js
│   │   ├── report.service.js
│   │   ├── follow.service.js
│   │   └── user.service.js
│   │
│   └── app.js                 # Express app setup
│
├── .env.example
├── package.json
└── server.js                  # Entry point
```

---

## Proposed Changes

### 1. Prisma Schema

#### [NEW] `prisma/schema.prisma`
Konversi lengkap dari SQL schema ke Prisma:
- Semua 16 tabel + relasi + enum
- Menggunakan `@db.Uuid`, `@default(dbgenerated("gen_random_uuid()"))`, `@default(now())`
- Polymorphic fields (`target_type`, `target_id`) menggunakan `String` karena Prisma tidak support native polymorphic relations

---

### 2. Core Config & Middleware

#### [NEW] `src/config/prisma.js`
Singleton Prisma Client dengan disconnect handler.

#### [NEW] `src/middleware/auth.js`
Verifikasi JWT dari `Authorization: Bearer <token>` header. Inject `req.user`.

#### [NEW] `src/middleware/authorize.js`
Factory function `authorize(...roles)` — cek `req.user.role`.

#### [NEW] `src/middleware/validate.js`
Wrapper Zod untuk validasi `body`, `query`, `params`.

#### [NEW] `src/middleware/errorHandler.js`
Global error handler: Prisma errors, JWT errors, Zod errors, generic 500.

---

### 3. Auth

#### [NEW] `src/controllers/auth.controller.js` + service + routes
| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |

---

### 4. Films

#### [NEW] `src/controllers/film.controller.js` + service + routes
| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/films` | Public (filter: genre, mood, year, search) |
| GET | `/api/films/:id` | Public |
| GET | `/api/films/mood/:moodId` | Public |
| POST | `/api/films` | Admin |
| PUT | `/api/films/:id` | Admin |
| DELETE | `/api/films/:id` | Admin |

---

### 5. Ratings & Reviews

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/films/:filmId/ratings` | User |
| PUT | `/api/films/:filmId/ratings` | User (update own) |
| DELETE | `/api/films/:filmId/ratings` | User (delete own) |
| GET | `/api/films/:filmId/reviews` | Public |
| POST | `/api/films/:filmId/reviews` | User |
| PUT | `/api/reviews/:id` | User (own) |
| DELETE | `/api/reviews/:id` | User (own) / Mod / Admin |

---

### 6. Discussions & Replies

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/films/:filmId/discussions` | Public |
| POST | `/api/films/:filmId/discussions` | User |
| GET | `/api/discussions/:id` | Public (increment views) |
| PUT | `/api/discussions/:id` | User (own) |
| DELETE | `/api/discussions/:id` | User (own) / Mod / Admin |
| GET | `/api/discussions/:id/replies` | Public (nested) |
| POST | `/api/discussions/:id/replies` | User |
| PUT | `/api/replies/:id` | User (own) |
| DELETE | `/api/replies/:id` | User (own) / Mod / Admin |

---

### 7. Likes (Polymorphic)

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/likes` | User |
| DELETE | `/api/likes` | User |

Body: `{ target_type: "discussion" | "reply", target_id: uuid }`

---

### 8. Watchlist (Collaborative)

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/watchlists` | User (own + member) |
| POST | `/api/watchlists` | User |
| GET | `/api/watchlists/:id` | User (owner/member) |
| PUT | `/api/watchlists/:id` | Owner |
| DELETE | `/api/watchlists/:id` | Owner |
| POST | `/api/watchlists/:id/items` | Owner/Editor |
| DELETE | `/api/watchlists/:id/items/:filmId` | Owner/Editor |
| PATCH | `/api/watchlists/:id/items/:filmId/watch` | Owner/Editor |
| POST | `/api/watchlists/join/:shareCode` | User |
| POST | `/api/watchlists/:id/members` | Owner |
| DELETE | `/api/watchlists/:id/members/:userId` | Owner |

---

### 9. Notifications

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/notifications` | User |
| PATCH | `/api/notifications/:id/read` | User |
| PATCH | `/api/notifications/read-all` | User |
| DELETE | `/api/notifications/:id` | User |

---

### 10. Reports (Moderasi)

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/reports` | User |
| GET | `/api/reports` | Mod / Admin |
| PATCH | `/api/reports/:id` | Mod / Admin |

---

### 11. Follow (Social)

| Method | Endpoint | Akses |
|---|---|---|
| POST | `/api/follow/:userId` | User |
| DELETE | `/api/follow/:userId` | User |
| GET | `/api/users/:userId/followers` | Public |
| GET | `/api/users/:userId/following` | Public |

---

### 12. Users

| Method | Endpoint | Akses |
|---|---|---|
| GET | `/api/users/:id` | Public |
| PUT | `/api/users/me` | User (own profile) |
| DELETE | `/api/users/:id` | Admin |
| PATCH | `/api/users/:id/ban` | Admin |
| PATCH | `/api/users/:id/role` | Admin |

---

## Verification Plan

### Automated
- Jalankan `npx prisma validate` untuk validasi schema
- Jalankan `npx prisma db push` ke database test

### Manual
- Test endpoint dengan Thunder Client / Postman:
  1. Register → Login → dapatkan JWT
  2. CRUD film (sebagai admin)
  3. Rate & review film
  4. Buat discussion, reply, dan like
  5. Buat watchlist kolaboratif + join via share code
  6. Submit report → resolve sebagai moderator
  7. Follow user → cek notifikasi

> [!IMPORTANT]
> Anda perlu menyediakan PostgreSQL database lokal dan mengisi `.env` dengan `DATABASE_URL` sebelum menjalankan `prisma db push`.

> [!NOTE]
> Karena Prisma tidak mendukung polymorphic relations native, tabel `likes` dan `reports` menggunakan `String` untuk `target_type` dan `target_id` (UUID as String). Validasi dilakukan di layer service.
