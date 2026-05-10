import { useCallback, useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { chatApi } from '@/services/chatApi'
import { useChatSocketStore } from '@/stores/useChatSocketStore'

function normalizeMessage(row) {
  if (!row) return null
  return {
    id: row.id,
    content: row.content,
    sender_id: row.sender_id ?? row.senderId,
    conversation_id: row.conversation_id ?? row.conversationId,
    created_at: row.created_at ?? row.createdAt,
    Sender: row.Sender,
  }
}

function normalizeSocketMessage(row) {
  if (!row) return null
  return normalizeMessage({
    id: row.id,
    content: row.content,
    senderId: row.senderId,
    conversationId: row.conversationId,
    createdAt: row.createdAt,
    Sender: row.Sender,
  })
}

function sortAscending(a, b) {
  const ta = new Date(a.created_at).getTime()
  const tb = new Date(b.created_at).getTime()
  return ta - tb
}

/**
 * Tin nhắn theo cuộc hội thoại + infinite scroll để tải tin cũ hơn.
 * Backend trả DESC; UI giữ danh sách theo thời gian tăng dần.
 *
 * react-intersection-observer: sentinel ở đầu viewport scroll root khi vào khung nhìn
 * → gọi API với `after: endCursor` (trang tin cũ tiếp theo).
 *
 * @param {number|string|null|undefined} conversationId
 */
export function useChatInfiniteMessages(conversationId) {
  const idRef = useRef(conversationId)
  idRef.current = conversationId

  const [scrollRoot, setScrollRoot] = useState(null)
  const scrollRootRefCallback = useCallback((node) => {
    setScrollRoot(node)
  }, [])

  const [messages, setMessages] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({
    hasOlder: false,
    endCursor: null,
  })

  const shouldStickBottomRef = useRef(true)

  /** @type {React.MutableRefObject<HTMLElement | null>} */
  const scrollRootStoreRef = useRef(null)

  useEffect(() => {
    scrollRootStoreRef.current = scrollRoot
  }, [scrollRoot])

  useEffect(() => {
    if (!scrollRoot) return undefined
    const el = scrollRoot
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight
      shouldStickBottomRef.current = dist < 72
    }
    el.addEventListener('scroll', onScroll)
    return () => el.removeEventListener('scroll', onScroll)
  }, [scrollRoot])

  useEffect(() => {
    if (!conversationId) return undefined
    const cid = Number(conversationId)
    if (!Number.isFinite(cid)) return undefined

    const chat = useChatSocketStore.getState()
    chat.clearConversationMessages(cid)
    chat.joinConversation(cid)

    const unsub = useChatSocketStore.subscribe((state, prevState) => {
      const list = state.messagesByConversation[cid]
      const prevList = prevState?.messagesByConversation?.[cid]
      if (list === prevList || !list?.length) return

      const normalized = list.map(normalizeSocketMessage).filter(Boolean)
      setMessages((prev) => mergeById(prev, normalized).sort(sortAscending))
      shouldStickBottomRef.current = true
    })

    return () => {
      unsub()
      chat.leaveConversation(cid)
    }
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) {
      setMessages([])
      setMeta({ hasOlder: false, endCursor: null })
      setError(null)
      setLoadingInitial(false)
      return
    }

    let cancelled = false

    async function fetchInitial() {
      setLoadingInitial(true)
      setError(null)

      try {
        const res = await chatApi.getMessages(conversationId, { limit: 40 })

        if (cancelled || idRef.current !== conversationId) return

        const raw = Array.isArray(res.data) ? res.data : []
        const chronological = raw
          .map(normalizeMessage)
          .filter(Boolean)
          .sort(sortAscending)

        setMessages(chronological)
        setMeta({
          hasOlder: Boolean(res.meta?.hasNextPage),
          endCursor: res.meta?.endCursor ?? null,
        })
        shouldStickBottomRef.current = true
      } catch (e) {
        if (!cancelled && idRef.current === conversationId) {
          setError(e.message || 'Không tải được tin nhắn')
          setMessages([])
        }
      } finally {
        if (!cancelled && idRef.current === conversationId) {
          setLoadingInitial(false)
        }
      }
    }

    fetchInitial()
    return () => {
      cancelled = true
    }
  }, [conversationId])

  useEffect(() => {
    const el = scrollRoot
    if (!el || !messages.length || loadingInitial) return
    if (!shouldStickBottomRef.current) return
    requestAnimationFrame(() => {
      if (scrollRootStoreRef.current) {
        scrollRootStoreRef.current.scrollTop =
          scrollRootStoreRef.current.scrollHeight
      }
    })
  }, [messages, loadingInitial, scrollRoot, conversationId])

  const loadOlder = useCallback(async () => {
    const cid = idRef.current
    if (
      !cid ||
      loadingOlder ||
      loadingInitial ||
      !meta.endCursor ||
      !meta.hasOlder
    )
      return

    const convAtStart = cid
    setLoadingOlder(true)

    const root = scrollRootStoreRef.current
    const prevScrollHeight = root?.scrollHeight ?? 0

    try {
      const res = await chatApi.getMessages(cid, {
        limit: 40,
        after: meta.endCursor,
      })

      if (idRef.current !== convAtStart) return

      const raw = Array.isArray(res.data) ? res.data : []
      const chunk = raw
        .map(normalizeMessage)
        .filter(Boolean)
        .sort(sortAscending)

      setMessages((prev) => mergeById(chunk, prev))
      setMeta({
        hasOlder: Boolean(res.meta?.hasNextPage),
        endCursor: res.meta?.endCursor ?? meta.endCursor,
      })

      requestAnimationFrame(() => {
        const r = scrollRootStoreRef.current
        if (r) {
          const delta = r.scrollHeight - prevScrollHeight
          r.scrollTop += delta
        }
      })
    } catch (_) {
      // Giữ UX; có thể bổ sung toast sau
    } finally {
      setLoadingOlder(false)
    }
  }, [
    loadingOlder,
    loadingInitial,
    meta.endCursor,
    meta.hasOlder,
  ])

  const { ref: topSentinelRef, inView } = useInView({
    root: scrollRoot,
    threshold: 0,
    rootMargin: '140px',
  })

  useEffect(() => {
    if (!conversationId || !inView) return
    if (loadingOlder || loadingInitial || !meta.hasOlder) return
    loadOlder()
  }, [
    conversationId,
    inView,
    loadingOlder,
    loadingInitial,
    meta.hasOlder,
    loadOlder,
  ])

  const sendText = useCallback(async (text) => {
    const cid = idRef.current
    const trimmed = text?.trim()
    if (!cid || !trimmed) return false

    try {
      const res = await chatApi.sendMessage(cid, trimmed)

      const row = normalizeMessage(res.data)

      if (row && idRef.current === cid) {
        setMessages((prev) => mergeById(prev, [row]).sort(sortAscending))
      }
      shouldStickBottomRef.current = true
      return true
    } catch (e) {
      setError(e.message || 'Gửi tin nhắn thất bại')
      return false
    }
  }, [])

  return {
    messages,
    loadingInitial,
    loadingOlder,
    error,
    hasOlder: meta.hasOlder,
    /** Gắn vào div scroll chứa danh sách tin */
    scrollRootRefCallback,
    /** Phần tử đặt NGAY ĐẦU danh sách tin trong scroll root */
    topSentinelRef,
    sendText,
    /** Trỏ xuống đáy khung tin (smooth) */
    scrollToBottomSmooth: () => {
      scrollRoot?.scrollTo({
        top: scrollRoot.scrollHeight,
        behavior: 'smooth',
      })
    },
  }
}

/** @param {Array} olderFirst @param {Array} newer */
function mergeById(olderFirst, newer) {
  const map = new Map()
  for (const m of olderFirst) map.set(m.id, m)
  for (const m of newer) map.set(m.id, m)
  return Array.from(map.values())
}
