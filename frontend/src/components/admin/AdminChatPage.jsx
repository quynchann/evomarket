import React from 'react'
import ChatShell from '@/components/chat/ChatShell'

/**
 * Chat admin — giao diện chỉ còn vùng chat; thanh điều hướng dùng chung AdminLayout.
 */
export default function AdminChatPage() {
  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Chat với người bán</h1>
        <p className="mt-0.5 text-sm text-gray-600">Hỗ trợ người bán trên sàn</p>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden">
        <ChatShell
          chatPath="/admin/chat"
          pageTitle="Chat với người bán"
          searchPlaceholder="Tìm theo tên người bán"
          peerFallbackName="Người bán"
          bubbleMode="seller"
        />
      </div>
    </div>
  )
}
