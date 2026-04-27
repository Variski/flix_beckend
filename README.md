# 🎬 FLIX API — Backend

> Backend production-ready untuk platform komunitas rekomendasi film **FLIX**, dibangun dengan Node.js + Express + PostgreSQL + Prisma ORM.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-v4-blue)](https://expressjs.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-blue)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-v7-purple)](https://prisma.io)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## 📋 Daftar Isi
- [Fitur](#-fitur)
- [Tech Stack](#-tech-stack)
- [Cara Menjalankan (Step by Step)](#-cara-menjalankan-step-by-step)
- [Akun Default (Dummy)](#-akun-default-dummy)
- [API Documentation](#-api-documentation)
- [Struktur Folder](#-struktur-folder)
- [Endpoint Lengkap](#-endpoint-lengkap)

---

## ✨ Fitur

| Fitur | Keterangan |
|---|---|
| 🔐 **Auth & Role** | JWT Register/Login + Role: `user`, `moderator`, `admin` |
| 🎬 **Film CRUD** | Filter genre, mood, tahun, dan pencarian judul |
| ⭐ **Rating** | Beri rating 1-10 per film (upsert) |
| 📝 **Review** | Tulis review film (1 review per user per film) |
| 💬 **Diskusi** | Forum diskusi per film dengan view counter dan tagging |
| 🔗 **Nested Reply** | Komentar bertingkat (seperti Reddit/YouTube) |
| ❤️ **Likes** | Toggle like untuk diskusi dan reply |
| 📋 **Watchlist Kolaboratif** | Buat daftar tonton, share kode, undang teman |
| 🔔 **Notifikasi** | Notifikasi otomatis untuk like, follow, reply |
| 🚨 **Sistem Laporan** | Moderasi konten oleh moderator/admin |
| 👥 **Follow** | Social follow antar user |
| ✉️ **Private Messaging** | Kirim pesan pribadi, request pesan, dan kirim file/attachment |
| 📖 **Swagger UI** | Dokumentasi interaktif untuk semua endpoint |

---

## 🛠 Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL v14+
- **ORM**: Prisma v7 (dengan `@prisma/adapter-pg`)
- **Auth**: JSON Web Token (JWT) + bcryptjs
- **Validation**: Zod
- **Documentation**: Swagger UI (swagger-jsdoc + swagger-ui-express)
- **Security**: Helmet, CORS, express-rate-limit

---

## 🚀 Cara Menjalankan (Step by Step)

### ✅ Prerequisites (Pastikan Sudah Terinstall)

| Tool | Versi | Download |
|---|---|---|
| Node.js | v18 atau lebih baru | [nodejs.org](https://nodejs.org) |
| PostgreSQL | v14 atau lebih baru | [postgresql.org](https://postgresql.org) |
| Git | Terbaru | [git-scm.com](https://git-scm.com) |

---

### Step 1 — Clone Project

Buka terminal/CMD, lalu jalankan:

```bash
git clone https://github.com/YOUR_USERNAME/flix-api.git
cd flix-api
```

---

### Step 2 — Install Packages

```bash
npm install
```

Tunggu hingga semua dependensi terunduh. Anda akan melihat:
```
added 241 packages, and audited 241 packages in 15s
```

---

### Step 3 — Setup Environment Variables

Salin file template ke file `.env`:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Mac / Linux
cp .env.example .env
```

Buka file `.env` dan sesuaikan dengan konfigurasi komputer Anda:

```env
# Ganti PASSWORD dengan password PostgreSQL Anda
# Ganti PORT sesuai dengan port PostgreSQL Anda (default: 5432)
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/flix_db?schema=public"

# Ganti dengan string rahasia yang unik
JWT_SECRET="flix_super_secret_key_ganti_ini_di_production"
JWT_EXPIRES_IN="7d"

PORT=3000
NODE_ENV=development
```

> [!NOTE]
> Jika PostgreSQL Anda berjalan di **port selain 5432**, ubah angka portnya.
> Cek port PostgreSQL Anda dengan perintah: `netstat -ano | findstr ":54"`

---

### Step 4 — Buat Database

Buka terminal baru dan jalankan perintah PostgreSQL:

```bash
# Windows (PowerShell) — ganti PASSWORD dengan password Anda
$env:PGPASSWORD="PASSWORD"; psql -U postgres -p 5432 -c "CREATE DATABASE flix_db;"

# Mac / Linux
psql -U postgres -c "CREATE DATABASE flix_db;"
```

Output yang diharapkan:
```
CREATE DATABASE
```

---

### Step 5 — Jalankan Migrasi Database (Prisma Push)

Perintah ini akan membuat semua tabel secara otomatis sesuai dengan schema:

```bash
npx prisma db push
```

Output yang diharapkan:
```
✔ Generated Prisma Client (v7.x.x)
Your database is now in sync with your Prisma schema. Done in 292ms
```

---

### Step 6 — Isi Data Awal (Seed)

Perintah ini akan membuat data genre, mood, dan akun admin secara otomatis:

```bash
node prisma/seed.js
```

Output yang diharapkan:
```
🌱 Seeding genres...
🌱 Seeding moods...
🌱 Seeding admin user...
✅ Seed selesai!

📋 Admin Account:
   Email    : admin@flix.com
   Password : admin123
```

---

### Step 7 — Jalankan Server

```bash
npm run dev
```

Output yang diharapkan:
```
🎬 FLIX API running on http://localhost:3000
📡 Environment: development
```

**Server Anda sudah berjalan!** 🎉

---

### Step 8 — Verifikasi (Cek API)

Buka browser dan akses salah satu URL berikut:

| URL | Keterangan |
|---|---|
| `http://localhost:3000` | Auto-redirect ke dokumentasi |
| `http://localhost:3000/api/docs` | 📖 Swagger UI (Dokumentasi Interaktif) |
| `http://localhost:3000/api/health` | ❤️ Health Check |

---

## 👤 Akun Default (Dummy)

Setelah menjalankan perintah `node prisma/seed.js`, akun berikut sudah tersedia di database:

### 👑 Admin Account
| Field | Value |
|---|---|
| **Email** | `admin@flix.com` |
| **Password** | `admin123` |
| **Role** | `admin` |
| **Akses** | Semua fitur + kelola user, ban, ganti role, tambah/hapus film |

### 🔑 Cara Login via Swagger
1. Buka `http://localhost:3000/api/docs`
2. Cari bagian **Auth** → Klik `POST /api/auth/login`
3. Klik **Try it out**
4. Isi email dan password admin di atas
5. Klik **Execute** → Copy nilai `token` dari response
6. Klik tombol **Authorize 🔒** di atas → Paste token → Klik **Authorize**

### 🔑 Cara Login via Postman
1. Method: `POST`
2. URL: `http://localhost:3000/api/auth/login`
3. Body (raw JSON):
```json
{
  "email": "admin@flix.com",
  "password": "admin123"
}
```
4. Copy nilai `token` dari response
5. Di request berikutnya, tab **Authorization** → Type: **Bearer Token** → Paste token

---

## 📖 API Documentation

Dokumentasi interaktif tersedia di:

```
http://localhost:3000/api/docs
```

Tampilan Swagger UI memungkinkan Anda untuk:
- Melihat semua endpoint yang tersedia
- Mencoba request langsung dari browser
- Melihat skema request/response

---

## 📁 Struktur Folder

```
flix-api/
├── prisma/
│   ├── schema.prisma      # Schema & relasi database (16 model)
│   └── seed.js            # Data awal (genre, mood, admin)
├── src/
│   ├── app.js             # Setup Express, middleware, routes
│   ├── config/
│   │   ├── prisma.js      # Koneksi Prisma + pg adapter
│   │   └── swagger.js     # Konfigurasi OpenAPI/Swagger
│   ├── middleware/
│   │   ├── auth.js        # Verifikasi JWT Token
│   │   ├── authorize.js   # Cek Role (user/moderator/admin)
│   │   ├── validate.js    # Validasi body request (Zod)
│   │   └── errorHandler.js # Global error handler
│   ├── controllers/       # Terima request, kirim response
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
│   │   ├── message.controller.js
│   │   └── user.controller.js
│   ├── services/          # Business logic & query database
│   │   └── (sama seperti controllers)
│   └── routes/            # Definisi URL & method HTTP
│       ├── index.js
│       └── (auth, film, rating, review, dll).routes.js
├── .env.example           # Template environment variables
├── .gitignore
├── package.json
├── prisma.config.ts       # Konfigurasi Prisma v7
└── server.js              # Entry point aplikasi
```

---

## 🔗 Endpoint Lengkap

### Auth
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Daftar akun baru |
| `POST` | `/api/auth/login` | Public | Login & dapat JWT |
| `GET` | `/api/auth/me` | 🔐 User | Lihat profil sendiri |

### Films
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/films` | Public | List film + filter + pagination |
| `GET` | `/api/films/genres` | Public | Semua genre |
| `GET` | `/api/films/moods` | Public | Semua mood (dengan emoji) |
| `GET` | `/api/films/:id` | Public | Detail film |
| `POST` | `/api/films` | 🔐 Admin | Tambah film baru |
| `PUT` | `/api/films/:id` | 🔐 Admin | Edit film |
| `DELETE` | `/api/films/:id` | 🔐 Admin | Hapus film |

### Ratings & Reviews
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/films/:filmId/ratings` | Public | Semua rating + rata-rata |
| `POST` | `/api/films/:filmId/ratings` | 🔐 User | Beri/ubah rating (1-10) |
| `DELETE` | `/api/films/:filmId/ratings` | 🔐 User | Hapus rating |
| `GET` | `/api/films/:filmId/reviews` | Public | Semua review |
| `POST` | `/api/films/:filmId/reviews` | 🔐 User | Tulis review |
| `PUT` | `/api/reviews/:id` | 🔐 Penulis | Edit review |
| `DELETE` | `/api/reviews/:id` | 🔐 Penulis/Mod/Admin | Hapus review |

### Discussions & Replies
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `GET` | `/api/films/:filmId/discussions` | Public | List diskusi film |
| `POST` | `/api/films/:filmId/discussions` | 🔐 User | Buat diskusi |
| `GET` | `/api/discussions/:id` | Public | Detail diskusi (view++) |
| `PUT` | `/api/discussions/:id` | 🔐 Penulis | Edit diskusi |
| `DELETE` | `/api/discussions/:id` | 🔐 Penulis/Mod/Admin | Hapus diskusi |
| `GET` | `/api/discussions/:id/replies` | Public | Semua reply (nested) |
| `POST` | `/api/discussions/:id/replies` | 🔐 User | Balas diskusi |
| `PUT` | `/api/replies/:id` | 🔐 Penulis | Edit reply |
| `DELETE` | `/api/replies/:id` | 🔐 Penulis/Mod/Admin | Hapus reply |

### Private Messaging
| Method | Endpoint | Akses | Keterangan |
|---|---|---|---|
| `POST` | `/api/messages/requests` | 🔐 User | Kirim message request / auto-buat conversation jika mutual |
| `GET` | `/api/messages/requests` | 🔐 User | List message request masuk (status pending) |
| `PATCH` | `/api/messages/requests/:requestId` | 🔐 User | Terima (accept) atau tolak (reject) request |
| `GET` | `/api/messages/conversations` | 🔐 User | Inbox: semua percakapan pengguna |
| `POST` | `/api/messages/conversations` | 🔐 User | Buat percakapan baru |
| `GET` | `/api/messages/:conversationId` | 🔐 Member | Get pesan dalam conversation (pagination) |
| `POST` | `/api/messages/:conversationId` | 🔐 Member | Kirim pesan baru (teks/attachment) |
| `PATCH` | `/api/messages/:conversationId/read`| 🔐 Member | Tandai semua pesan partner sudah dibaca |
| `DELETE`| `/api/messages/:messageId` | 🔐 Sender | Hapus pesan (soft delete) |

### Likes, Watchlist, Notifications, Reports, Follow, Users
> Lihat dokumentasi lengkap di `http://localhost:3000/api/docs`

---

## 🔧 Commands Berguna

```bash
# Jalankan development server (auto-restart saat file berubah)
npm run dev

# Jalankan production server
npm start

# Update schema database
npx prisma db push

# Buka GUI database visual
npx prisma studio

# Isi data awal
node prisma/seed.js

# Generate Prisma Client
npx prisma generate
```

---

## 🔐 Keamanan

- Semua password dienkripsi menggunakan **bcryptjs** (salt 12 rounds)
- JWT token expires dalam **7 hari**
- Rate limiting: **100 request per 15 menit** per IP
- Header keamanan otomatis via **Helmet.js**
- File `.env` tidak pernah masuk ke repository (sudah di `.gitignore`)

---

## 📝 Lisensi

MIT License — bebas digunakan untuk keperluan akademik dan komersial.

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk FLIX — Platform Komunitas Rekomendasi Film</p>
</div>
