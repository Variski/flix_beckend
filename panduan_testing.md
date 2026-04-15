# 🎬 FLIX Backend — Panduan Lengkap dari Awal sampai Testing

Panduan ini menjelaskan **cara memahami, menjalankan, dan melakukan testing** seluruh backend FLIX step by step.

---

## 📚 BAGIAN 1 — Pahami Struktur Project

### Alur Request (Bagaimana kode bekerja)

```
Client (browser/Postman/Swagger)
        │
        ▼
    server.js          ← Entry point, start server
        │
        ▼
    src/app.js         ← Setup middleware (cors, helmet, dll)
        │
        ▼
    src/routes/        ← Tentukan endpoint URL + method
        │
        ▼
    src/middleware/    ← Cek JWT token, cek role, validasi
        │
        ▼
    src/controllers/   ← Terima request, kirim response
        │
        ▼
    src/services/      ← Logic bisnis (query database, dll)
        │
        ▼
    prisma client      ← Komunikasi ke PostgreSQL
        │
        ▼
    Database (flix_db) ← Data tersimpan
```

### Penjelasan tiap folder:

| Folder/File | Fungsi |
|---|---|
| `server.js` | Entry point — load `.env` dan start server Express |
| `src/app.js` | Setup semua middleware dan mount routes |
| `src/config/prisma.js` | Koneksi ke PostgreSQL via Prisma |
| `src/middleware/auth.js` | Verifikasi JWT token dari header Authorization |
| `src/middleware/authorize.js` | Cek role user (user/moderator/admin) |
| `src/middleware/errorHandler.js` | Tangkap semua error dan kembalikan response yang rapi |
| `src/routes/` | Definisikan URL endpoint dan method (GET/POST/dll) |
| `src/controllers/` | Terima req, panggil service, kirim res |
| `src/services/` | Logic bisnis: query database, kirim notifikasi, dll |
| `prisma/schema.prisma` | Definisi semua tabel dan relasi database |

---

## 🚀 BAGIAN 2 — Cara Menjalankan Project dari Awal

### Step 1: Pastikan prerequisites ada

```bash
node -v      # Harus v18+
psql --version  # PostgreSQL harus ada
```

### Step 2: Start PostgreSQL dan pastikan flix_db ada

PostgreSQL di komputer ini berjalan di **port 5433**.

```bash
# Cek apakah database sudah ada
$env:PGPASSWORD="123456"; psql -U postgres -p 5433 -c "\l"
```

### Step 3: Jalankan server

```bash
cd C:\Users\varis\Documents\Stupen\final_project
npm run dev
```

Output yang benar:
```
🎬 FLIX API running on http://localhost:3000
📡 Environment: development
```

### Step 4: Isi data awal (sekali saja)

```bash
node prisma/seed.js
```

Output:
```
✅ Seed selesai!
   Admin: admin@flix.com / admin123
```

---

## 🧪 BAGIAN 3 — Testing via Swagger UI (Cara Termudah)

### Buka Swagger
Buka browser → pergi ke: **http://localhost:3000/api/docs**

### Step 1: Login dan Dapatkan Token

1. Di Swagger, cari bagian **Auth**
2. Klik **POST /api/auth/login**
3. Klik tombol **"Try it out"**
4. Ganti isi request body menjadi:
```json
{
  "email": "admin@flix.com",
  "password": "admin123"
}
```
5. Klik **"Execute"**
6. Dari response, **copy nilai `token`**:
```json
{
  "success": true,
  "data": {
    "user": { "username": "admin", "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiI..."  ← COPY INI
  }
}
```

### Step 2: Authorize (Simpan Token)

1. Klik tombol **"Authorize 🔒"** di pojok kanan atas
2. Di field **BearerAuth (http, Bearer)**, paste token-nya
3. Klik **Authorize** → **Close**
4. Sekarang semua endpoint yang ada ikon 🔒 bisa diakses

### Step 3: Test Endpoint Satu per Satu

Gunakan urutan ini untuk testing lengkap:

---

## ✅ BAGIAN 4 — Checklist Testing Lengkap

Centang satu per satu untuk memastikan semua berfungsi.

### 🔑 Auth
- [ ] **Register user baru** → `POST /api/auth/register`
  ```json
  { "username": "budi", "email": "budi@test.com", "password": "budi1234" }
  ```
- [ ] **Login** → `POST /api/auth/login`
  ```json
  { "email": "admin@flix.com", "password": "admin123" }
  ```
- [ ] **Get profil saya** → `GET /api/auth/me` *(butuh token)*

---

### 🎬 Films
- [ ] **Get semua genre** → `GET /api/films/genres`
- [ ] **Get semua mood** → `GET /api/films/moods`
- [ ] **List film** → `GET /api/films`
- [ ] **Filter film berdasarkan genre** → `GET /api/films?genreId=1`
- [ ] **Cari film** → `GET /api/films?search=inception`
- [ ] **Detail film** → `GET /api/films/{id}` *(ganti {id} dengan UUID film)*
- [ ] **Tambah film baru** → `POST /api/films` *(admin only)*
  ```json
  {
    "title": "Interstellar",
    "director": "Christopher Nolan",
    "releaseYear": 2014,
    "imdbRating": 8.6,
    "durationMinutes": 169,
    "genreIds": [1, 6],
    "moodIds": [1, 6]
  }
  ```

---

### ⭐ Ratings
- [ ] **Get rating sebuah film** → `GET /api/films/{filmId}/ratings`
- [ ] **Beri rating** → `POST /api/films/{filmId}/ratings` *(butuh token)*
  ```json
  { "score": 9 }
  ```
- [ ] **Hapus rating** → `DELETE /api/films/{filmId}/ratings` *(butuh token)*

---

### 📝 Reviews
- [ ] **Lihat semua review film** → `GET /api/films/{filmId}/reviews`
- [ ] **Tulis review** → `POST /api/films/{filmId}/reviews` *(butuh token)*
  ```json
  { "content": "Film terbaik yang pernah saya tonton!", "isSpoiler": false }
  ```
- [ ] **Edit review** → `PUT /api/reviews/{id}` *(butuh token, hanya penulis)*
- [ ] **Hapus review** → `DELETE /api/reviews/{id}` *(penulis/mod/admin)*

---

### 💬 Discussions & Replies
- [ ] **List diskusi film** → `GET /api/films/{filmId}/discussions`
- [ ] **Buat diskusi** → `POST /api/films/{filmId}/discussions` *(butuh token)*
  ```json
  {
    "title": "Ending film ini bikin bingung",
    "body": "Menurut kalian apa artinya?",
    "category": "theory",
    "tags": ["ending", "spoiler"]
  }
  ```
- [ ] **Detail diskusi** *(view count bertambah)* → `GET /api/discussions/{id}`
- [ ] **Balas diskusi** → `POST /api/discussions/{id}/replies` *(butuh token)*
  ```json
  { "body": "Menurut saya ini adalah..." }
  ```
- [ ] **Nested reply** *(reply dari reply)* → `POST /api/discussions/{id}/replies`
  ```json
  { "body": "Saya setuju!", "parentReplyId": "{replyId}" }
  ```

---

### ❤️ Likes
- [ ] **Like discussion** → `POST /api/likes` *(toggle: like → unlike)*
  ```json
  { "targetType": "discussion", "targetId": "{discussionId}" }
  ```
- [ ] **Like reply** → `POST /api/likes`
  ```json
  { "targetType": "reply", "targetId": "{replyId}" }
  ```
- [ ] **Like lagi** untuk unlike *(response: `{ "liked": false }`)*

---

### 📋 Watchlist
- [ ] **Buat watchlist** → `POST /api/watchlists` *(butuh token)*
  ```json
  { "name": "Film Favorit", "isShared": true }
  ```
  → Catat `shareCode` dari response!
- [ ] **Tambah film ke watchlist** → `POST /api/watchlists/{id}/items`
  ```json
  { "filmId": "{filmId}" }
  ```
- [ ] **Mark as watched** → `PATCH /api/watchlists/{id}/items/{filmId}/watch`
- [ ] **Join watchlist orang lain** → `POST /api/watchlists/join/{shareCode}`
  *(login dengan akun lain, pakai shareCode dari langkah di atas)*
- [ ] **Lihat watchlist saya** → `GET /api/watchlists`

---

### 🔔 Notifications
- [ ] **Lihat notifikasi** → `GET /api/notifications` *(butuh token)*
  → Cek `unreadCount` — harus ada notif dari like & follow
- [ ] **Mark satu notif dibaca** → `PATCH /api/notifications/{id}/read`
- [ ] **Mark semua dibaca** → `PATCH /api/notifications/read-all`

---

### 🚨 Reports (Moderasi)
- [ ] **Laporkan diskusi** → `POST /api/reports` *(butuh token)*
  ```json
  {
    "targetType": "discussion",
    "targetId": "{discussionId}",
    "reason": "Konten spam"
  }
  ```
- [ ] **Lihat semua laporan** → `GET /api/reports?status=pending` *(admin/mod)*
- [ ] **Resolve laporan** → `PATCH /api/reports/{id}` *(admin/mod)*
  ```json
  { "status": "resolved" }
  ```

---

### 👥 Follow
- [ ] **Follow user** → `POST /api/follow/{userId}` *(butuh token)*
- [ ] **Lihat followers** → `GET /api/follow/{userId}/followers`
- [ ] **Lihat following** → `GET /api/follow/{userId}/following`
- [ ] **Unfollow** → `DELETE /api/follow/{userId}` *(butuh token)*

---

### 👤 User Management (Admin)
- [ ] **Lihat profil publik** → `GET /api/users/{id}`
- [ ] **Update profil sendiri** → `PUT /api/users/me` *(butuh token)*
  ```json
  { "username": "newname" }
  ```
- [ ] **List semua user** → `GET /api/users` *(admin only)*
- [ ] **Ban user** → `PATCH /api/users/{id}/ban` *(admin only)*
  ```json
  { "isBanned": true }
  ```
- [ ] **Ganti role** → `PATCH /api/users/{id}/role` *(admin only)*
  ```json
  { "role": "moderator" }
  ```

---

## 🔍 BAGIAN 5 — Cara Cari UUID di Swagger

Ketika Swagger minta `{filmId}` atau `{discussionId}`, cara mendapatkannya:

1. Panggil `GET /api/films` → copy `id` dari salah satu film di response
2. Panggil `GET /api/films/{filmId}/discussions` → copy `id` dari diskusi
3. Panggil `GET /api/discussions/{id}/replies` → copy `id` dari reply

---

## 🛠️ BAGIAN 6 — Tools Tambahan

### Prisma Studio (GUI Database Visual)
```bash
npx prisma studio
```
Buka **http://localhost:5555** → Bisa lihat dan edit data langsung di browser.

### Postman / Thunder Client (VS Code)
Alternatif selain Swagger:
1. Install **Thunder Client** extension di VS Code
2. Import collection dari URL: `http://localhost:3000/api/docs`
3. Set base URL ke `http://localhost:3000`
4. Set header `Authorization: Bearer {token}` untuk endpoint private

---

## 🎯 BAGIAN 7 — Tips & Troubleshooting

| Problem | Solusi |
|---|---|
| Server tidak mau start | Cek apakah `.env` ada dan `PORT=3000` |
| `Can't reach database` | Jalankan PostgreSQL dulu, cek port 5433 |
| Token expired | Login ulang untuk dapatkan token baru |
| Error 403 Forbidden | Endpoint butuh role lebih tinggi (misal: admin) |
| Error 409 Conflict | Data sudah ada (misal: sudah pernah review film ini) |
| Nodemon restart terus | Ada syntax error di file JS yang baru diubah |

### Reset database (jika ingin mulai dari awal):
```bash
# Warning: hapus semua data!
$env:PGPASSWORD="123456"; psql -U postgres -p 5433 -d flix_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
npx prisma db push
node prisma/seed.js
```
