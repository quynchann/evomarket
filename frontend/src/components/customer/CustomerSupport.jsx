import { Link } from "react-router-dom";
import { Headphones, Mail, MessageCircle, ChevronDown, Package } from "lucide-react";

const faqs = [
  {
    q: "Tôi theo dõi đơn hàng ở đâu?",
    a: 'Vào "Đơn hàng của tôi" trong tài khoản để xem trạng thái và chi tiết từng đơn.',
  },
  {
    q: "Thanh toán VNPay bị lỗi thì sao?",
    a: "Kiểm tra kết nối mạng và thử lại. Nếu tiền đã trừ nhưng đơn chưa cập nhật, hãy liên hệ hotline hoặc chat với shop.",
  },
  {
    q: "Làm sao để đổi địa chỉ giao hàng?",
    a: "Trước khi thanh toán, cập nhật địa chỉ trong giỏ / thanh toán. Với đơn đã đặt, liên hệ shop càng sớm càng tốt qua Chat.",
  },
];

export default function CustomerSupport() {
  return (
    <div className="w-full">
      <div className="min-h-full px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="overflow-hidden rounded-2xl bg-linear-to-br from-orange-500 to-red-600 p-8 text-white shadow-lg">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Trung tâm hỗ trợ
                </h1>
                <p className="mt-2 max-w-xl text-sm text-orange-100 sm:text-base">
                  Chúng tôi luôn sẵn sàng hỗ trợ bạn về đơn hàng, thanh toán và trải
                  nghiệm mua sắm.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                <Headphones className="h-8 w-8" aria-hidden />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              to="/customer/chat"
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 text-left shadow-md transition hover:border-orange-200 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                <MessageCircle className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-semibold text-gray-900">Chat với shop</span>
              <span className="text-sm text-gray-600">
                Nhắn trực tiếp với người bán về sản phẩm hoặc đơn hàng
              </span>
            </Link>

            <Link
              to="/customer/orders"
              className="flex flex-col items-start gap-2 rounded-2xl border-2 border-gray-100 bg-white p-5 text-left shadow-md transition hover:border-orange-200 hover:shadow-lg"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Package className="h-5 w-5" aria-hidden />
              </span>
              <span className="font-semibold text-gray-900">Đơn hàng của tôi</span>
              <span className="text-sm text-gray-600">
                Xem trạng thái giao hàng và chi tiết đơn
              </span>
            </Link>

            <a
              href="mailto:support@evomarket.vn?subject=[EvoMarket]%20H%E1%BB%97%20tr%E1%BB%A3%20kh%C3%A1ch%20h%C3%A0ng"
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
          </div>

          <div className="rounded-2xl border border-orange-100 bg-orange-50/80 p-5 text-sm text-gray-800">
            <p className="font-medium text-orange-900">Giờ làm việc</p>
            <p className="mt-1 text-gray-700">
              Hotline <span className="font-semibold">1900 xxxx</span> — 8:00 – 22:00
              hằng ngày.
            </p>
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
