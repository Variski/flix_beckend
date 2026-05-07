# 📋 Dokumentasi Teknis Backend FLIX

> Backend REST API untuk aplikasi FLIX — platform rekomendasi & komunitas film.  
> **Stack:** Node.js · Express · Prisma ORM · PostgreSQL

---

## ✅ Status Backend

Backend **sudah selesai** secara fungsional mencakup semua fitur berikut:

| Fitur | Status |
|-------|--------|
| Autentikasi (Register / Login / JWT) | ✅ |
| Manajemen User & Profil | ✅ |
| Data Film (CRUD + Pencarian + Filter) | ✅ |
| Rating Film | ✅ |
| Review Film | ✅ |
| Diskusi & Reply (Forum) | ✅ |
| Like (Discussion, Reply, CinePost, CineComment) | ✅ |
| Watchlist (Kolaboratif, Share Code) | ✅ |
| Notifikasi | ✅ |
| Laporan Konten (Report) | ✅ |
| Follow / Unfollow User | ✅ |
| **CineThread** (Thread Film ala Twitter) | ✅ |
| **Private Messaging** (Chat, Attachment, Request) | ✅ |

---

## 📁 Struktur Folder

```
final_project/
├── prisma/
│   ├── schema.prisma        # Skema database lengkap (31 model)
│   └── seed.js              # Data awal (genre, mood)
├── src/
│   ├── app.js               # Entry point Express + middleware global
│   ├── config/
│   │   ├── prisma.js        # Instance Prisma Client (singleton)
│   │   └── swagger.js       # Konfigurasi Swagger UI
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication
│   │   ├── authorize.js     # Role-based authorization
│   │   ├── errorHandler.js  # Global error handler
│   │   └── validate.js      # Request body validator
│   ├── services/            # Business logic layer (17 file)
│   ├── controllers/         # Request handlers (17 file)
│   └── routes/              # Express routers (15 file)
├── server.js                # HTTP server start
├── .env                     # Environment variables
└── package.json
```

---

## 🗄️ Database — Skema Lengkap

### Koneksi
```
postgresql://postgres:<password>@localhost:5433/flix_db
```

---

### ENUM yang Digunakan

| Enum | Nilai |
|------|-------|
| `Role` | `user`, `moderator`, `admin` |
| `DiscussionCategory` | `general`, `theory`, `review`, `question` |
| `LikeTargetType` | `discussion`, `reply`, `cinepost`, `cinecomment` |
| `CinePostType` | `text`, `film_review`, `film_recommendation`, `poll`, `question` |
| `CineMediaType` | `image`, `gif`, `video` |
| `NotificationType` | `like_discussion`, `like_reply`, `reply_thread`, `nested_reply`, `watchlist_invite`, `new_follower`, `like_cinepost`, `comment_cinepost`, `repost_cinepost`, `quote_cinepost`, `reply_cinecomment` |
| `ReportTargetType` | `discussion`, `reply`, `user`, `cinepost`, `cinecomment` |
| `ReportStatus` | `pending`, `resolved`, `rejected` |
| `WatchlistMemberRole` | `viewer`, `editor` |
| `MessageStatus` | `sent`, `delivered`, `read` |
| `MessageContentType` | `text`, `image`, `film_tag`, `cinethread_share` |

---

### Tabel Database (31 Tabel)

#### 👤 1. `users`
Menyimpan data akun pengguna.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | Generated otomatis |
| `username` | VARCHAR(50) UNIQUE | Nama pengguna |
| `email` | VARCHAR(255) UNIQUE | Email login |
| `password_hash` | VARCHAR(255) | Bcrypt hash |
| `avatar_url` | VARCHAR(500) | URL foto profil |
| `role` | Role | Default: `user` |
| `is_banned` | BOOLEAN | Default: false |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | Auto-update |

---

#### 🎭 2. `genres`
Master data genre film.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT PK | Auto-increment |
| `name` | VARCHAR(50) UNIQUE | Nama genre |

---

#### 😊 3. `moods`
Master data mood/suasana film.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | INT PK | Auto-increment |
| `name` | VARCHAR(50) UNIQUE | Nama mood |
| `emoji` | VARCHAR(10) | Ikon emoji |
| `color_hex` | VARCHAR(7) | Warna UI (#RRGGBB) |

---

#### 🎬 4. `films`
Data film utama.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `omdb_id` | VARCHAR(20) UNIQUE | ID dari OMDB API |
| `title` | VARCHAR(255) | Judul film |
| `release_year` | SMALLINT | Tahun rilis |
| `poster_url` | VARCHAR(500) | URL poster |
| `synopsis` | TEXT | Sinopsis |
| `imdb_rating` | DECIMAL(3,1) | Rating IMDB |
| `duration_minutes` | SMALLINT | Durasi dalam menit |
| `director` | VARCHAR(255) | Nama sutradara |
| `created_at` | TIMESTAMP | |

---

#### 🔗 5. `film_genres` — Junction Table
Relasi many-to-many Film ↔ Genre.  
`PK: (film_id, genre_id)`

---

#### 🔗 6. `film_moods` — Junction Table  
Relasi many-to-many Film ↔ Mood.  
`PK: (film_id, mood_id)`

---

#### ⭐ 7. `ratings`
Rating numerik user terhadap film (1–10).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `film_id` | UUID FK → films | |
| `score` | SMALLINT | Nilai 1–10 |
| `created_at` | TIMESTAMP | |

`UNIQUE: (user_id, film_id)` — 1 user hanya bisa rating 1 film sekali.

---

#### 📝 8. `reviews`
Review teks panjang user terhadap film.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `film_id` | UUID FK → films | |
| `content` | TEXT | Isi review |
| `is_spoiler` | BOOLEAN | Flag spoiler |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

`UNIQUE: (user_id, film_id)` — 1 user hanya bisa review 1 film sekali.

---

#### 📋 9. `watchlists`
Daftar tonton pribadi atau kolaboratif.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `owner_id` | UUID FK → users | Pemilik |
| `name` | VARCHAR(100) | Nama watchlist |
| `is_shared` | BOOLEAN | Mode berbagi |
| `share_code` | VARCHAR(12) UNIQUE | Kode undangan |
| `created_at` | TIMESTAMP | |

---

#### 🎞️ 10. `watchlist_items`
Film yang ada di dalam watchlist.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `watchlist_id` | UUID FK → watchlists | |
| `film_id` | UUID FK → films | |
| `is_watched` | BOOLEAN | Sudah ditonton? |
| `added_at` | TIMESTAMP | |

`UNIQUE: (watchlist_id, film_id)`

---

#### 👥 11. `watchlist_members`
Anggota kolaboratif sebuah watchlist.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `watchlist_id` | UUID FK | |
| `user_id` | UUID FK | |
| `role` | WatchlistMemberRole | `viewer` / `editor` |
| `joined_at` | TIMESTAMP | |

`PK: (watchlist_id, user_id)`

---

#### 💬 12. `discussions`
Thread diskusi yang terikat ke sebuah film.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `film_id` | UUID FK → films | Film yang didiskusikan |
| `user_id` | UUID FK → users | Pembuat |
| `title` | VARCHAR(200) | Judul diskusi |
| `body` | TEXT | Isi diskusi |
| `category` | DiscussionCategory | `general/theory/review/question` |
| `views_count` | INT | Jumlah view |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

#### 💬 13. `discussion_replies`
Balasan dalam diskusi (nested — bisa reply ke reply).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `discussion_id` | UUID FK → discussions | |
| `user_id` | UUID FK → users | |
| `parent_reply_id` | UUID FK → self | Nullable — untuk nested |
| `body` | TEXT | Isi balasan |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

#### 🏷️ 14. `discussion_tags`
Tag/topik yang melekat pada diskusi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `discussion_id` | UUID FK | |
| `tag` | VARCHAR(50) | Teks tag bebas |

`PK: (discussion_id, tag)`

---

#### ❤️ 15. `likes`
Like polimorfik — bisa untuk discussion, reply, cinepost, atau cinecomment.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `target_type` | LikeTargetType | Jenis target |
| `target_id` | UUID | ID target |
| `created_at` | TIMESTAMP | |

`UNIQUE: (user_id, target_type, target_id)` — tidak bisa like 2x.

---

#### 🔔 16. `notifications`
Notifikasi aktivitas untuk setiap user.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | Penerima notif |
| `type` | NotificationType | Jenis notifikasi |
| `message` | TEXT | Teks pesan |
| `target_url` | TEXT | URL tujuan klik |
| `is_read` | BOOLEAN | Default: false |
| `created_at` | TIMESTAMP | |

---

#### 🚨 17. `reports`
Laporan konten dari user.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `reporter_id` | UUID FK → users | Pelapor |
| `target_type` | ReportTargetType | Jenis yang dilaporkan |
| `target_id` | UUID | ID target |
| `reason` | TEXT | Alasan pelaporan |
| `status` | ReportStatus | `pending/resolved/rejected` |
| `resolved_by` | UUID FK → users | Admin yang menangani |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

#### 👣 18. `follows`
Relasi follow antar pengguna.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `follower_id` | UUID FK → users | Yang mem-follow |
| `following_id` | UUID FK → users | Yang di-follow |
| `created_at` | TIMESTAMP | |

`PK: (follower_id, following_id)`

---

#### 📊 19. `activity_logs`
Log aktivitas user untuk audit/analytics.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `action` | TEXT | Nama aksi |
| `metadata` | JSONB | Data tambahan |
| `created_at` | TIMESTAMP | |

---

### 🎬 CineThread Tables (7 Tabel Baru)

---

#### 📌 20. `cinethread_posts`
Post utama CineThread dan thread lanjutannya (self-referencing).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `author_id` | UUID FK → users | Penulis |
| `thread_root_id` | UUID FK → self | NULL = root post, ISI = thread lanjutan |
| `thread_order` | SMALLINT | Urutan dalam thread (0, 1, 2, ...) |
| `post_type` | CinePostType | Jenis post |
| `content` | TEXT | Konten teks |
| `views_count` | INT | Jumlah view |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

> **Cara kerja thread:** Root post = `thread_root_id IS NULL`. Thread lanjutan = semua post dengan `thread_root_id` sama, diurut `thread_order`.

---

#### 🖼️ 21. `cinethread_media`
Lampiran media (gambar/gif/video) untuk setiap post.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `post_id` | UUID FK → cinethread_posts | |
| `media_type` | CineMediaType | `image/gif/video` |
| `url` | VARCHAR(500) | URL media |
| `alt_text` | VARCHAR(255) | Teks alternatif |
| `sort_order` | SMALLINT | Urutan tampil |

---

#### 🎥 22. `cinethread_film_tags`
Film yang di-tag dalam sebuah post.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `post_id` | UUID FK → cinethread_posts | |
| `film_id` | UUID FK → films | |

`PK: (post_id, film_id)`

---

#### 🏷️ 23. `cinethread_hashtags`
Hashtag bebas dalam sebuah post.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `post_id` | UUID FK → cinethread_posts | |
| `hashtag` | VARCHAR(100) | Teks hashtag (tanpa #, lowercase) |

`PK: (post_id, hashtag)` — Index on `hashtag` untuk search cepat.

---

#### 💬 24. `cinethread_comments`
Komentar dan nested reply pada CinePost.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `post_id` | UUID FK → cinethread_posts | |
| `author_id` | UUID FK → users | |
| `parent_comment_id` | UUID FK → self | NULL = top-level, ISI = balasan |
| `content` | TEXT | Isi komentar |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

#### 🔖 25. `cinethread_saves`
Simpan post CineThread ke koleksi pribadi.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `user_id` | UUID FK → users | |
| `post_id` | UUID FK → cinethread_posts | |
| `saved_at` | TIMESTAMP | |

`PK: (user_id, post_id)`

---

#### 🔁 26. `cinethread_reposts`
Repost biasa dan quote repost.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | Yang merepost |
| `original_post_id` | UUID FK → cinethread_posts | Post asli |
| `quote_post_id` | UUID FK → cinethread_posts | NULL = repost biasa, ISI = quote repost |
| `created_at` | TIMESTAMP | |

`UNIQUE: (user_id, original_post_id)` — tidak bisa repost 2x.

---

### 💬 Messaging Tables (5 Tabel Baru)

---

#### 📥 27. `conversations`
Menyimpan obrolan antar 2 pengguna.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `user_one_id` | UUID FK → users | User 1 |
| `user_two_id` | UUID FK → users | User 2 |
| `last_message_id` | UUID FK → messages | Pesan terakhir |
| `last_activity` | TIMESTAMP | Waktu terakhir aktif |
| `created_at` | TIMESTAMP | |

---

#### ✉️ 28. `messages`
Menyimpan detail pesan di dalam conversation.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `conversation_id` | UUID FK → conversations | |
| `sender_id` | UUID FK → users | Pengirim |
| `content_type` | MessageContentType | Jenis isi pesan |
| `body` | TEXT | Teks pesan |
| `status` | MessageStatus | `sent/delivered/read` |
| `deleted_at` | TIMESTAMP | Soft delete |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

#### 📎 29. `message_attachments`
Lampiran pesan (gambar, tag film, share thread).

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `message_id` | UUID FK → messages | |
| `media_url` | VARCHAR(500) | URL gambar/media |
| `alt_text` | VARCHAR(200) | Teks alternatif |
| `film_id` | UUID FK → films | Tag film |
| `cinepost_id` | UUID FK → cinethread_posts | Share CinePost |
| `created_at` | TIMESTAMP | |

---

#### 👀 30. `message_read_receipts`
Status dibaca untuk pesan.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `message_id` | UUID FK → messages | |
| `user_id` | UUID FK → users | |
| `read_at` | TIMESTAMP | |

`PK: (message_id, user_id)`

---

#### 📬 31. `message_requests`
Permintaan obrolan sebelum disetujui.

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| `id` | UUID PK | |
| `sender_id` | UUID FK → users | |
| `receiver_id` | UUID FK → users | |
| `message` | TEXT | Pesan intro |
| `status` | VARCHAR | `pending/accept/reject` |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

---

## 🔧 Penjelasan File Backend

### `src/app.js`
Entry point Express. Mengatur:
- **Middleware global:** `helmet` (security), `cors`, `morgan` (logging), `express.json`
- **Rate limiting:** 100 request per 15 menit per IP
- **Swagger UI:** tersedia di `/api/docs`
- **Health check:** `GET /api/health`
- **Route mounting:** semua route dari `src/routes/index.js`
- **Error handler:** global error catcher di akhir

---

### `src/config/prisma.js`
Singleton instance Prisma Client. Seluruh service mengimport dari sini untuk menghindari koneksi ganda ke database.

### `src/config/swagger.js`
Konfigurasi Swagger/OpenAPI untuk auto-generate dokumentasi API interaktif di `/api/docs`.

---

### Middleware

#### `middleware/auth.js` — JWT Authentication
- Membaca header `Authorization: Bearer <token>`
- Verifikasi token dengan `JWT_SECRET`
- Cek apakah user ada dan tidak di-ban
- Menyuntikkan `req.user` ke request selanjutnya

#### `middleware/authorize.js` — Role-Based Access Control
- Menerima parameter role yang diperbolehkan
- Membandingkan `req.user.role` dengan role yang diperlukan
- Contoh: `authorize('admin')`, `authorize('moderator', 'admin')`

#### `middleware/errorHandler.js` — Global Error Handler
- Menangkap semua error yang di-`next(err)`
- Memberi response JSON dengan `statusCode` dan `message`
- Memformat error Prisma menjadi pesan yang friendly

#### `middleware/validate.js` — Request Validator
- Validasi body request sebelum diproses controller

---

### Services (Business Logic Layer)

| File | Fungsi Utama |
|------|--------------|
| `auth.service.js` | `register`, `login`, `getMe` |
| `user.service.js` | `getUserProfile`, `updateProfile`, `listUsers`, `banUser`, `setRole`, `deleteUser` |
| `film.service.js` | `getFilms` (filter+paginate), `getFilmById`, CRUD film, `getGenres`, `getMoods` |
| `rating.service.js` | `upsertRating`, `deleteRating`, `getFilmRatings` |
| `review.service.js` | `getReviews`, `createReview`, `updateReview`, `deleteReview` |
| `discussion.service.js` | `getDiscussions`, `getDiscussionById`, CRUD diskusi |
| `reply.service.js` | `getReplies`, `createReply`, `deleteReply` |
| `like.service.js` | `toggleLike` (polimorfik: discussion/reply/cinepost/cinecomment) |
| `watchlist.service.js` | CRUD watchlist, `addItem`, `toggleWatched`, `joinByShareCode`, kelola member |
| `notification.service.js` | `getNotifications`, `markRead`, `markAllRead`, `deleteNotification` |
| `report.service.js` | `createReport`, `getReports`, `resolveReport` |
| `follow.service.js` | `follow`, `unfollow`, `getFollowers`, `getFollowing` |
| `cinethread.service.js` | `getFeed`, `getThread`, `getPostsByUser`, `createPost`, `appendThread`, `updatePost`, `deletePost` |
| `cinecomment.service.js` | `getComments`, `getReplies`, `addComment`, `replyToComment`, `deleteComment` |
| `cinerepost.service.js` | `repost` (biasa/quote), `undoRepost` |
| `cinesave.service.js` | `toggleSave`, `getSavedPosts` |
| `message.service.js` | `getRequests`, `sendRequest`, `respondRequest`, `getConversations`, `createConversation`, `getMessages`, `sendMessage`, `markAsRead`, `deleteMessage` |

---

### Controllers (Request Handler Layer)
Setiap controller menerima HTTP request, memanggil service, dan mengembalikan response standar `{ success, data }`. 17 controller total, nama sesuai service masing-masing.

---

### Routes

#### `/api/auth`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/auth/register` | ❌ | Daftar akun baru |
| POST | `/api/auth/login` | ❌ | Login, dapat JWT |
| GET | `/api/auth/me` | ✅ | Info akun sendiri |

#### `/api/films`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/films` | ❌ | Daftar film (filter: search, genreId, moodId, year) |
| GET | `/api/films/genres` | ❌ | Semua genre |
| GET | `/api/films/moods` | ❌ | Semua mood |
| GET | `/api/films/:id` | ❌ | Detail film |
| POST | `/api/films` | 🔑 Admin | Tambah film |
| PUT | `/api/films/:id` | 🔑 Admin | Edit film |
| DELETE | `/api/films/:id` | 🔑 Admin | Hapus film |
| GET | `/api/films/:filmId/ratings` | ❌ | Rating film |
| POST | `/api/films/:filmId/ratings` | ✅ | Beri/update rating |
| DELETE | `/api/films/:filmId/ratings` | ✅ | Hapus rating |
| GET | `/api/films/:filmId/reviews` | ❌ | Review film |
| POST | `/api/films/:filmId/reviews` | ✅ | Tulis review |
| GET | `/api/films/:filmId/discussions` | ❌ | Diskusi film |
| POST | `/api/films/:filmId/discussions` | ✅ | Buat diskusi |

#### `/api/discussions`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/discussions/:id` | ❌ | Detail diskusi |
| PUT | `/api/discussions/:id` | ✅ Owner | Edit diskusi |
| DELETE | `/api/discussions/:id` | ✅ Owner/Admin | Hapus diskusi |
| GET | `/api/discussions/:id/replies` | ❌ | Daftar reply |
| POST | `/api/discussions/:id/replies` | ✅ | Tambah reply |

#### `/api/likes`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/likes` | ✅ | Toggle like — body: `{ targetType, targetId }` |

#### `/api/watchlists`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/watchlists` | ✅ | Watchlist saya |
| POST | `/api/watchlists` | ✅ | Buat watchlist |
| GET | `/api/watchlists/:id` | ✅ Member | Detail watchlist |
| PUT | `/api/watchlists/:id` | ✅ Owner | Edit watchlist |
| DELETE | `/api/watchlists/:id` | ✅ Owner | Hapus watchlist |
| POST | `/api/watchlists/join/:shareCode` | ✅ | Gabung via share code |
| POST | `/api/watchlists/:id/items` | ✅ Editor | Tambah film |
| DELETE | `/api/watchlists/:id/items/:filmId` | ✅ Editor | Hapus film |
| PATCH | `/api/watchlists/:id/items/:filmId/watch` | ✅ Editor | Toggle sudah ditonton |
| POST | `/api/watchlists/:id/members` | ✅ Owner | Undang anggota |
| DELETE | `/api/watchlists/:id/members/:userId` | ✅ Owner | Keluarkan anggota |

#### `/api/notifications`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/notifications` | ✅ | Daftar notifikasi |
| PATCH | `/api/notifications/:id/read` | ✅ | Tandai dibaca |
| PATCH | `/api/notifications/read-all` | ✅ | Tandai semua dibaca |
| DELETE | `/api/notifications/:id` | ✅ | Hapus notifikasi |

#### `/api/reports`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/reports` | ✅ | Laporkan konten |
| GET | `/api/reports` | 🔑 Mod/Admin | Semua laporan |
| PATCH | `/api/reports/:id` | 🔑 Mod/Admin | Resolve/reject |

#### `/api/follow`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/api/follow/:userId` | ✅ | Follow user |
| DELETE | `/api/follow/:userId` | ✅ | Unfollow user |

#### `/api/users`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/users` | 🔑 Admin | Semua user |
| GET | `/api/users/:id` | ❌ | Profil publik user |
| PUT | `/api/users/me` | ✅ | Edit profil sendiri |
| PATCH | `/api/users/:id/ban` | 🔑 Admin | Ban/unban user |
| PATCH | `/api/users/:id/role` | 🔑 Admin | Ganti role |
| DELETE | `/api/users/:id` | 🔑 Admin | Hapus user |
| GET | `/api/users/:userId/followers` | ❌ | Daftar follower |
| GET | `/api/users/:userId/following` | ❌ | Daftar following |

#### 🆕 `/api/cinethread`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/cinethread/feed` | ❌ | Feed publik (filter: postType, hashtag) |
| GET | `/api/cinethread/saved` | ✅ | Post yang disimpan |
| GET | `/api/cinethread/user/:userId` | ❌ | Post milik user |
| GET | `/api/cinethread/:postId` | ❌ | Detail post + seluruh thread |
| POST | `/api/cinethread` | ✅ | Buat root post baru |
| POST | `/api/cinethread/:postId/thread` | ✅ Owner | Tambah lanjutan thread |
| PATCH | `/api/cinethread/:postId` | ✅ Owner | Edit post |
| DELETE | `/api/cinethread/:postId` | ✅ Owner/Admin | Hapus post |
| GET | `/api/cinethread/:postId/comments` | ❌ | Komentar pada post |
| POST | `/api/cinethread/:postId/comments` | ✅ | Tambah komentar |
| GET | `/api/cinethread/comments/:commentId/replies` | ❌ | Balasan komentar |
| POST | `/api/cinethread/comments/:commentId/reply` | ✅ | Balas komentar |
| DELETE | `/api/cinethread/comments/:commentId` | ✅ Owner/Admin | Hapus komentar |
| POST | `/api/cinethread/:postId/repost` | ✅ | Repost / quote repost |
| DELETE | `/api/cinethread/:postId/repost` | ✅ | Batalkan repost |
| POST | `/api/cinethread/:postId/save` | ✅ | Toggle simpan/hapus simpan |

#### ✉️ `/api/messages`
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| GET | `/api/messages/requests` | ✅ | Daftar message request masuk |
| POST | `/api/messages/requests` | ✅ | Kirim message request |
| PATCH | `/api/messages/requests/:requestId` | ✅ | Terima/tolak request |
| GET | `/api/messages/conversations` | ✅ | Daftar percakapan (inbox) |
| POST | `/api/messages/conversations` | ✅ | Buat percakapan baru |
| GET | `/api/messages/:conversationId` | ✅ | Pesan dalam percakapan |
| POST | `/api/messages/:conversationId` | ✅ | Kirim pesan ke percakapan |
| PATCH | `/api/messages/:conversationId/read` | ✅ | Tandai pesan dibaca |
| DELETE | `/api/messages/:messageId` | ✅ | Hapus pesan |

---

## 🔐 Autentikasi & Otorisasi

| Simbol | Arti |
|--------|------|
| ❌ | Publik — tidak butuh token |
| ✅ | Perlu JWT Bearer token |
| 🔑 Admin | Perlu role `admin` |
| 🔑 Mod/Admin | Perlu role `moderator` atau `admin` |

### Format Header
```
Authorization: Bearer <token_dari_login>
```

### Format Response Standar
```json
// Sukses — single item
{ "success": true, "data": { ... } }

// Sukses — list dengan pagination
{ "success": true, "data": { "posts": [...], "total": 100, "page": 1, "totalPages": 5 } }

// Error
{ "success": false, "message": "Pesan error" }
```

---

## ⚙️ Environment Variables (`.env`)

| Variabel | Contoh | Keterangan |
|----------|--------|------------|
| `DATABASE_URL` | `postgresql://postgres:admin123@localhost:5433/flix_db` | Koneksi PostgreSQL |
| `JWT_SECRET` | `flix_super_secret_...` | Secret key JWT |
| `JWT_EXPIRES_IN` | `7d` | Masa berlaku token |
| `PORT` | `3000` | Port server |
| `NODE_ENV` | `development` | Mode environment |

---

## 🚀 Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Salin dan isi file environment
cp .env.example .env

# 3. Sync schema ke database
npx prisma db push

# 4. Generate Prisma Client
npx prisma generate

# 5. (Opsional) Isi data awal genre & mood
node prisma/seed.js

# 6. Jalankan server development
npm run dev

# Akses Swagger UI
# http://localhost:3000/api/docs
```

---

## 📦 Dependensi Utama

| Package | Fungsi |
|---------|--------|
| `express` | Framework HTTP |
| `@prisma/client` | Database ORM |
| `bcryptjs` | Hash password |
| `jsonwebtoken` | Generate & verify JWT |
| `helmet` | Security HTTP headers |
| `cors` | Cross-Origin Resource Sharing |
| `morgan` | HTTP request logger |
| `express-rate-limit` | Pencegahan brute force |
| `swagger-ui-express` | Dokumentasi API interaktif |
