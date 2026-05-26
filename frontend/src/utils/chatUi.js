import { API_BASE_URL } from '@/services/apiRequest.js'

/** Người đối thoại trong Conversation (không phải user hiện tại). */
export function getOtherParticipant(conversation, currentUserId) {
  if (!conversation || currentUserId == null) return null
  const cid = Number(currentUserId)
  const u1 = Number(conversation.user1_id)
  return u1 === cid ? conversation.User2 : conversation.User1
}

/**
 * @param {object} msg — normalized từ useChatInfiniteMessages
 * @param {'seller'|'buyer'} mode — giao diện seller (seller/customer) hay buyer (user/shop)
 */
export function mapNormalizedMessageToBubble(msg, currentUserId, mode) {
  const uid = Number(currentUserId)
  const sid = Number(msg.sender_id)
  const isMine = sid === uid
  const who =
    mode === 'seller'
      ? isMine
        ? 'seller'
        : 'customer'
      : isMine
        ? 'user'
        : 'shop'

  const messageType = msg.message_type || 'text'
  const mediaUrl = msg.media_url ? resolveAvatarUrl(msg.media_url) : null

  return {
    id: msg.id,
    who,
    type: messageType,
    text: msg.content ?? '',
    mediaUrl,
    time: new Date(msg.created_at),
  }
}

/** Tin của user hiện tại (bong bóng bên phải) theo chế độ buyer/seller. */
export function isBubbleMine(who, mode) {
  return mode === 'buyer' ? who === 'user' : who === 'seller'
}

/** Chuẩn bị dòng hiển thị: divider ngày + tin (dùng chung customer/seller). */
export function buildChatBubbleRows(bubbles) {
  const rows = []
  let prevDay = null
  for (const m of bubbles) {
    const t = m.time
    if (prevDay == null || !isSameCalendarDay(prevDay, t)) {
      rows.push({
        kind: 'day',
        key: `day-${t.toDateString()}`,
        label: formatChatDayDivider(t),
      })
      prevDay = t
    }
    rows.push({ kind: 'msg', key: m.id, bubble: m })
  }
  return rows
}

export function resolveAvatarUrl(avatar) {
  if (!avatar) return null
  const s = String(avatar)
  if (/^https?:\/\//i.test(s)) return s
  const origin = API_BASE_URL.replace(/\/api-v1\/?$/, '')
  const path = s.startsWith('/') ? s : `/${s}`
  return `${origin}${path}`
}

function startOfLocalDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x.getTime()
}

/** So sánh hai Date có cùng ngày theo giờ local không. */
export function isSameCalendarDay(a, b) {
  if (!a || !b) return false
  return startOfLocalDay(a) === startOfLocalDay(b)
}

/**
 * Nhãn ngày trong khung chat (Hôm nay / Hôm qua / ngày đầy đủ).
 * @param {Date} date
 */
export function formatChatDayDivider(date) {
  if (!date || Number.isNaN(date.getTime())) return ''
  const d0 = startOfLocalDay(date)
  const today = startOfLocalDay(new Date())
  const dayMs = 24 * 60 * 60 * 1000
  if (d0 === today) return 'Hôm nay'
  if (d0 === today - dayMs) return 'Hôm qua'
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  })
}

/** Giờ trong chat: thống nhất 24h HH:mm (vd. 15:34), không phụ thuộc locale hệ thống. */
export function formatChatTime(value) {
  const d = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const h = d.getHours()
  const m = d.getMinutes()
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Thanh sidebar: giờ nếu hôm nay, ngày nếu ngày khác. */
export function formatSidebarTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  if (isSameCalendarDay(d, new Date())) {
    return formatChatTime(d)
  }
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
