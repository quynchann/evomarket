import { useState } from 'react'
import {
  Bell,
  Mail,
  MessageSquare,
  Package,
  Tag,
  Star,
  ShoppingBag,
} from 'lucide-react'

export default function NotificationSettings() {
  const [notificationSettings, setNotificationSettings] = useState({
    // Thông báo đơn hàng
    orderConfirmed: true,
    orderPreparing: true,
    orderShipped: true,
    orderDelivered: true,
    orderCancelled: true,

    // Thông báo khuyến mãi
    promotions: true,
    newVouchers: true,
    flashSale: true,
    exclusiveDeals: false,

    // Thông báo sản phẩm
    newProducts: false,
    productRestock: true,
    priceDrops: true,
    wishlistUpdates: true,

    // Thông báo đánh giá
    reviewReminder: true,
    reviewReplies: true,

    // Kênh nhận thông báo
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  })

  const handleToggle = (key) => {
    setNotificationSettings((prev) => {
      const newSettings = {
        ...prev,
        [key]: !prev[key],
      }

      // Auto-save when toggling
      // TODO: Call API to save notification settings
      console.log('Auto-saving notification settings:', newSettings)

      return newSettings
    })
  }

  const notificationGroups = [
    {
      id: 'orders',
      title: 'Thông báo đơn hàng',
      icon: Package,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Cập nhật trạng thái đơn hàng của bạn',
      items: [
        {
          key: 'orderConfirmed',
          label: 'Xác nhận đơn hàng',
          description: 'Khi đơn hàng được xác nhận',
        },
        {
          key: 'orderPreparing',
          label: 'Đang chuẩn bị hàng',
          description: 'Khi shop đang chuẩn bị sản phẩm',
        },
        {
          key: 'orderShipped',
          label: 'Đơn hàng đã gửi',
          description: 'Khi đơn hàng đã được gửi đi',
        },
        {
          key: 'orderDelivered',
          label: 'Giao hàng thành công',
          description: 'Khi đơn hàng đã được giao',
        },
        {
          key: 'orderCancelled',
          label: 'Hủy đơn hàng',
          description: 'Khi đơn hàng bị hủy',
        },
      ],
    },
    {
      id: 'promotions',
      title: 'Thông báo khuyến mãi',
      icon: Tag,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      description: 'Nhận thông tin về các chương trình ưu đãi',
      items: [
        {
          key: 'promotions',
          label: 'Chương trình khuyến mãi',
          description: 'Các chương trình giảm giá và ưu đãi',
        },
        {
          key: 'newVouchers',
          label: 'Voucher mới',
          description: 'Khi có voucher mới dành cho bạn',
        },
        {
          key: 'flashSale',
          label: 'Flash Sale',
          description: 'Thông báo về các đợt flash sale',
        },
        {
          key: 'exclusiveDeals',
          label: 'Ưu đãi độc quyền',
          description: 'Các ưu đãi dành riêng cho thành viên',
        },
      ],
    },
    {
      id: 'products',
      title: 'Thông báo sản phẩm',
      icon: ShoppingBag,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Cập nhật về sản phẩm bạn quan tâm',
      items: [
        {
          key: 'newProducts',
          label: 'Sản phẩm mới',
          description: 'Khi có sản phẩm mới ra mắt',
        },
        {
          key: 'productRestock',
          label: 'Hàng về lại',
          description: 'Khi sản phẩm yêu thích có hàng trở lại',
        },
        {
          key: 'priceDrops',
          label: 'Giảm giá',
          description: 'Khi sản phẩm yêu thích giảm giá',
        },
        {
          key: 'wishlistUpdates',
          label: 'Cập nhật danh sách yêu thích',
          description: 'Thay đổi về sản phẩm trong danh sách yêu thích',
        },
      ],
    },
    {
      id: 'reviews',
      title: 'Thông báo đánh giá',
      icon: Star,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      description: 'Nhắc nhở và phản hồi đánh giá',
      items: [
        {
          key: 'reviewReminder',
          label: 'Nhắc nhở đánh giá',
          description: 'Nhắc bạn đánh giá sản phẩm đã mua',
        },
        {
          key: 'reviewReplies',
          label: 'Phản hồi đánh giá',
          description: 'Khi có phản hồi cho đánh giá của bạn',
        },
      ],
    },
  ]

  const notificationChannels = [
    {
      key: 'emailNotifications',
      label: 'Thông báo qua Email',
      icon: Mail,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Nhận thông báo qua địa chỉ email của bạn',
    },
    {
      key: 'smsNotifications',
      label: 'Thông báo qua SMS',
      icon: MessageSquare,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      description: 'Nhận thông báo qua tin nhắn SMS',
    },
    {
      key: 'pushNotifications',
      label: 'Thông báo đẩy',
      icon: Bell,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      description: 'Nhận thông báo trực tiếp trên trình duyệt',
    },
  ]

  return (
    <div className="w-full">
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 px-4 py-6 lg:px-8 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800">
                  Cài đặt thông báo
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-red-100">
                <Bell className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Notification Groups */}
          {notificationGroups.map((group) => (
            <div key={group.id} className="rounded-2xl bg-white p-6 shadow-md">
              <div className="mb-4 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${group.iconBg}`}>
                  <group.icon className={`h-5 w-5 ${group.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {group.title}
                  </h3>
                  <p className="text-sm text-gray-600">{group.description}</p>
                </div>
              </div>

              <div className="space-y-2">
                {group.items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border-2 border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{item.label}</p>
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(item.key)}
                      className={`relative ml-4 h-6 w-12 shrink-0 rounded-full transition ${
                        notificationSettings[item.key]
                          ? 'bg-orange-500'
                          : 'bg-gray-300'
                      }`}>
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                          notificationSettings[item.key] ? 'right-1' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Notification Channels */}
          <div className="rounded-2xl bg-white p-6 shadow-md">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Bell className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Kênh nhận thông báo
                </h3>
                <p className="text-sm text-gray-600">
                  Chọn cách bạn muốn nhận thông báo
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {notificationChannels.map((channel) => (
                <div
                  key={channel.key}
                  className="flex items-center justify-between rounded-lg border-2 border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${channel.iconBg}`}>
                      <channel.icon
                        className={`h-5 w-5 ${channel.iconColor}`}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {channel.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {channel.description}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(channel.key)}
                    className={`relative ml-4 h-6 w-12 shrink-0 rounded-full transition ${
                      notificationSettings[channel.key]
                        ? 'bg-orange-500'
                        : 'bg-gray-300'
                    }`}>
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                        notificationSettings[channel.key] ? 'right-1' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
