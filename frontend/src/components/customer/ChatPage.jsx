import ChatShell from '@/components/chat/ChatShell'

export default function ChatPage() {
  return (
    <ChatShell
      chatPath="/customer/chat"
      pageTitle="Chat"
      searchPlaceholder="Tìm theo tên"
      peerFallbackName="Cửa hàng"
      bubbleMode="buyer"
    />
  )
}
