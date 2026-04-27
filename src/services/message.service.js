const prisma = require('../config/prisma');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Pastikan user adalah member dari conversation
 */
const assertMember = async (convId, userId) => {
  const conv = await prisma.conversation.findUnique({ where: { id: convId } });
  if (!conv) { const err = new Error('Conversation not found'); err.statusCode = 404; throw err; }
  if (conv.userOneId !== userId && conv.userTwoId !== userId) {
    const err = new Error('Forbidden'); err.statusCode = 403; throw err;
  }
  return conv;
};

/**
 * Hitung UUID terkecil untuk memenuhi CHECK constraint (userOneId < userTwoId)
 */
const orderedPair = (a, b) => (a < b ? { userOneId: a, userTwoId: b } : { userOneId: b, userTwoId: a });

/**
 * Cek apakah dua user saling follow (A follow B DAN B follow A)
 */
const areMutualFollowers = async (userA, userB) => {
  const [ab, ba] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userA, followingId: userB } } }),
    prisma.follow.findUnique({ where: { followerId_followingId: { followerId: userB, followingId: userA } } }),
  ]);
  return !!(ab && ba);
};

// ─── Message Requests ─────────────────────────────────────────────────────────

const sendRequest = async (senderId, { receiverId, message }) => {
  if (senderId === receiverId) {
    const err = new Error('Cannot send request to yourself'); err.statusCode = 400; throw err;
  }

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) { const err = new Error('User not found'); err.statusCode = 404; throw err; }

  // Cek sudah saling follow
  const mutual = await areMutualFollowers(senderId, receiverId);

  if (mutual) {
    // Langsung buat conversation tanpa request
    const pair = orderedPair(senderId, receiverId);
    const existing = await prisma.conversation.findUnique({ where: { userOneId_userTwoId: pair } });
    if (existing) return { type: 'conversation', data: existing };

    const conv = await prisma.conversation.create({ data: pair });

    // Notifikasi
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'new_follower',   // reuse notif existing; tidak ada type message
        message: `${senderId} started a conversation with you`,
        targetUrl: `/messages/${conv.id}`,
      },
    }).catch(() => {}); // notifikasi bersifat opsional

    return { type: 'conversation', data: conv };
  }

  // Belum saling follow → buat message_request
  const existing = await prisma.messageRequest.findUnique({
    where: { senderId_receiverId: { senderId, receiverId } },
  });
  if (existing) {
    if (existing.status === 'pending') {
      const err = new Error('Request already sent'); err.statusCode = 409; throw err;
    }
    // Jika sebelumnya rejected, update ulang
    const updated = await prisma.messageRequest.update({
      where: { id: existing.id },
      data: { message, status: 'pending', updatedAt: new Date() },
    });
    return { type: 'request', data: updated };
  }

  const req = await prisma.messageRequest.create({
    data: { senderId, receiverId, message },
  });

  return { type: 'request', data: req };
};

const getIncomingRequests = async (userId) => {
  return prisma.messageRequest.findMany({
    where: { receiverId: userId, status: 'pending' },
    include: {
      sender: { select: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const respondRequest = async (requestId, userId, action) => {
  const req = await prisma.messageRequest.findUnique({ where: { id: requestId } });
  if (!req) { const err = new Error('Request not found'); err.statusCode = 404; throw err; }
  if (req.receiverId !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  if (req.status !== 'pending') { const err = new Error('Request already handled'); err.statusCode = 409; throw err; }

  if (action === 'reject') {
    const updated = await prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: 'rejected', updatedAt: new Date() },
    });
    return { type: 'request', data: updated };
  }

  // accept → buat conversation
  const pair = orderedPair(req.senderId, req.receiverId);
  const [conv] = await prisma.$transaction([
    prisma.conversation.upsert({
      where: { userOneId_userTwoId: pair },
      create: pair,
      update: {},
    }),
    prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: 'accepted', updatedAt: new Date() },
    }),
  ]);

  return { type: 'conversation', data: conv };
};

// ─── Conversations ────────────────────────────────────────────────────────────

const getConversations = async (userId) => {
  const convs = await prisma.conversation.findMany({
    where: { OR: [{ userOneId: userId }, { userTwoId: userId }] },
    include: {
      userOne: { select: { id: true, username: true, avatarUrl: true } },
      userTwo: { select: { id: true, username: true, avatarUrl: true } },
      lastMessage: { select: { id: true, body: true, contentType: true, createdAt: true, senderId: true } },
    },
    orderBy: { lastActivity: 'desc' },
  });

  // Hitung unread count per conversation
  const result = await Promise.all(
    convs.map(async (conv) => {
      const partner = conv.userOneId === userId ? conv.userTwo : conv.userOne;

      // Pesan dari partner yang belum ada di read_receipts user ini
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: partner.id,
          deletedAt: null,
          readReceipts: { none: { userId } },
        },
      });

      return {
        id: conv.id,
        partner,
        lastMessage: conv.lastMessage,
        lastActivity: conv.lastActivity,
        unreadCount,
        createdAt: conv.createdAt,
      };
    })
  );

  return result;
};

const createOrGetConversation = async (userId, partnerId) => {
  if (userId === partnerId) {
    const err = new Error('Cannot create conversation with yourself'); err.statusCode = 400; throw err;
  }
  const partner = await prisma.user.findUnique({ where: { id: partnerId } });
  if (!partner) { const err = new Error('User not found'); err.statusCode = 404; throw err; }

  const pair = orderedPair(userId, partnerId);
  const conv = await prisma.conversation.upsert({
    where: { userOneId_userTwoId: pair },
    create: pair,
    update: {},
    include: {
      userOne: { select: { id: true, username: true, avatarUrl: true } },
      userTwo: { select: { id: true, username: true, avatarUrl: true } },
    },
  });
  return conv;
};

// ─── Messages ─────────────────────────────────────────────────────────────────

const getMessages = async (convId, userId, { page = 1, limit = 50 } = {}) => {
  await assertMember(convId, userId);

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: convId, deletedAt: null },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        attachments: {
          include: {
            film: { select: { id: true, title: true, posterUrl: true } },
            cinepost: { select: { id: true, content: true } },
          },
        },
        readReceipts: { select: { userId: true, readAt: true } },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take,
    }),
    prisma.message.count({ where: { conversationId: convId, deletedAt: null } }),
  ]);

  return {
    messages,
    total,
    page: Number(page),
    limit: take,
    hasMore: skip + messages.length < total,
  };
};

const sendMessage = async (convId, senderId, { contentType = 'text', body, attachment }) => {
  const conv = await assertMember(convId, senderId);

  const partnerId = conv.userOneId === senderId ? conv.userTwoId : conv.userOneId;

  // Buat message beserta attachment (jika ada) dalam satu transaksi
  const message = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        conversationId: convId,
        senderId,
        contentType,
        body: body ?? null,
        ...(attachment
          ? {
              attachments: {
                create: {
                  mediaUrl: attachment.mediaUrl ?? null,
                  altText: attachment.altText ?? null,
                  filmId: attachment.filmId ?? null,
                  cinepostId: attachment.cinepostId ?? null,
                },
              },
            }
          : {}),
      },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
        attachments: {
          include: {
            film: { select: { id: true, title: true, posterUrl: true } },
            cinepost: { select: { id: true, content: true } },
          },
        },
      },
    });

    // Update conversation last_message + last_activity
    await tx.conversation.update({
      where: { id: convId },
      data: { lastMessageId: msg.id, lastActivity: new Date() },
    });

    return msg;
  });

  // Notifikasi ke partner (non-blocking)
  prisma.notification.create({
    data: {
      userId: partnerId,
      type: 'new_follower',       // placeholder – notif type bisa ditambahkan ke enum
      message: `${senderId} sent you a message`,
      targetUrl: `/messages/${convId}`,
    },
  }).catch(() => {});

  return message;
};

const markAsRead = async (convId, userId) => {
  const conv = await assertMember(convId, userId);
  const partnerId = conv.userOneId === userId ? conv.userTwoId : conv.userOneId;

  // Ambil semua pesan dari partner yang belum dibaca
  const unread = await prisma.message.findMany({
    where: {
      conversationId: convId,
      senderId: partnerId,
      deletedAt: null,
      readReceipts: { none: { userId } },
    },
    select: { id: true },
  });

  if (unread.length === 0) return { markedCount: 0 };

  // Bulk insert read receipts (skip duplikat)
  await prisma.messageReadReceipt.createMany({
    data: unread.map((m) => ({ messageId: m.id, userId })),
    skipDuplicates: true,
  });

  // Update status pesan menjadi 'read'
  await prisma.message.updateMany({
    where: { id: { in: unread.map((m) => m.id) } },
    data: { status: 'read' },
  });

  return { markedCount: unread.length };
};

const softDeleteMessage = async (msgId, userId) => {
  const msg = await prisma.message.findUnique({ where: { id: msgId } });
  if (!msg) { const err = new Error('Message not found'); err.statusCode = 404; throw err; }
  if (msg.senderId !== userId) { const err = new Error('Forbidden'); err.statusCode = 403; throw err; }
  if (msg.deletedAt) { const err = new Error('Message already deleted'); err.statusCode = 409; throw err; }

  await prisma.message.update({
    where: { id: msgId },
    data: { deletedAt: new Date() },
  });

  return { success: true };
};

module.exports = {
  sendRequest,
  getIncomingRequests,
  respondRequest,
  getConversations,
  createOrGetConversation,
  getMessages,
  sendMessage,
  markAsRead,
  softDeleteMessage,
};
