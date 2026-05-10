import ChatShell from '@/components/chat/ChatShell'

export default function SellerChatPage() {
  return (
    <ChatShell
      chatPath="/seller/chat"
      pageTitle="Chat với khách hàng"
      searchPlaceholder="Tìm theo tên khách hàng"
      peerFallbackName="Khách hàng"
      bubbleMode="seller"
    />
  )
}
