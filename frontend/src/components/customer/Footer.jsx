import logoEvo from "../../assets/logo-evo.png";

export default function Footer() {
  return (
    <footer className="mt-10 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white lg:mt-12">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg p-2">
                <img src={logoEvo} alt="EvoMarket Logo" className="h-full w-full object-contain" />
              </div>
              <h3 className="text-xl font-bold">
                <span className="text-orange-200">Evo</span>
                <span className="text-white">Market</span>
              </h3>
            </div>
            <p className="text-sm text-orange-100">
              Nền tảng mua sắm trực tuyến hàng đầu Việt Nam. Mang đến trải nghiệm mua sắm tuyệt vời nhất!
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-orange-100">
              <li><a href="#" className="hover:text-white transition">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 font-semibold">Hỗ trợ khách hàng</h4>
            <ul className="space-y-2 text-sm text-orange-100">
              <li>📞 Hotline: 1900 xxxx</li>
              <li>📧 Email: support@evomarket.vn</li>
              <li>🕐 8:00 - 22:00 (Tất cả các ngày)</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
