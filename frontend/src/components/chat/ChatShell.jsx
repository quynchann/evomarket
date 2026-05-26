import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  Search,
  Camera,
  Send,
  Pin,
  ChevronDown,
  MoreHorizontal,
  ChevronLeft,
  X,
} from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChatSocketStore } from '@/stores/useChatSocketStore'
import { useSystemSocketStore } from '@/stores/useSystemSocketStore'
import { chatApi, chatQueryKeys } from '@/services/chatApi'
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
  const queryClient = useQueryClient()
  const currentUserId = useAuthStore((s) => s.user?.id)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [pinnedIds, setPinnedIds] = useState(() => new Set())
  const [mobileInboxOpen, setMobileInboxOpen] = useState(true)
  const [input, setInput] = useState('')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [totalUnread, setTotalUnread] = useState(0)
  const [selectedImages, setSelectedImages] = useState([])

  const imageInputRef = useRef(null)
  const typingStopTimerRef = useRef(null)
  const lastMarkedOpenConvRef = useRef(null)

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
    sendImage,
  } = useChatInfiniteMessages(activeConversationId)

  const refreshUnreadCount = useCallback(() => {
    chatApi
      .getUnreadCount()
      .then((res) => setTotalUnread(res.data?.unreadCount ?? 0))
      .catch(() => {})
  }, [])

  const bumpGlobalUnreadQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: chatQueryKeys.unreadCount })
  }, [queryClient])

  /** Đánh dấu đã đọc khi đang mở 1 cuộc (gồm redirect tự động tới cuộc đầu), tránh lệch Dashboard */
  useEffect(() => {
    if (activeConversationId == null) {
      lastMarkedOpenConvRef.current = null
      return
    }
    if (loadingConvList) return
    if (!conversations.some((c) => c.id === activeConversationId)) return
    if (lastMarkedOpenConvRef.current === activeConversationId) return

    let cancelled = false
    chatApi
      .markAsRead(activeConversationId)
      .then(() => {
        if (!cancelled) {
          lastMarkedOpenConvRef.current = activeConversationId
          refreshUnreadCount()
          bumpGlobalUnreadQueries()
        }
      })
      .catch(() => {
        toast.error('Không đánh dấu đã đọc được')
      })

    return () => {
      cancelled = true
    }
  }, [
    activeConversationId,
    loadingConvList,
    conversations,
    refreshUnreadCount,
    bumpGlobalUnreadQueries,
  ])

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

  const onlineUsers = useSystemSocketStore((s) => s.onlineUsers)

  const activePeerOnline = useMemo(() => {
    const pid = activeOther?.id
    if (pid == null) return false
    return onlineUsers.has(Number(pid))
  }, [activeOther?.id, onlineUsers])

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

  useEffect(() => {
    const mq =
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 768px)')
    if (mq.matches) return
    if (conversationIdParam) setMobileInboxOpen(false)
  }, [conversationIdParam])

  const selectConversation = (conv) => {
    navigate(`${chatPath}/${conv.id}`)
    setOpenMenuId(null)
    if (
      typeof window !== 'undefined' &&
      !window.matchMedia('(min-width: 768px)').matches
    ) {
      setMobileInboxOpen(false)
    }
  }

  const sendMessageText = async (text) => {
    const trimmed = text?.trim()
    if (!trimmed || activeConversationId == null) return
    const ok = await sendText(trimmed)
    if (ok) setInput('')
    else toast.error('Không gửi được tin nhắn')
  }

  const handleImageFiles = (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (activeConversationId == null) {
      toast.error('Vui lòng chọn cuộc trò chuyện')
      return
    }

    const newImages = []
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const preview = URL.createObjectURL(file)
      newImages.push({ file, preview, id: Date.now() + i })
    }
    setSelectedImages((prev) => [...prev, ...newImages])
  }

  const removeImage = (id) => {
    setSelectedImages((prev) => {
      const image = prev.find((img) => img.id === id)
      if (image) {
        URL.revokeObjectURL(image.preview)
      }
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleSendMessage = async () => {
    if (activeConversationId == null) return

    const hasText = input?.trim()
    const hasImages = selectedImages.length > 0

    if (!hasText && !hasImages) return

    // Send text message first if exists
    if (hasText) {
      const ok = await sendText(input.trim())
      if (!ok) {
        toast.error('Không gửi được tin nhắn')
        return
      }
      setInput('')
    }

    // Send images
    if (hasImages) {
      for (const image of selectedImages) {
        const ok = await sendImage(image.file)
        if (!ok) {
          toast.error(`Không gửi được ảnh ${image.file.name}`)
        }
      }
      // Clear all images after sending
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview))
      setSelectedImages([])
    }
  }

  // Cleanup preview URLs on unmount or conversation change
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [activeConversationId])

  // Clear selected images when changing conversation
  useEffect(() => {
    selectedImages.forEach((img) => URL.revokeObjectURL(img.preview))
    setSelectedImages([])
  }, [activeConversationId])

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
      bumpGlobalUnreadQueries()
      refresh()
      toast.success('Đã đánh dấu đã đọc')
    } catch {
      toast.error('Thao tác thất bại')
    }
    setOpenMenuId(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:h-16 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-lg font-semibold text-orange-600 sm:text-xl">
            {pageTitle}
          </h1>
          {totalUnread > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-500 px-2 text-xs font-bold text-white">
              {totalUnread}
            </span>
          )}
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 overflow-hidden md:flex-row">
        <aside
          className={`absolute inset-0 z-10 flex min-h-0 w-full shrink-0 flex-col border-gray-200 bg-white md:static md:z-auto md:inset-auto md:flex md:w-80 md:border-r ${
            mobileInboxOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className="shrink-0 border-b border-gray-200 p-3 sm:p-4">
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
              const otherOnline =
                other?.id != null && onlineUsers.has(Number(other.id))

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
                    <span
                      title={otherOnline ? 'Trực tuyến' : 'Ngoại tuyến'}
                      className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${
                        otherOnline ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      aria-hidden
                    />
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

        <div
          className={`relative flex min-h-0 min-w-0 flex-1 flex-col bg-gray-50 ${
            mobileInboxOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 md:justify-start md:px-6 md:py-3">
            <button
              type="button"
              aria-label="Danh sách hộp thư"
              className="mr-2 flex shrink-0 items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
              onClick={() => setMobileInboxOpen(true)}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-3">
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
                {activeConversationId != null && activeOther?.id != null && (
                  <span
                    title={
                      activePeerOnline ? 'Trực tuyến' : 'Ngoại tuyến'
                    }
                    className={`absolute right-0 bottom-0 h-3 w-3 rounded-full border-2 border-white ${
                      activePeerOnline ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                    aria-hidden
                  />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-gray-900">
                  {activeConversationId ? activeName : '—'}
                </h3>
                <p className="flex items-center gap-1.5 text-xs text-gray-500">
                  {!activeConversationId || activeOther?.id == null ? (
                    <>
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                      <span>Tin nhắn</span>
                    </>
                  ) : peerTyping ? (
                    <>
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                      <span className="italic text-gray-600">
                        Đang nhập…
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          activePeerOnline
                            ? 'bg-emerald-500'
                            : 'bg-gray-400'
                        }`}
                      />
                      <span
                        className={
                          activePeerOnline
                            ? 'text-emerald-700'
                            : 'text-gray-500'
                        }>
                        {activePeerOnline
                          ? 'Trực tuyến'
                          : 'Ngoại tuyến'}
                      </span>
                    </>
                  )}
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
                        className={`max-w-[calc(100vw-4rem)] rounded-lg ${
                          row.bubble.type === 'image' ? 'p-1' : 'p-2.5'
                        } sm:max-w-[65%] ${
                          mine
                            ? 'bg-orange-500 text-white'
                            : 'border border-gray-200 bg-gray-50'
                        }`}>
                        {row.bubble.type === 'text' && (
                          <div className="text-sm wrap-break-word">
                            {row.bubble.text}
                          </div>
                        )}
                        {row.bubble.type === 'image' && row.bubble.mediaUrl && (
                          <div className="overflow-hidden rounded">
                            <img
                              src={row.bubble.mediaUrl}
                              alt="Chat image"
                              className="max-h-60 max-w-full cursor-pointer object-contain"
                              onClick={() => window.open(row.bubble.mediaUrl, '_blank')}
                            />
                            {row.bubble.text && row.bubble.text !== '[Hình ảnh]' && (
                              <div className={`mt-1 px-1.5 text-sm ${mine ? 'text-white' : 'text-gray-800'}`}>
                                {row.bubble.text}
                              </div>
                            )}
                          </div>
                        )}
                        <div
                          className={`mt-0.5 text-right text-[10px] ${mine ? 'text-orange-50' : 'text-gray-400'} ${row.bubble.type === 'image' ? 'px-1.5' : ''}`}>
                          {formatChatTime(row.bubble.time)}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </>
            )}
          </div>

          <footer className="shrink-0 border-t border-gray-200 bg-white p-3">
            {selectedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedImages.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                    <img
                      src={image.preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
                      title="Xóa ảnh">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex h-9 w-9 items-center justify-center text-gray-500 transition hover:text-orange-600"
                title="Gửi ảnh">
                <Camera className="h-5 w-5" />
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
                    handleSendMessage()
                  }
                }}
                disabled={activeConversationId == null}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm transition outline-none focus:border-orange-500 disabled:bg-gray-100"
                placeholder="Nhập tin nhắn..."
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={activeConversationId == null || (!input.trim() && selectedImages.length === 0)}
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
              onChange={(e) => {
                handleImageFiles(e)
                if (imageInputRef.current) imageInputRef.current.value = ''
              }}
            />
          </footer>
        </div>
      </div>
    </div>
  )
}
