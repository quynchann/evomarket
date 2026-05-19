import {
  User,
  UserNotification,
} from '../models/index.js'
import {
  emitNotificationToUser,
  emitUnreadCountUpdate,
} from '../sockets/emitters/system.emitter.js'

export function toNotificationDto(row) {
  if (!row) return null
  const plain = row.get ? row.get({ plain: true }) : row
  return {
    id: plain.id,
    type: plain.type,
    title: plain.title,
    message: plain.message,
    metadata: plain.metadata,
    readAt: plain.read_at,
    createdAt: plain.created_at,
  }
}

export async function getUnreadCountForUser(userId) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return 0
  return UserNotification.count({
    where: { user_id: uid, read_at: null },
  })
}

/**
 * Lưu DB, emit notification:new + cập nhật unread qua socket.
 */
export async function createAndPushUserNotification(
  userId,
  { type, title, message, metadata = null },
) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return null

  const row = await UserNotification.create({
    user_id: uid,
    type: String(type || 'system'),
    title: String(title || 'Thông báo'),
    message: message != null ? String(message) : null,
    metadata,
    read_at: null,
  })

  const createdAt =
    row.created_at?.toISOString?.() || new Date().toISOString()

  const payload = {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    createdAt,
    metadata: row.metadata,
  }

  emitNotificationToUser(uid, payload)

  const unread = await getUnreadCountForUser(uid)
  emitUnreadCountUpdate(uid, unread)

  return row
}

export async function listForUser(userId, { limit = 50, offset = 0 } = {}) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) {
    return { notifications: [], total: 0 }
  }
  const take = Math.min(100, Math.max(1, Number(limit) || 50))
  const skip = Math.max(0, Number(offset) || 0)

  const { rows, count } = await UserNotification.findAndCountAll({
    where: { user_id: uid },
    order: [['created_at', 'DESC']],
    limit: take,
    offset: skip,
  })

  return {
    notifications: rows.map(toNotificationDto),
    total: count,
  }
}

export async function markAsReadForUser(userId, notificationId) {
  const uid = Number(userId)
  const nid = Number(notificationId)
  if (!Number.isFinite(uid) || !Number.isFinite(nid)) {
    return { updated: false }
  }
  const row = await UserNotification.findOne({
    where: { id: nid, user_id: uid },
  })
  if (!row) return { updated: false }
  if (!row.read_at) {
    await row.update({ read_at: new Date() })
  }
  await row.reload()
  const unread = await getUnreadCountForUser(uid)
  emitUnreadCountUpdate(uid, unread)
  return { updated: true, notification: toNotificationDto(row) }
}

export async function markAllReadForUser(userId) {
  const uid = Number(userId)
  if (!Number.isFinite(uid)) return { updated: 0 }
  const [n] = await UserNotification.update(
    { read_at: new Date() },
    { where: { user_id: uid, read_at: null } },
  )
  const unread = await getUnreadCountForUser(uid)
  emitUnreadCountUpdate(uid, unread)
  return { updated: n }
}

/**
 * Gửi cùng một thông báo hệ thống tới mọi user đang ACTIVE của một role (buyer | seller).
 * Lưu DB + push socket + cập nhật unread từng người.
 */
export async function createAndPushForAllUsersWithRole(
  role,
  { type, title, message, metadata = null },
) {
  const roleStr = String(role || '')
  if (!['buyer', 'seller'].includes(roleStr)) {
    return { role: roleStr, recipientCount: 0 }
  }

  const rows = await User.findAll({
    where: { role: roleStr, account_status: 'ACTIVE' },
    attributes: ['id'],
    raw: true,
  })

  const ids = rows
    .map((r) => Number(r.id))
    .filter((id) => Number.isFinite(id))

  let recipientCount = 0
  for (const uid of ids) {
    await createAndPushUserNotification(uid, {
      type,
      title,
      message,
      metadata,
    })
    recipientCount += 1
  }

  return { role: roleStr, recipientCount }
}
