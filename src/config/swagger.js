const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🎬 FLIX API',
      version: '1.0.0',
      description: `
## Selamat Datang di FLIX API Documentation

Backend production-ready untuk aplikasi rekomendasi film **FLIX**.

### Tech Stack
- **Node.js** + **Express.js**
- **PostgreSQL** + **Prisma ORM**
- **JWT Authentication**

### Autentikasi
Gunakan endpoint \`/api/auth/login\` untuk mendapatkan token JWT.  
Masukkan token di tombol **Authorize** di atas dengan format: \`Bearer <token>\`

### Role
| Role | Akses |
|------|-------|
| \`user\` | Akses fitur dasar (rate, review, diskusi, watchlist) |
| \`moderator\` | Semua user + moderasi report |
| \`admin\` | Semua akses + kelola film & user |

### Admin Default (untuk testing)
- **Email**: admin@flix.com  
- **Password**: admin123
      `,
      contact: { name: 'FLIX Dev Team', email: 'dev@flix.com' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development Server' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        // ── Common ──────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: { type: 'integer' },
            page: { type: 'integer' },
            limit: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },

        // ── Auth ────────────────────────────────────────────
        RegisterBody: {
          type: 'object',
          required: ['username', 'email', 'password'],
          properties: {
            username: { type: 'string', example: 'johndoe' },
            email:    { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', minLength: 6, example: 'secret123' },
          },
        },
        LoginBody: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', format: 'email', example: 'admin@flix.com' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        AuthToken: {
          type: 'object',
          properties: {
            user:  { $ref: '#/components/schemas/UserPublic' },
            token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },

        // ── User ────────────────────────────────────────────
        UserPublic: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            username:  { type: 'string' },
            email:     { type: 'string' },
            avatarUrl: { type: 'string', nullable: true },
            role:      { type: 'string', enum: ['user', 'moderator', 'admin'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },

        // ── Film ────────────────────────────────────────────
        Film: {
          type: 'object',
          properties: {
            id:              { type: 'string', format: 'uuid' },
            title:           { type: 'string', example: 'Inception' },
            director:        { type: 'string', example: 'Christopher Nolan' },
            releaseYear:     { type: 'integer', example: 2010 },
            synopsis:        { type: 'string' },
            imdbRating:      { type: 'number', example: 8.8 },
            durationMinutes: { type: 'integer', example: 148 },
            posterUrl:       { type: 'string', nullable: true },
            genres:          { type: 'array', items: { $ref: '#/components/schemas/Genre' } },
            moods:           { type: 'array', items: { $ref: '#/components/schemas/Mood' } },
          },
        },
        CreateFilmBody: {
          type: 'object',
          required: ['title'],
          properties: {
            title:           { type: 'string', example: 'Inception' },
            director:        { type: 'string', example: 'Christopher Nolan' },
            releaseYear:     { type: 'integer', example: 2010 },
            synopsis:        { type: 'string' },
            imdbRating:      { type: 'number', example: 8.8 },
            durationMinutes: { type: 'integer', example: 148 },
            posterUrl:       { type: 'string' },
            omdbId:          { type: 'string' },
            genreIds:        { type: 'array', items: { type: 'integer' }, example: [1, 6] },
            moodIds:         { type: 'array', items: { type: 'integer' }, example: [2, 5] },
          },
        },
        Genre: {
          type: 'object',
          properties: {
            id:   { type: 'integer' },
            name: { type: 'string', example: 'Action' },
          },
        },
        Mood: {
          type: 'object',
          properties: {
            id:       { type: 'integer' },
            name:     { type: 'string', example: 'Seru' },
            emoji:    { type: 'string', example: '🔥' },
            colorHex: { type: 'string', example: '#FD79A8' },
          },
        },

        // ── Rating ──────────────────────────────────────────
        RatingBody: {
          type: 'object',
          required: ['score'],
          properties: {
            score: { type: 'integer', minimum: 1, maximum: 10, example: 9 },
          },
        },

        // ── Review ──────────────────────────────────────────
        ReviewBody: {
          type: 'object',
          required: ['content'],
          properties: {
            content:   { type: 'string', example: 'Film luar biasa!' },
            isSpoiler: { type: 'boolean', default: false },
          },
        },

        // ── Discussion ──────────────────────────────────────
        DiscussionBody: {
          type: 'object',
          required: ['title', 'body'],
          properties: {
            title:    { type: 'string', example: 'Apa makna akhir Inception?' },
            body:     { type: 'string', example: 'Saya penasaran dengan adegan terakhir...' },
            category: { type: 'string', enum: ['general', 'theory', 'review', 'question'], default: 'general' },
            tags:     { type: 'array', items: { type: 'string' }, example: ['spoiler', 'theory'] },
          },
        },

        // ── Reply ───────────────────────────────────────────
        ReplyBody: {
          type: 'object',
          required: ['body'],
          properties: {
            body:          { type: 'string', example: 'Menurut saya top terus berputar...' },
            parentReplyId: { type: 'string', format: 'uuid', nullable: true },
          },
        },

        // ── Like ────────────────────────────────────────────
        LikeBody: {
          type: 'object',
          required: ['targetType', 'targetId'],
          properties: {
            targetType: { type: 'string', enum: ['discussion', 'reply'] },
            targetId:   { type: 'string', format: 'uuid' },
          },
        },

        // ── Watchlist ───────────────────────────────────────
        WatchlistBody: {
          type: 'object',
          properties: {
            name:     { type: 'string', example: 'Film Wajib Tonton' },
            isShared: { type: 'boolean', default: false },
          },
        },
        WatchlistItemBody: {
          type: 'object',
          required: ['filmId'],
          properties: {
            filmId: { type: 'string', format: 'uuid' },
          },
        },

        // ── Report ──────────────────────────────────────────
        ReportBody: {
          type: 'object',
          required: ['targetType', 'targetId', 'reason'],
          properties: {
            targetType: { type: 'string', enum: ['discussion', 'reply', 'user'] },
            targetId:   { type: 'string', format: 'uuid' },
            reason:     { type: 'string', example: 'Konten tidak sesuai' },
          },
        },
        ResolveReportBody: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['resolved', 'rejected'] },
          },
        },

        // ── Messaging ────────────────────────────────────────
        MessageAttachment: {
          type: 'object',
          properties: {
            id:        { type: 'string', format: 'uuid' },
            messageId: { type: 'string', format: 'uuid' },
            mediaUrl:  { type: 'string', nullable: true },
            altText:   { type: 'string', nullable: true },
            filmId:    { type: 'string', format: 'uuid', nullable: true },
            cinepostId:{ type: 'string', format: 'uuid', nullable: true },
            film:      { type: 'object', nullable: true, properties: { id: { type: 'string', format: 'uuid' }, title: { type: 'string' }, posterUrl: { type: 'string', nullable: true } } },
          },
        },
        Message: {
          type: 'object',
          properties: {
            id:             { type: 'string', format: 'uuid' },
            conversationId: { type: 'string', format: 'uuid' },
            senderId:       { type: 'string', format: 'uuid' },
            contentType:    { type: 'string', enum: ['text', 'image', 'film_tag', 'cinethread_share'] },
            body:           { type: 'string', nullable: true },
            status:         { type: 'string', enum: ['sent', 'delivered', 'read'] },
            deletedAt:      { type: 'string', format: 'date-time', nullable: true },
            createdAt:      { type: 'string', format: 'date-time' },
            sender:         { $ref: '#/components/schemas/UserPublic' },
            attachments:    { type: 'array', items: { $ref: '#/components/schemas/MessageAttachment' } },
            readReceipts:   { type: 'array', items: { type: 'object', properties: { userId: { type: 'string', format: 'uuid' }, readAt: { type: 'string', format: 'date-time' } } } },
          },
        },
        Conversation: {
          type: 'object',
          properties: {
            id:           { type: 'string', format: 'uuid' },
            partner:      { $ref: '#/components/schemas/UserPublic' },
            lastMessage:  { $ref: '#/components/schemas/Message', nullable: true },
            lastActivity: { type: 'string', format: 'date-time' },
            unreadCount:  { type: 'integer', example: 3 },
            createdAt:    { type: 'string', format: 'date-time' },
          },
        },
        MessageRequest: {
          type: 'object',
          properties: {
            id:         { type: 'string', format: 'uuid' },
            senderId:   { type: 'string', format: 'uuid' },
            receiverId: { type: 'string', format: 'uuid' },
            message:    { type: 'string', nullable: true },
            status:     { type: 'string', enum: ['pending', 'accepted', 'rejected'] },
            createdAt:  { type: 'string', format: 'date-time' },
            sender:     { $ref: '#/components/schemas/UserPublic' },
          },
        },
        SendRequestBody: {
          type: 'object',
          required: ['receiverId'],
          properties: {
            receiverId: { type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
            message:    { type: 'string', maxLength: 500, example: 'Hai, boleh ngobrol?' },
          },
        },
        RespondRequestBody: {
          type: 'object',
          required: ['action'],
          properties: {
            action: { type: 'string', enum: ['accept', 'reject'], example: 'accept' },
          },
        },
        CreateConvBody: {
          type: 'object',
          required: ['partnerId'],
          properties: {
            partnerId: { type: 'string', format: 'uuid', example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
          },
        },
        SendMessageBody: {
          type: 'object',
          properties: {
            contentType: { type: 'string', enum: ['text', 'image', 'film_tag', 'cinethread_share'], default: 'text' },
            body:        { type: 'string', maxLength: 5000, example: 'Halo, apa kabar?' },
            attachment:  {
              type: 'object',
              properties: {
                mediaUrl:   { type: 'string', format: 'uri', nullable: true },
                altText:    { type: 'string', maxLength: 200, nullable: true },
                filmId:     { type: 'string', format: 'uuid', nullable: true },
                cinepostId: { type: 'string', format: 'uuid', nullable: true },
              },
            },
          },
        },
      },
    },
    security: [],
    tags: [
      { name: 'Health',        description: 'Server health check' },
      { name: 'Auth',          description: 'Register, Login, Profile' },
      { name: 'Films',         description: 'CRUD film + filter genre/mood' },
      { name: 'Ratings',       description: 'Rate film (1-10)' },
      { name: 'Reviews',       description: 'Tulis review film' },
      { name: 'Discussions',   description: 'Forum diskusi per film' },
      { name: 'Replies',       description: 'Balasan diskusi (nested)' },
      { name: 'Likes',         description: 'Like/unlike discussion atau reply' },
      { name: 'Watchlist',     description: 'Watchlist kolaboratif' },
      { name: 'Notifications', description: 'Notifikasi user' },
      { name: 'Reports',       description: 'Sistem moderasi' },
      { name: 'Follow',        description: 'Social follow antar user' },
      { name: 'Users',         description: 'Profil & manajemen user' },
      { name: 'Messages',      description: 'Private messaging antar user (request, conversation, pesan)' },
    ],
    paths: {
      // ── HEALTH ────────────────────────────────────────────────
      '/api/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check server',
          responses: {
            200: { description: 'Server OK', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, status: { type: 'string', example: 'ok' }, app: { type: 'string' }, timestamp: { type: 'string' } } } } } },
          },
        },
      },

      // ── AUTH ──────────────────────────────────────────────────
      '/api/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register user baru',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterBody' } } } },
          responses: {
            201: { description: 'Berhasil register', content: { 'application/json': { schema: { properties: { success: { type:'boolean' }, data: { $ref: '#/components/schemas/AuthToken' } } } } } },
            409: { description: 'Email/username sudah dipakai' },
          },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login dan dapatkan JWT token',
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginBody' } } } },
          responses: {
            200: { description: 'Login berhasil', content: { 'application/json': { schema: { properties: { success: { type:'boolean' }, data: { $ref: '#/components/schemas/AuthToken' } } } } } },
            401: { description: 'Email/password salah' },
          },
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'], summary: 'Get profil user yang sedang login',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Profil user', content: { 'application/json': { schema: { properties: { success: { type:'boolean' }, data: { $ref: '#/components/schemas/UserPublic' } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },

      // ── FILMS ─────────────────────────────────────────────────
      '/api/films': {
        get: {
          tags: ['Films'], summary: 'Daftar semua film dengan filter & pagination',
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Cari berdasarkan judul' },
            { name: 'genreId', in: 'query', schema: { type: 'integer' }, description: 'Filter berdasarkan genre ID' },
            { name: 'moodId', in: 'query', schema: { type: 'integer' }, description: 'Filter berdasarkan mood ID' },
            { name: 'year', in: 'query', schema: { type: 'integer' }, description: 'Filter berdasarkan tahun rilis' },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'List film' } },
        },
        post: {
          tags: ['Films'], summary: 'Tambah film baru (Admin only)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFilmBody' } } } },
          responses: { 201: { description: 'Film berhasil dibuat' }, 403: { description: 'Bukan admin' } },
        },
      },
      '/api/films/genres': {
        get: { tags: ['Films'], summary: 'List semua genre', responses: { 200: { description: 'List genre' } } },
      },
      '/api/films/moods': {
        get: { tags: ['Films'], summary: 'List semua mood (dengan emoji & warna)', responses: { 200: { description: 'List mood' } } },
      },
      '/api/films/{id}': {
        get: {
          tags: ['Films'], summary: 'Detail film berdasarkan ID',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Detail film' }, 404: { description: 'Film tidak ditemukan' } },
        },
        put: {
          tags: ['Films'], summary: 'Update film (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFilmBody' } } } },
          responses: { 200: { description: 'Film berhasil diupdate' } },
        },
        delete: {
          tags: ['Films'], summary: 'Hapus film (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Film dihapus' } },
        },
      },

      // ── RATINGS ───────────────────────────────────────────────
      '/api/films/{filmId}/ratings': {
        get: {
          tags: ['Ratings'], summary: 'Get semua rating beserta rata-rata untuk film',
          parameters: [{ name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Rating data + avg score' } },
        },
        post: {
          tags: ['Ratings'], summary: 'Beri/ubah rating film (1-10)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RatingBody' } } } },
          responses: { 200: { description: 'Rating disimpan (create/update)' } },
        },
        delete: {
          tags: ['Ratings'], summary: 'Hapus rating kamu untuk film ini',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Rating dihapus' } },
        },
      },

      // ── REVIEWS ───────────────────────────────────────────────
      '/api/films/{filmId}/reviews': {
        get: {
          tags: ['Reviews'], summary: 'Get semua review untuk film tertentu',
          parameters: [
            { name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          ],
          responses: { 200: { description: 'List review' } },
        },
        post: {
          tags: ['Reviews'], summary: 'Tulis review untuk film (1 review per user per film)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewBody' } } } },
          responses: { 201: { description: 'Review dibuat' }, 409: { description: 'Sudah pernah review film ini' } },
        },
      },
      '/api/reviews/{id}': {
        put: {
          tags: ['Reviews'], summary: 'Update review (hanya penulis)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReviewBody' } } } },
          responses: { 200: { description: 'Review diupdate' } },
        },
        delete: {
          tags: ['Reviews'], summary: 'Hapus review (penulis / moderator / admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Review dihapus (soft delete)' } },
        },
      },

      // ── DISCUSSIONS ───────────────────────────────────────────
      '/api/films/{filmId}/discussions': {
        get: {
          tags: ['Discussions'], summary: 'List diskusi untuk film tertentu',
          parameters: [
            { name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'category', in: 'query', schema: { type: 'string', enum: ['general','theory','review','question'] } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List diskusi' } },
        },
        post: {
          tags: ['Discussions'], summary: 'Buat diskusi baru untuk film',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscussionBody' } } } },
          responses: { 201: { description: 'Diskusi dibuat' } },
        },
      },
      '/api/discussions/{id}': {
        get: {
          tags: ['Discussions'], summary: 'Detail diskusi (view count +1)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Detail diskusi' } },
        },
        put: {
          tags: ['Discussions'], summary: 'Edit diskusi (hanya penulis)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/DiscussionBody' } } } },
          responses: { 200: { description: 'Diskusi diupdate' } },
        },
        delete: {
          tags: ['Discussions'], summary: 'Hapus diskusi (penulis / moderator / admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Diskusi dihapus (soft delete)' } },
        },
      },

      // ── REPLIES ───────────────────────────────────────────────
      '/api/discussions/{id}/replies': {
        get: {
          tags: ['Replies'], summary: 'Get semua reply (nested/bertingkat)',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'List reply beserta children' } },
        },
        post: {
          tags: ['Replies'], summary: 'Tulis reply. Isi parentReplyId untuk nested reply.',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReplyBody' } } } },
          responses: { 201: { description: 'Reply dibuat, notifikasi dikirim ke penulis diskusi' } },
        },
      },
      '/api/replies/{id}': {
        put: {
          tags: ['Replies'], summary: 'Edit reply (hanya penulis)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { body: { type: 'string' } } } } } },
          responses: { 200: { description: 'Reply diupdate' } },
        },
        delete: {
          tags: ['Replies'], summary: 'Hapus reply (penulis / moderator / admin)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Reply dihapus (soft delete)' } },
        },
      },

      // ── LIKES ─────────────────────────────────────────────────
      '/api/likes': {
        post: {
          tags: ['Likes'], summary: 'Toggle like (like jika belum, unlike jika sudah)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/LikeBody' } } } },
          responses: { 200: { description: 'Like toggled', content: { 'application/json': { schema: { properties: { success: { type:'boolean' }, data: { type:'object', properties: { liked: { type:'boolean' } } } } } } } } },
        },
      },

      // ── WATCHLIST ─────────────────────────────────────────────
      '/api/watchlists': {
        get: {
          tags: ['Watchlist'], summary: 'Get semua watchlist milik / member user',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'List watchlist' } },
        },
        post: {
          tags: ['Watchlist'], summary: 'Buat watchlist baru. Set isShared=true untuk dapat share code.',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WatchlistBody' } } } },
          responses: { 201: { description: 'Watchlist dibuat' } },
        },
      },
      '/api/watchlists/join/{shareCode}': {
        post: {
          tags: ['Watchlist'], summary: 'Join watchlist orang lain via share code',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'shareCode', in: 'path', required: true, schema: { type: 'string', example: '6e99ee76d84e' } }],
          responses: { 200: { description: 'Berhasil join watchlist' }, 404: { description: 'Share code tidak valid' } },
        },
      },
      '/api/watchlists/{id}': {
        get: {
          tags: ['Watchlist'], summary: 'Detail watchlist (owner/member only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Detail watchlist beserta film list' } },
        },
        put: {
          tags: ['Watchlist'], summary: 'Update nama / sharing status watchlist (owner only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WatchlistBody' } } } },
          responses: { 200: { description: 'Watchlist diupdate' } },
        },
        delete: {
          tags: ['Watchlist'], summary: 'Hapus watchlist (owner only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Watchlist dihapus' } },
        },
      },
      '/api/watchlists/{id}/items': {
        post: {
          tags: ['Watchlist'], summary: 'Tambah film ke watchlist (owner/editor)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/WatchlistItemBody' } } } },
          responses: { 201: { description: 'Film ditambahkan' } },
        },
      },
      '/api/watchlists/{id}/items/{filmId}': {
        delete: {
          tags: ['Watchlist'], summary: 'Hapus film dari watchlist (owner/editor)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { 200: { description: 'Film dihapus dari watchlist' } },
        },
      },
      '/api/watchlists/{id}/items/{filmId}/watch': {
        patch: {
          tags: ['Watchlist'], summary: 'Toggle status is_watched film (owner/editor)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'filmId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { 200: { description: 'Status watched diupdate' } },
        },
      },
      '/api/watchlists/{id}/members': {
        post: {
          tags: ['Watchlist'], summary: 'Tambah member ke watchlist (owner only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type:'object', properties: { userId: { type:'string', format:'uuid' }, role: { type:'string', enum:['viewer','editor'] } } } } } },
          responses: { 200: { description: 'Member ditambahkan' } },
        },
      },
      '/api/watchlists/{id}/members/{userId}': {
        delete: {
          tags: ['Watchlist'], summary: 'Hapus member dari watchlist (owner only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: { 200: { description: 'Member dihapus' } },
        },
      },

      // ── NOTIFICATIONS ─────────────────────────────────────────
      '/api/notifications': {
        get: {
          tags: ['Notifications'], summary: 'Get notifikasi user (dengan unread count)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer' } },
            { name: 'limit', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List notifikasi + unreadCount' } },
        },
      },
      '/api/notifications/read-all': {
        patch: {
          tags: ['Notifications'], summary: 'Tandai semua notifikasi sebagai sudah dibaca',
          security: [{ BearerAuth: [] }],
          responses: { 200: { description: 'Semua notifikasi ditandai terbaca' } },
        },
      },
      '/api/notifications/{id}/read': {
        patch: {
          tags: ['Notifications'], summary: 'Tandai satu notifikasi sebagai sudah dibaca',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Notifikasi ditandai terbaca' } },
        },
      },
      '/api/notifications/{id}': {
        delete: {
          tags: ['Notifications'], summary: 'Hapus notifikasi',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Notifikasi dihapus' } },
        },
      },

      // ── REPORTS ───────────────────────────────────────────────
      '/api/reports': {
        post: {
          tags: ['Reports'], summary: 'Laporkan konten (discussion / reply / user)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ReportBody' } } } },
          responses: { 201: { description: 'Report berhasil dikirim' } },
        },
        get: {
          tags: ['Reports'], summary: 'List semua report (Moderator/Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'status', in: 'query', schema: { type: 'string', enum: ['pending','resolved','rejected'] } }],
          responses: { 200: { description: 'List report' }, 403: { description: 'Bukan moderator/admin' } },
        },
      },
      '/api/reports/{id}': {
        patch: {
          tags: ['Reports'], summary: 'Resolve atau reject report (Moderator/Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/ResolveReportBody' } } } },
          responses: { 200: { description: 'Report berhasil diupdate' } },
        },
      },

      // ── FOLLOW ────────────────────────────────────────────────
      '/api/follow/{userId}': {
        post: {
          tags: ['Follow'], summary: 'Follow user lain',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Berhasil follow, notifikasi dikirim ke target' } },
        },
        delete: {
          tags: ['Follow'], summary: 'Unfollow user',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Berhasil unfollow' } },
        },
      },
      '/api/follow/{userId}/followers': {
        get: {
          tags: ['Follow'], summary: 'List followers user',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'List followers' } },
        },
      },
      '/api/follow/{userId}/following': {
        get: {
          tags: ['Follow'], summary: 'List following user',
          parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'List following' } },
        },
      },

      // ── USERS ─────────────────────────────────────────────────
      '/api/users': {
        get: {
          tags: ['Users'], summary: 'List semua user dengan search (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'search', in: 'query', schema: { type: 'string' } },
            { name: 'page', in: 'query', schema: { type: 'integer' } },
          ],
          responses: { 200: { description: 'List user' }, 403: { description: 'Bukan admin' } },
        },
      },
      '/api/users/me': {
        put: {
          tags: ['Users'], summary: 'Update profil sendiri (username, avatar, password)',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { type:'object', properties: { username: { type:'string' }, avatarUrl: { type:'string' }, password: { type:'string' } } } } } },
          responses: { 200: { description: 'Profil diupdate' } },
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'], summary: 'Profil publik user',
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'Profil user + statistik' } },
        },
        delete: {
          tags: ['Users'], summary: 'Hapus user (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: { 200: { description: 'User dihapus' } },
        },
      },
      '/api/users/{id}/ban': {
        patch: {
          tags: ['Users'], summary: 'Ban / unban user (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type:'object', properties: { isBanned: { type:'boolean' } } } } } },
          responses: { 200: { description: 'Status ban diupdate' } },
        },
      },
      '/api/users/{id}/role': {
        patch: {
          tags: ['Users'], summary: 'Ganti role user (Admin only)',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { type:'object', properties: { role: { type:'string', enum:['user','moderator','admin'] } } } } } },
          responses: { 200: { description: 'Role diupdate' } },
        },
      },

      // ── MESSAGES ──────────────────────────────────────────────
      '/api/messages/requests': {
        post: {
          tags: ['Messages'],
          summary: 'Kirim message request ke user lain',
          description: 'Jika sudah saling follow → langsung buat conversation. Jika belum → kirim message request.',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendRequestBody' } } } },
          responses: {
            201: { description: 'Request terkirim atau conversation dibuat', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { type: { type: 'string', enum: ['request', 'conversation'] }, data: { type: 'object' } } } } } } } },
            400: { description: 'Tidak bisa kirim request ke diri sendiri' },
            401: { description: 'Unauthorized' },
            404: { description: 'User tidak ditemukan' },
            409: { description: 'Request sudah dikirim sebelumnya' },
          },
        },
        get: {
          tags: ['Messages'],
          summary: 'Ambil semua message request masuk (status: pending)',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'List message request masuk', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/MessageRequest' } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
      },
      '/api/messages/requests/{requestId}': {
        patch: {
          tags: ['Messages'],
          summary: 'Terima atau tolak message request',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RespondRequestBody' } } } },
          responses: {
            200: { description: 'Accept → mengembalikan conversation. Reject → mengembalikan request yang diupdate.' },
            403: { description: 'Bukan receiver dari request ini' },
            404: { description: 'Request tidak ditemukan' },
            409: { description: 'Request sudah di-handle sebelumnya' },
          },
        },
      },
      '/api/messages/conversations': {
        get: {
          tags: ['Messages'],
          summary: 'Ambil semua conversation (inbox) milik user',
          description: 'Diurutkan berdasarkan last_activity DESC. Termasuk info partner, last message, dan unread count.',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'List conversation', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Conversation' } } } } } } },
            401: { description: 'Unauthorized' },
          },
        },
        post: {
          tags: ['Messages'],
          summary: 'Buat conversation baru atau kembalikan yang sudah ada',
          security: [{ BearerAuth: [] }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateConvBody' } } } },
          responses: {
            201: { description: 'Conversation baru dibuat atau yang sudah ada dikembalikan', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Conversation' } } } } } },
            400: { description: 'Tidak bisa buat conversation dengan diri sendiri' },
            404: { description: 'Partner tidak ditemukan' },
          },
        },
      },
      '/api/messages/{conversationId}': {
        get: {
          tags: ['Messages'],
          summary: 'Ambil semua pesan dalam conversation (dengan pagination)',
          security: [{ BearerAuth: [] }],
          parameters: [
            { name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 50, maximum: 100 } },
          ],
          responses: {
            200: { description: 'List pesan dengan pagination', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } }, total: { type: 'integer' }, page: { type: 'integer' }, limit: { type: 'integer' }, hasMore: { type: 'boolean' } } } } } } } },
            403: { description: 'Bukan member dari conversation ini' },
            404: { description: 'Conversation tidak ditemukan' },
          },
        },
        post: {
          tags: ['Messages'],
          summary: 'Kirim pesan baru ke conversation',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/SendMessageBody' } } } },
          responses: {
            201: { description: 'Pesan terkirim', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { $ref: '#/components/schemas/Message' } } } } } },
            400: { description: 'Body atau attachment harus ada' },
            403: { description: 'Bukan member dari conversation ini' },
            404: { description: 'Conversation tidak ditemukan' },
          },
        },
        delete: {
          tags: ['Messages'],
          summary: 'Soft delete pesan (hanya sender yang bisa menghapus)',
          description: 'Parameter path di sini adalah messageId (bukan conversationId).',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'conversationId', in: 'path', required: true, description: 'messageId yang akan dihapus', schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Pesan berhasil dihapus (soft delete)' },
            403: { description: 'Bukan pengirim pesan ini' },
            404: { description: 'Pesan tidak ditemukan' },
            409: { description: 'Pesan sudah dihapus sebelumnya' },
          },
        },
      },
      '/api/messages/{conversationId}/read': {
        patch: {
          tags: ['Messages'],
          summary: 'Tandai semua pesan dari partner sebagai sudah dibaca',
          security: [{ BearerAuth: [] }],
          parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
          responses: {
            200: { description: 'Read receipts berhasil dibuat', content: { 'application/json': { schema: { properties: { success: { type: 'boolean' }, data: { type: 'object', properties: { markedCount: { type: 'integer', example: 5 } } } } } } } },
            403: { description: 'Bukan member dari conversation ini' },
            404: { description: 'Conversation tidak ditemukan' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
