import { useNavigate } from "react-router-dom";
import { Headphones, Mail, MessageCircle, ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Làm sao để cập nhật trạng thái đơn hàng?",
    a: 'Vào mục "Đơn hàng", chọn đơn cần xử lý và cập nhật trạng thái giao/nhận phù hợp.',
  },
  {
    q: "Khách hàng nhắn tin — tôi trả lời ở đâu?",
    a: "Dùng mục Chat trên menu kênh bán để trao đổi với khách theo từng cuộc hội thoại.",
  },
  {
    q: "Mã khuyến mãi áp dụng thế nào?",
    a: "Tạo và quản lý mã trong mục Khuyến mãi. Khách có thể nhập mã khi thanh toán theo quy tắc bạn thiết lập.",
  },
];

export default function SellerSupport() {
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="min-h-full px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Trung tâm hỗ trợ người bán
                </h1>
                <p className="mt-2 max-w-xl text-sm text-orange-100 sm:text-base">
                  EvoMarket đồng hành cùng shop — liên hệ nhanh hoặc xem các câu hỏi
                  thường gặp.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Headphones className="h-8 w-8" aria-hidden />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/seller/chat")}
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 text-left shadow-md transition hover:border-orange-200 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-semibold text-gray-900">Chat hỗ trợ</span>
              <span className="text-sm text-gray-600">
                Trò chuyện với khách hoặc theo dõi tin nhắn hệ thống
              </span>
            </button>

            <a
              href="mailto:support@evomarket.vn?subject=[EvoMarket%20Seller]%20Y%C3%AAu%20c%E1%BA%A7u%20h%E1%BB%97%20tr%E1%BB%A3"
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 text-left shadow-md transition hover:border-orange-200 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-semibold text-gray-900">Email</span>
              <span className="text-sm text-gray-600 break-all">
                support@evomarket.vn
              </span>
            </a>

            <div className="flex flex-col items-start gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <span className="text-lg" aria-hidden>
                  📞
                </span>
              </span>
              <span className="font-semibold text-gray-900">Hotline</span>
              <span className="text-sm text-gray-600">1900 xxxx</span>
              <span className="text-xs text-gray-500">8:00 – 22:00 mỗi ngày</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h2 className="mb-4 text-lg font-semibold text-gray-800">
              Câu hỏi thường gặp
            </h2>
            <div className="divide-y divide-gray-100">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="group py-3 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-medium text-gray-800">
                    {item.q}
                    <ChevronDown className="h-5 w-5 shrink-0 text-gray-400 transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
