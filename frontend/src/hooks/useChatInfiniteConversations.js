import { useCallback, useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { chatApi } from '@/services/chatApi'
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { CHAT_EVENTS } from '@/sockets/socket.constants'

/**
 * Sidebar: danh sách hội thoại + infinite scroll cuối danh sách (`after`).
 */
export function useChatInfiniteConversations() {
  const [sidebarRoot, setSidebarRoot] = useState(null)
  const sidebarRefCallback = useCallback((node) => {
    setSidebarRoot(node)
  }, [])

  const [items, setItems] = useState([])
  const [loadingInitial, setLoadingInitial] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState({
    hasNextPage: false,
    endCursor: null,
  })

  const refresh = useCallback(async () => {
    setLoadingInitial(true)
    setError(null)

    try {
      const res = await chatApi.getConversations({ limit: 25 })
      setItems(Array.isArray(res.data) ? res.data : [])
      setMeta({
        hasNextPage: Boolean(res.meta?.hasNextPage),
        endCursor: res.meta?.endCursor ?? null,
      })
    } catch (e) {
      setError(e.message || 'Không tải được danh sách chat')
      setItems([])
    } finally {
      setLoadingInitial(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    let socket = null
    const onNew = (message) => {
      const cid = Number(message.conversationId)
      if (!Number.isFinite(cid)) return
      const at = message.createdAt
      const content = message.content ?? ''
      setItems((prev) => {
        const idx = prev.findIndex((c) => c.id === cid)
        if (idx < 0) {
          setTimeout(() => refresh(), 0)
          return prev
        }
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          last_message: content,
          last_message_at: at,
        }
        return next.sort((a, b) => {
          const ta = new Date(a.last_message_at || 0).getTime()
          const tb = new Date(b.last_message_at || 0).getTime()
          return tb - ta
        })
      })
    }

    const syncSocket = () => {
      const s = useChatSocketStore.getState().socket
      if (s === socket) return
      if (socket) socket.off(CHAT_EVENTS.MESSAGE_NEW, onNew)
      socket = s
      if (socket) socket.on(CHAT_EVENTS.MESSAGE_NEW, onNew)
    }

    syncSocket()
    const unsub = useChatSocketStore.subscribe(syncSocket)
    return () => {
      unsub()
      if (socket) socket.off(CHAT_EVENTS.MESSAGE_NEW, onNew)
    }
  }, [refresh])

  const fetchMore = useCallback(async () => {
    if (loadingMore || !meta.hasNextPage || meta.endCursor == null) return

    setLoadingMore(true)

    try {
      const res = await chatApi.getConversations({
        limit: 25,
        after: meta.endCursor,
      })

      const next = Array.isArray(res.data) ? res.data : []

      setItems((prev) => {
        const seen = new Set(prev.map((c) => c.id))
        const merged = [...prev]
        for (const c of next) {
          if (!seen.has(c.id)) {
            seen.add(c.id)
            merged.push(c)
          }
        }
        return merged
      })

      setMeta({
        hasNextPage: Boolean(res.meta?.hasNextPage),
        endCursor: res.meta?.endCursor ?? meta.endCursor,
      })
    } catch (e) {
      console.error(e)
      // Silent; UI vẫn hiển thị phần đã tải
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, meta.hasNextPage, meta.endCursor])

  const { ref: footerSentinelRef, inView } = useInView({
    root: sidebarRoot,
    threshold: 0,
    rootMargin: '96px',
  })

  useEffect(() => {
    if (!inView || loadingMore || loadingInitial || !meta.hasNextPage) return
    fetchMore()
  }, [inView, loadingMore, loadingInitial, meta.hasNextPage, fetchMore])

  return {
    conversations: items,
    loadingInitial,
    loadingMore,
    error,
    refresh,
    sidebarRefCallback,
    footerSentinelRef,
    hasMore: meta.hasNextPage,
  }
}
