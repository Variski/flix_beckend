-- ============================================================
--  FLIX — DATABASE FINAL LENGKAP
--  Versi: Production-Ready
--  Jalankan file ini dari awal di database flix_db yang bersih
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
--  1. USERS
-- ============================================================
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    VARCHAR(500),
    role          TEXT         NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    is_banned     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ============================================================
--  2. GENRES
-- ============================================================
CREATE TABLE genres (
    id   SERIAL      PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO genres (name) VALUES
    ('Action'),('Comedy'),('Drama'),('Horror'),
    ('Romance'),('Sci-Fi'),('Thriller'),('Animation'),
    ('Documentary'),('Fantasy');

-- ============================================================
--  3. MOODS
-- ============================================================
CREATE TABLE moods (
    id        SERIAL      PRIMARY KEY,
    name      VARCHAR(50) NOT NULL UNIQUE,
    emoji     VARCHAR(10),
    color_hex VARCHAR(7)
);

INSERT INTO moods (name, emoji, color_hex) VALUES
    ('Santai',    '😌', '#74B9FF'),
    ('Seru',      '🔥', '#FD79A8'),
    ('Sedih',     '😢', '#A29BFE'),
    ('Romantis',  '❤️', '#FF7675'),
    ('Tegang',    '😱', '#FDCB6E'),
    ('Inspiratif','✨', '#55EFC4'),
    ('Lucu',      '😂', '#FFEAA7');

-- ============================================================
--  4. FILMS
-- ============================================================
CREATE TABLE films (
    id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    omdb_id          VARCHAR(20)  UNIQUE,
    title            VARCHAR(255) NOT NULL,
    release_year     SMALLINT,
    poster_url       VARCHAR(500),
    synopsis         TEXT,
    imdb_rating      NUMERIC(3,1),
    duration_minutes SMALLINT,
    director         VARCHAR(255),
    created_at       TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_films_title        ON films USING gin(to_tsvector('english', title));
CREATE INDEX idx_films_release_year ON films (release_year);
CREATE INDEX idx_films_imdb_rating  ON films (imdb_rating DESC);

-- ============================================================
--  5. FILM_GENRES & FILM_MOODS
-- ============================================================
CREATE TABLE film_genres (
    film_id  UUID    NOT NULL REFERENCES films(id)  ON DELETE CASCADE,
    genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (film_id, genre_id)
);

CREATE TABLE film_moods (
    film_id UUID    NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    mood_id INTEGER NOT NULL REFERENCES moods(id) ON DELETE CASCADE,
    PRIMARY KEY (film_id, mood_id)
);

-- ============================================================
--  6. RATINGS
-- ============================================================
CREATE TABLE ratings (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id    UUID      NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    score      SMALLINT  NOT NULL CHECK (score BETWEEN 1 AND 10),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, film_id)
);

CREATE INDEX idx_ratings_film_id ON ratings (film_id);
CREATE INDEX idx_ratings_user_id ON ratings (user_id);

-- ============================================================
--  7. REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    film_id    UUID      NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    content    TEXT      NOT NULL,
    is_spoiler BOOLEAN   NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, film_id)
);

CREATE INDEX idx_reviews_film_id ON reviews (film_id);

-- ============================================================
--  8. WATCHLISTS
-- ============================================================
CREATE TABLE watchlists (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id   UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL DEFAULT 'My Watchlist',
    is_shared  BOOLEAN      NOT NULL DEFAULT FALSE,
    share_code VARCHAR(12)  UNIQUE,
    created_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_watchlists_owner      ON watchlists (owner_id);
CREATE INDEX idx_watchlists_share_code ON watchlists (share_code) WHERE share_code IS NOT NULL;

CREATE TABLE watchlist_items (
    id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_id UUID      NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    film_id      UUID      NOT NULL REFERENCES films(id)      ON DELETE CASCADE,
    is_watched   BOOLEAN   NOT NULL DEFAULT FALSE,
    added_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (watchlist_id, film_id)
);

CREATE TABLE watchlist_members (
    watchlist_id UUID        NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
    user_id      UUID        NOT NULL REFERENCES users(id)       ON DELETE CASCADE,
    role         VARCHAR(10) NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'editor')),
    joined_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    PRIMARY KEY (watchlist_id, user_id)
);

-- ============================================================
--  9. DISCUSSIONS
-- ============================================================
CREATE TABLE discussions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    film_id     UUID         NOT NULL REFERENCES films(id) ON DELETE CASCADE,
    user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT         NOT NULL,
    category    VARCHAR(20)  NOT NULL DEFAULT 'general'
                             CHECK (category IN ('general','theory','review','question')),
    views_count INTEGER      NOT NULL DEFAULT 0,
    deleted_at  TIMESTAMP,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_discussions_film_id ON discussions (film_id);
CREATE INDEX idx_discussions_user_id ON discussions (user_id);
CREATE INDEX idx_discussions_created ON discussions (created_at DESC);

-- ============================================================
--  10. DISCUSSION_REPLIES
-- ============================================================
CREATE TABLE discussion_replies (
    id              UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    discussion_id   UUID      NOT NULL REFERENCES discussions(id)        ON DELETE CASCADE,
    user_id         UUID      NOT NULL REFERENCES users(id)              ON DELETE CASCADE,
    parent_reply_id UUID               REFERENCES discussion_replies(id) ON DELETE CASCADE,
    body            TEXT      NOT NULL,
    deleted_at      TIMESTAMP,
    created_at      TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_replies_discussion ON discussion_replies (discussion_id);
CREATE INDEX idx_replies_parent     ON discussion_replies (parent_reply_id);

-- ============================================================
--  11. LIKES (digabung jadi 1 tabel)
--  target_type: 'discussion' | 'reply'
-- ============================================================
CREATE TABLE likes (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT      NOT NULL CHECK (target_type IN ('discussion', 'reply')),
    target_id   UUID      NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX idx_likes_target ON likes (target_type, target_id);

-- ============================================================
--  12. DISCUSSION_TAGS
-- ============================================================
CREATE TABLE discussion_tags (
    discussion_id UUID        NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
    tag           VARCHAR(50) NOT NULL,
    PRIMARY KEY (discussion_id, tag)
);

CREATE INDEX idx_discussion_tags_tag ON discussion_tags (tag);

-- ============================================================
--  13. NOTIFICATIONS
-- ============================================================
CREATE TABLE notifications (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type       TEXT      NOT NULL CHECK (type IN (
                   'like_discussion', 'like_reply',
                   'reply_thread', 'nested_reply',
                   'watchlist_invite', 'new_follower'
               )),
    message    TEXT      NOT NULL,
    target_url TEXT,
    is_read    BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user    ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (user_id, is_read);

-- ============================================================
--  14. REPORTS (Sistem Moderasi)
--  target_type: 'discussion' | 'reply' | 'user'
--  status: 'pending' | 'resolved' | 'rejected'
-- ============================================================
CREATE TABLE reports (
    id          UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT      NOT NULL CHECK (target_type IN ('discussion', 'reply', 'user')),
    target_id   UUID      NOT NULL,
    reason      TEXT      NOT NULL,
    status      TEXT      NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','resolved','rejected')),
    resolved_by UUID               REFERENCES users(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_status ON reports (status);

-- ============================================================
--  15. FOLLOWS (Social Feature)
-- ============================================================
CREATE TABLE follows (
    follower_id  UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TIMESTAMP NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CHECK (follower_id <> following_id)
);

CREATE INDEX idx_follows_following ON follows (following_id);

-- ============================================================
--  16. ACTIVITY_LOGS
-- ============================================================
CREATE TABLE activity_logs (
    id         UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action     TEXT      NOT NULL,
    metadata   JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_user ON activity_logs (user_id);
CREATE INDEX idx_activity_logs_time ON activity_logs (created_at DESC);

-- ============================================================
--  VIEWS
-- ============================================================

-- Rata-rata rating per film
CREATE VIEW film_avg_ratings AS
SELECT
    f.id, f.title,
    ROUND(AVG(r.score), 2) AS avg_score,
    COUNT(r.id)            AS total_ratings
FROM films f
LEFT JOIN ratings r ON f.id = r.film_id
GROUP BY f.id, f.title;

-- Film berdasarkan mood
CREATE VIEW films_by_mood AS
SELECT
    m.name   AS mood_name,
    m.emoji  AS mood_emoji,
    f.id     AS film_id,
    f.title, f.poster_url, f.imdb_rating
FROM moods m
JOIN film_moods fm ON m.id = fm.mood_id
JOIN films f       ON f.id = fm.film_id
ORDER BY m.name, f.imdb_rating DESC;

-- Trending diskusi
CREATE VIEW trending_discussions AS
SELECT
    d.id, d.title, d.category, d.views_count,
    f.title    AS film_title,
    u.username AS author,
    COUNT(DISTINCT l.id)   AS likes_count,
    COUNT(DISTINCT dr.id)  AS replies_count,
    d.created_at
FROM discussions d
JOIN films f  ON d.film_id = f.id
JOIN users u  ON d.user_id = u.id
LEFT JOIN likes l              ON l.target_type = 'discussion' AND l.target_id = d.id
LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id
WHERE d.deleted_at IS NULL
GROUP BY d.id, d.title, d.category, d.views_count, f.title, u.username, d.created_at
ORDER BY likes_count DESC, d.views_count DESC;

-- Statistik diskusi per film
CREATE VIEW film_discussion_summary AS
SELECT
    f.id AS film_id, f.title,
    COUNT(DISTINCT d.id)  AS total_discussions,
    COUNT(DISTINCT dr.id) AS total_replies,
    COUNT(DISTINCT l.id)  AS total_likes
FROM films f
LEFT JOIN discussions d         ON f.id = d.film_id AND d.deleted_at IS NULL
LEFT JOIN discussion_replies dr ON d.id = dr.discussion_id AND dr.deleted_at IS NULL
LEFT JOIN likes l               ON l.target_type = 'discussion' AND l.target_id = d.id
GROUP BY f.id, f.title;