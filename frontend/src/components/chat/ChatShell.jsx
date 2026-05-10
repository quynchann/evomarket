import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  Search,
  Camera,
  Mic,
  Send,
  Pin,
  ChevronDown,
  MoreHorizontal,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { chatApi } from '@/services/chatApi'
import { useChatInfiniteConversations } from '@/hooks/useChatInfiniteConversations'
import { useChatInfiniteMessages } from '@/hooks/useChatInfiniteMessages'
import {
  getOtherParticipant,
  mapNormalizedMessageToBubble,
  resolveAvatarUrl,
  formatSidebarTime,
  formatChatTime,
  buildChatBubbleRows,
  isBubbleMine,
} from '@/utils/chatUi.js'

const AVATAR_PLACEHOLDER =
  'flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-sm font-semibold text-white'

/**
 * @param {object} props
 * @param {string} props.chatPath — base: `/customer/chat` hoặc `/seller/chat`
 * @param {string} props.pageTitle
 * @param {string} props.searchPlaceholder
 * @param {string} props.peerFallbackName — tên mặc định đối thoại khi thiếu fullname
 * @param {'buyer'|'seller'} props.bubbleMode
 */
export default function ChatShell({
  chatPath,
  pageTitle,
  searchPlaceholder,
  peerFallbackName,
  bubbleMode,
}) {
  const { conversationId: conversationIdParam } = useParams()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [pinnedIds, setPinnedIds] = useState(() => new Set())
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [totalUnread, setTotalUnread] = useState(0)

  const imageInputRef = useRef(null)
  const audioInputRef = useRef(null)
  const typingStopTimerRef = useRef(null)

  const activeConversationId = useMemo(() => {
    if (conversationIdParam == null || conversationIdParam === '') return null
    const n = Number(conversationIdParam)
    return Number.isFinite(n) ? n : null
  }, [conversationIdParam])

  const {
    conversations,
    loadingInitial: loadingConvList,
    loadingMore: loadingMoreConv,
    error: convListError,
    refresh,
    sidebarRefCallback,
    footerSentinelRef,
  } = useChatInfiniteConversations()

  const {
    messages,
    loadingInitial: loadingMessages,
    loadingOlder,
    error: messagesError,
    scrollRootRefCallback,
    topSentinelRef,
    sendText,
  } = useChatInfiniteMessages(activeConversationId)

  const refreshUnreadCount = useCallback(() => {
    chatApi
      .getUnreadCount()
      .then((res) => setTotalUnread(res.data?.unreadCount ?? 0))
      .catch(() => {})
  }, [])

  useEffect(() => {
    refreshUnreadCount()
  }, [refreshUnreadCount])

  useEffect(() => {
    if (loadingConvList) return
    if (conversationIdParam != null && conversationIdParam !== '') return
    const first = conversations[0]?.id
    if (first != null) navigate(`${chatPath}/${first}`, { replace: true })
  }, [loadingConvList, conversationIdParam, conversations, navigate, chatPath])

  useEffect(() => {
    if (conversationIdParam == null || conversationIdParam === '') return
    if (activeConversationId != null) return
    toast.error('Đường dẫn chat không hợp lệ')
    const first = conversations[0]?.id
    navigate(first != null ? `${chatPath}/${first}` : chatPath, {
      replace: true,
    })
  }, [
    conversationIdParam,
    activeConversationId,
    conversations,
    navigate,
    chatPath,
  ])

  useEffect(() => {
    return () => {
      if (typingStopTimerRef.current) {
        clearTimeout(typingStopTimerRef.current)
        typingStopTimerRef.current = null
      }
      if (activeConversationId != null) {
        useChatSocketStore.getState().stopTyping(activeConversationId)
      }
    }
  }, [activeConversationId])

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      const other = getOtherParticipant(conv, currentUserId)
      const name = (other?.fullname || '').toLowerCase()
      const lm = (conv.last_message || '').toLowerCase()
      const q = query.toLowerCase()
      if (!name.includes(q) && !lm.includes(q)) return false
      if (filter === 'pinned') return pinnedIds.has(conv.id)
      return true
    })
  }, [conversations, currentUserId, query, filter, pinnedIds])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId],
  )

  const activeOther = activeConversation
    ? getOtherParticipant(activeConversation, currentUserId)
    : null
  const activeName = activeOther?.fullname || peerFallbackName
  const activeAvatarUrl = resolveAvatarUrl(activeOther?.avatar)

  const typingUserSet = useChatSocketStore((s) =>
    activeConversationId != null
      ? s.typingUsers[activeConversationId]
      : null,
  )
  const peerTyping =
    Boolean(typingUserSet) &&
    [...typingUserSet].some((id) => id !== currentUserId)

  const bubbles = useMemo(
    () =>
      messages.map((m) =>
        mapNormalizedMessageToBubble(m, currentUserId, bubbleMode),
      ),
    [messages, currentUserId, bubbleMode],
  )

  const bubbleRows = useMemo(
    () => buildChatBubbleRows(bubbles),
    [bubbles],
  )

  const selectConversation = async (conv) => {
    navigate(`${chatPath}/${conv.id}`)
    setOpenMenuId(null)
    try {
      await chatApi.markAsRead(conv.id)
      refreshUnreadCount()
    } catch {
      toast.error('Không đánh dấu đã đọc được')
    }
  }

  const sendMessageText = async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || activeConversationId == null) return
    const ok = await sendText(trimmed)
    if (ok) setInput('')
    else toast.error('Không gửi được tin nhắn')
  }

  const handleImageFiles = () => {
    toast.info('Gửi ảnh qua chat sẽ được bổ sung sau.')
  }

  const handleAudioFiles = () => {
    toast.info('Gửi âm thanh qua chat sẽ được bổ sung sau.')
  }

  const handlePinConversation = (conversationId) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(conversationId)) next.delete(conversationId)
      else next.add(conversationId)
      return next
    })
    setOpenMenuId(null)
  }

  const handleMarkAsRead = async (conversationId) => {
    try {
      await chatApi.markAsRead(conversationId)
      refreshUnreadCount()
      refresh()
      toast.success('Đã đánh dấu đã đọc')
    } catch {
      toast.error('Thao tác thất bại')
    }
    setOpenMenuId(null)
  }

  return (
    <div className="flex h-full flex-col overflow-auto bg-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-orange-600">{pageTitle}</h1>
          {totalUnread > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {totalUnread}
            </span>
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-80 shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="shrink-0 border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full rounded-md border border-gray-300 py-2 pr-3 pl-10 text-sm transition outline-none focus:border-orange-500"
                />
              </div>
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-9 appearance-none rounded-md border border-gray-300 bg-white pr-9 pl-3 text-sm text-gray-700 transition outline-none hover:bg-gray-50 focus:border-orange-500">
                  <option value="all">Tất cả</option>
                  <option value="pinned">Ghim</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </div>

          <div
            ref={sidebarRefCallback}
            className="min-h-0 flex-1 overflow-y-auto">
            {convListError && (
              <p className="p-4 text-center text-sm text-red-600">
                {convListError}
              </p>
            )}
            {loadingConvList && (
              <p className="p-4 text-center text-sm text-gray-500">
                Đang tải danh sách...
              </p>
            )}
            {!loadingConvList && filteredConversations.length === 0 && (
              <p className="p-4 text-center text-sm text-gray-500">
                Chưa có cuộc trò chuyện
              </p>
            )}
            {filteredConversations.map((conv) => {
              const other = getOtherParticipant(conv, currentUserId)
              const title = other?.fullname || peerFallbackName
              const av = resolveAvatarUrl(other?.avatar)
              const initial = title.charAt(0).toUpperCase()
              const pinned = pinnedIds.has(conv.id)

              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`relative flex w-full cursor-pointer items-start gap-3 border-b border-gray-100 p-4 transition hover:bg-gray-50 ${
                    activeConversationId === conv.id ? 'bg-orange-50' : ''
                  } ${openMenuId === conv.id ? 'z-[120]' : 'z-0'}`}>
                  <div className="relative shrink-0">
                    {av ? (
                      <img
                        src={av}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`h-12 w-12 ${AVATAR_PLACEHOLDER}`}>
                        {initial}
                      </div>
                    )}
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-1">
                      <div className="flex min-w-0 items-center gap-1">
                        {pinned && (
                          <Pin
                            className="h-3 w-3 shrink-0 text-orange-500"
                            fill="currentColor"
                          />
                        )}
                        <h4 className="truncate text-sm font-medium text-gray-900">
                          {title}
                        </h4>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-0.5">
                        <span className="text-xs text-gray-400">
                          {formatSidebarTime(conv.last_message_at)}
                        </span>
                        <div className="relative z-[130]">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setOpenMenuId(
                                openMenuId === conv.id ? null : conv.id,
                              )
                            }}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="relative z-[130] flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200">
                            <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          </button>

                          {openMenuId === conv.id && (
                            <>
                              <div
                                className="fixed inset-0 z-[125]"
                                role="presentation"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div
                                className="absolute top-full right-0 z-[140] mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-xl"
                                onClick={(e) => e.stopPropagation()}
                                role="presentation">
                                <button
                                  type="button"
                                  onClick={() => handlePinConversation(conv.id)}
                                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                  {pinned ? 'Bỏ ghim' : 'Ghim'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsRead(conv.id)}
                                  className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                  Đánh dấu đã đọc
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs text-gray-500">
                        {conv.last_message || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={footerSentinelRef} className="h-1 shrink-0" aria-hidden />
            {loadingMoreConv && (
              <p className="py-2 text-center text-xs text-gray-400">
                Đang tải thêm...
              </p>
            )}
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col bg-gray-50">
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                {activeAvatarUrl ? (
                  <img
                    src={activeAvatarUrl}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className={`h-11 w-11 ${AVATAR_PLACEHOLDER}`}>
                    {activeName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {activeConversationId ? activeName : '—'}
                </h3>
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  <span>Tin nhắn</span>
                </p>
              </div>
            </div>
          </header>

          <div
            ref={scrollRootRefCallback}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-white p-4"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(0,0,0,0.2) transparent',
            }}>
            <div ref={topSentinelRef} className="h-1 w-full shrink-0" aria-hidden />
            {messagesError && (
              <p className="text-center text-sm text-red-600">{messagesError}</p>
            )}
            {loadingOlder && (
              <p className="text-center text-xs text-gray-400">
                Đang tải tin cũ...
              </p>
            )}
            {loadingMessages && (
              <p className="py-8 text-center text-sm text-gray-500">
                Đang tải tin nhắn...
              </p>
            )}
            {!loadingMessages &&
              activeConversationId &&
              bubbles.length === 0 && (
                <p className="py-8 text-center text-sm text-gray-500">
                  Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.
                </p>
              )}

            {bubbleRows.length > 0 && (
              <>
                {bubbleRows.map((row) => {
                  if (row.kind === 'day') {
                    return (
                      <div key={row.key} className="flex justify-center">
                        <div className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          {row.label}
                        </div>
                      </div>
                    )
                  }
                  const mine = isBubbleMine(row.bubble.who, bubbleMode)
                  return (
                    <div
                      key={row.key}
                      className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[65%] rounded-lg p-2.5 ${
                          mine
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-200 bg-gray-50'
                        }`}>
                        {row.bubble.type === 'text' && (
                          <div className="text-sm wrap-break-word">
                            {row.bubble.text}
                          </div>
                        )}
                        <div
                          className={`mt-0.5 text-right text-[10px] ${mine ? 'text-orange-50' : 'text-gray-400'}`}>
                          {formatChatTime(row.bubble.time)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
            {peerTyping && (
              <p className="px-1 text-xs text-gray-500 italic">
                Đối phương đang nhập…
              </p>
            )}
          </div>

          <footer className="shrink-0 border-t border-gray-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-orange-600"
                title="Gửi ảnh">
                <Camera className="h-5 w-5" />
              </button>

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-orange-600"
                title="Gửi âm thanh">
                <Mic className="h-5 w-5" />
              </button>

              <input
                value={input}
                onChange={(e) => {
                  const v = e.target.value
                  setInput(v)
                  if (activeConversationId == null) return
                  const sock = useChatSocketStore.getState()
                  sock.startTyping(activeConversationId)
                  if (typingStopTimerRef.current) {
                    clearTimeout(typingStopTimerRef.current)
                  }
                  typingStopTimerRef.current = setTimeout(() => {
                    sock.stopTyping(activeConversationId)
                  }, 1500)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessageText(input)
                  }
                }}
                disabled={activeConversationId == null}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-orange-500 disabled:bg-gray-100"
                placeholder="Nhập tin nhắn..."
              />

              <button
                type="button"
                onClick={() => sendMessageText(input)}
                disabled={activeConversationId == null}
                className="flex h-9 w-9 items-center justify-center rounded-md bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-50">
                <Send className="h-4 w-4" />
              </button>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={() => {
                handleImageFiles()
                if (imageInputRef.current) imageInputRef.current.value = ''
              }}
            />
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={() => {
                handleAudioFiles()
                if (audioInputRef.current) audioInputRef.current.value = ''
              }}
            />
          </footer>
        </div>
      </div>
    </div>
  )
}
