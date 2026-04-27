const express = require('express');
const router  = express.Router();
const { z }   = require('zod');

const ctrl              = require('../controllers/message.controller');
const { authenticate }  = require('../middleware/auth');
const { validate }      = require('../middleware/validate');

// Semua endpoint wajib autentikasi
router.use(authenticate);

// ─── Validasi Schemas ──────────────────────────────────────────────────────────

const uuidSchema    = z.string().uuid();
const pageSchema    = z.object({
  page:  z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

const sendRequestSchema = z.object({
  receiverId: z.string().uuid('receiverId harus UUID'),
  message:    z.string().max(500).optional(),
});

const respondRequestSchema = z.object({
  action: z.enum(['accept', 'reject'], { message: 'action harus "accept" atau "reject"' }),
});

const createConvSchema = z.object({
  partnerId: z.string().uuid('partnerId harus UUID'),
});

const sendMessageSchema = z.object({
  contentType: z.enum(['text', 'image', 'film_tag', 'cinethread_share']).optional().default('text'),
  body: z.string().max(5000).optional(),
  attachment: z.object({
    mediaUrl:   z.string().url().optional(),
    altText:    z.string().max(200).optional(),
    filmId:     z.string().uuid().optional(),
    cinepostId: z.string().uuid().optional(),
  }).optional(),
}).refine(
  (d) => d.body || d.attachment,
  { message: 'Pesan harus memiliki body atau attachment' }
);

// ─── Message Requests ──────────────────────────────────────────────────────────

/**
 * POST /api/messages/requests
 * Kirim message request ke user lain
 */
router.post(
  '/requests',
  validate(sendRequestSchema),
  ctrl.sendRequest
);

/**
 * GET /api/messages/requests
 * Ambil semua message request masuk (status pending)
 */
router.get('/requests', ctrl.getRequests);

/**
 * PATCH /api/messages/requests/:requestId
 * Terima atau tolak message request
 */
router.patch(
  '/requests/:requestId',
  validate({
    params: z.object({ requestId: uuidSchema }),
    body:   respondRequestSchema,
  }),
  ctrl.respondRequest
);

// ─── Conversations ─────────────────────────────────────────────────────────────

/**
 * GET /api/messages/conversations
 * Ambil semua conversation (inbox) milik user
 */
router.get('/conversations', ctrl.getConversations);

/**
 * POST /api/messages/conversations
 * Buat conversation baru atau kembalikan yang sudah ada
 */
router.post(
  '/conversations',
  validate(createConvSchema),
  ctrl.createConversation
);

// ─── Messages dalam Conversation ──────────────────────────────────────────────

/**
 * GET /api/messages/:conversationId
 * Ambil semua pesan dalam conversation (dengan pagination)
 */
router.get(
  '/:conversationId',
  validate({ params: z.object({ conversationId: uuidSchema }), query: pageSchema }),
  ctrl.getMessages
);

/**
 * POST /api/messages/:conversationId
 * Kirim pesan baru ke conversation
 */
router.post(
  '/:conversationId',
  validate({
    params: z.object({ conversationId: uuidSchema }),
    body:   sendMessageSchema,
  }),
  ctrl.sendMessage
);

/**
 * PATCH /api/messages/:conversationId/read
 * Tandai semua pesan dari partner sebagai sudah dibaca
 */
router.patch(
  '/:conversationId/read',
  validate({ params: z.object({ conversationId: uuidSchema }) }),
  ctrl.markAsRead
);

/**
 * DELETE /api/messages/:messageId
 * Soft delete pesan (hanya sender)
 */
router.delete(
  '/:messageId',
  validate({ params: z.object({ messageId: uuidSchema }) }),
  ctrl.deleteMessage
);

module.exports = router;
