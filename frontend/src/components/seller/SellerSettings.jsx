/**
 * Cài đặt kênh bán — cùng phong cách UI với tab Cài đặt ở trang hồ sơ khách hàng.
 */
export default function SellerSettings() {
  return (
    <div className="w-full">
      <div className="min-h-full px-4 py-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold text-gray-800">
                  Cài đặt
                </h1>
                <p className="text-sm text-gray-600">
                  Tuỳ chọn kênh người bán (một số mục đang mở rộng)
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-orange-100 to-red-100">
                <span className="text-xl" aria-hidden>
                  ⚙️
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-md">
            <h3 className="mb-6 text-lg font-semibold text-gray-800">Cài đặt</h3>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ngôn ngữ
                </label>
                <select className="w-full rounded-lg border-2 border-gray-300 px-4 py-2 outline-none transition focus:border-orange-500 md:w-1/2">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>

              <div>
                <h4 className="mb-3 font-semibold text-gray-800">Thông báo</h4>
                <div className="space-y-3">
                  {[
                    { label: "Thông báo đơn hàng mới", enabled: true },
                    { label: "Thông báo tin nhắn", enabled: true },
                    { label: "Thông báo qua email", enabled: false },
                  ].map((setting, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border-2 border-gray-200 p-4"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {setting.label}
                      </span>
                      <button
                        type="button"
                        className={`relative h-6 w-12 rounded-full transition ${
                          setting.enabled ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                            setting.enabled ? "right-1" : "left-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
