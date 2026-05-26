/**
 * System Namespace Emitters
 * Helper functions để emit events từ business logic (services, controllers)
 */

import { io } from '../index.js';
import { NAMESPACES, SYSTEM_EVENTS, ROOMS } from '../socket.constants.js';

/**
 * Cập nhật nhanh thống kê “hôm nay” lên dashboard seller (qua /system).
 */
export const emitSellerTodayStats = (sellerId, stats) => {
  try {
    const sid = Number(sellerId);
    if (!Number.isFinite(sid)) return;
    const systemNs = io.of(NAMESPACES.SYSTEM);
    const roomName = ROOMS.SYSTEM.PERSONAL(sid);
    systemNs.to(roomName).emit(SYSTEM_EVENTS.SELLER_TODAY_STATS, {
      revenueVnd: stats.revenueVnd,
      ordersToday: stats.ordersToday,
      visitorsToday: stats.visitorsToday,
      followerCount: stats.followerCount,
      ratingSummary: stats.ratingSummary ?? { average: null, count: 0 },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Emitter] emitSellerTodayStats:', error);
  }
};

/**
 * Get system namespace instance
 * @returns {import('socket.io').Namespace}
 */
const getSystemNamespace = () => {
  return io.of(NAMESPACES.SYSTEM);
};

/**
 * Gửi notification cho 1 user cụ thể (personal room)
 * @param {number|string} userId - ID của user nhận notification
 * @param {object} notification - Notification data
 * @example
 * emitNotificationToUser(123, {
 *   id: 1,
 *   type: 'order_status',
 *   title: 'Đơn hàng đã được xác nhận',
 *   message: 'Đơn hàng #12345 đã được người bán xác nhận',
 *   createdAt: new Date().toISOString(),
 * });
 */
export const emitNotificationToUser = (userId, notification) => {
  try {
    const systemNs = getSystemNamespace();
    const roomName = ROOMS.SYSTEM.PERSONAL(userId);
    
    systemNs.to(roomName).emit(SYSTEM_EVENTS.NOTIFICATION_NEW, notification);
    
    console.log(`[Emitter] Notification sent to user ${userId}:`, notification.type);
  } catch (error) {
    console.error('[Emitter] Error sending notification to user:', error);
  }
};

/**
 * Gửi notification cho toàn bộ users có cùng role (role room)
 * @param {string} role - Role name (seller, customer, admin)
 * @param {object} notification - Notification data
 * @example
 * emitNotificationToRole('seller', {
 *   type: 'system_announcement',
 *   title: 'Cập nhật chính sách hoa hồng',
 *   message: 'Từ ngày 1/1/2026, tỷ lệ hoa hồng sẽ thay đổi',
 * });
 */
export const emitNotificationToRole = (role, notification) => {
  try {
    const systemNs = getSystemNamespace();
    const roomName = ROOMS.SYSTEM.ROLE(role);
    
    systemNs.to(roomName).emit(SYSTEM_EVENTS.NOTIFICATION_NEW, notification);
    
    console.log(`[Emitter] Notification sent to role ${role}:`, notification.type);
  } catch (error) {
    console.error('[Emitter] Error sending notification to role:', error);
  }
};

/**
 * Gửi notification broadcast cho tất cả users (global room)
 * @param {object} notification - Notification data
 * @example
 * emitNotificationGlobal({
 *   type: 'maintenance',
 *   title: 'Bảo trì hệ thống',
 *   message: 'Hệ thống sẽ bảo trì từ 2h-4h sáng ngày 1/1/2026',
 *   priority: 'high',
 * });
 */
export const emitNotificationGlobal = (notification) => {
  try {
    const systemNs = getSystemNamespace();
    const roomName = ROOMS.SYSTEM.GLOBAL();
    
    systemNs.to(roomName).emit(SYSTEM_EVENTS.NOTIFICATION_NEW, notification);
    
    console.log(`[Emitter] Global notification sent:`, notification.type);
  } catch (error) {
    console.error('[Emitter] Error sending global notification:', error);
  }
};

/**
 * Update số lượng notifications chưa đọc cho user
 * @param {number|string} userId - ID của user
 * @param {number} unreadCount - Số lượng notifications chưa đọc
 * @example
 * emitUnreadCountUpdate(123, 5);
 */
export const emitUnreadCountUpdate = (userId, unreadCount) => {
  try {
    const systemNs = getSystemNamespace();
    const roomName = ROOMS.SYSTEM.PERSONAL(userId);
    
    systemNs.to(roomName).emit(SYSTEM_EVENTS.NOTIFICATION_UNREAD_UPDATE, {
      unreadCount,
      timestamp: new Date().toISOString(),
    });
    
    console.log(`[Emitter] Unread count updated for user ${userId}: ${unreadCount}`);
  } catch (error) {
    console.error('[Emitter] Error updating unread count:', error);
  }
};

/**
 * Gửi notification cho nhiều users cùng lúc
 * @param {Array<number|string>} userIds - Array of user IDs
 * @param {object} notification - Notification data
 * @example
 * emitNotificationToUsers([123, 456, 789], {
 *   type: 'promotion',
 *   title: 'Khuyến mãi đặc biệt',
 *   message: 'Giảm giá 50% cho khách hàng thân thiết',
 * });
 */
export const emitNotificationToUsers = (userIds, notification) => {
  try {
    const systemNs = getSystemNamespace();
    
    userIds.forEach((userId) => {
      const roomName = ROOMS.SYSTEM.PERSONAL(userId);
      systemNs.to(roomName).emit(SYSTEM_EVENTS.NOTIFICATION_NEW, notification);
    });
    
    console.log(`[Emitter] Notification sent to ${userIds.length} users:`, notification.type);
  } catch (error) {
    console.error('[Emitter] Error sending notification to multiple users:', error);
  }
};

/**
 * Thông báo realtime cho người mua khi trạng thái đơn đổi (seller cập nhật).
 * @param {number|string} buyerUserId - user_id chủ đơn
 * @param {{ orderId: number, status: string, title?: string, message?: string }} payload
 */
export const emitOrderStatusUpdatedToBuyer = (buyerUserId, payload) => {
  try {
    const systemNs = getSystemNamespace();
    const roomName = ROOMS.SYSTEM.PERSONAL(buyerUserId);
    systemNs.to(roomName).emit(SYSTEM_EVENTS.ORDER_STATUS_UPDATED, {
      orderId: payload.orderId,
      status: payload.status,
      title: payload.title,
      message: payload.message,
      timestamp: new Date().toISOString(),
    });
    console.log(
      `[Emitter] Order ${payload.orderId} status → ${payload.status} → buyer ${buyerUserId}`,
    );
  } catch (error) {
    console.error('[Emitter] Error emitting order status to buyer:', error);
  }
};

/**
 * Thông báo realtime khi stock của sản phẩm thay đổi (mua hàng / trả hàng)
 * @param {number} productId - ID sản phẩm
 * @param {number} newStock - Số lượng còn lại mới
 * @param {number} sold - Số lượng đã bán
 * @param {number} sellerId - ID người bán (để thông báo riêng cho seller)
 * @example
 * emitProductStockUpdated(123, 45, 55, 10);
 */
export const emitProductStockUpdated = (productId, newStock, sold, sellerId) => {
  try {
    const systemNs = getSystemNamespace();
    
    // Broadcast cho tất cả clients đang xem sản phẩm này (global room)
    systemNs.emit(SYSTEM_EVENTS.PRODUCT_STOCK_UPDATED, {
      productId: Number(productId),
      stock: Number(newStock),
      sold: Number(sold),
      inStock: Number(newStock) > 0,
      timestamp: new Date().toISOString(),
    });
    
    // Thông báo riêng cho seller (trong personal room của seller)
    if (sellerId != null) {
      const sellerRoom = ROOMS.SYSTEM.PERSONAL(sellerId);
      systemNs.to(sellerRoom).emit(SYSTEM_EVENTS.PRODUCT_STOCK_UPDATED, {
        productId: Number(productId),
        stock: Number(newStock),
        sold: Number(sold),
        inStock: Number(newStock) > 0,
        isSellerProduct: true,
        timestamp: new Date().toISOString(),
      });
    }
    
    console.log(
      `[Emitter] Product ${productId} stock updated → stock: ${newStock}, sold: ${sold}`,
    );
  } catch (error) {
    console.error('[Emitter] Error emitting product stock update:', error);
  }
};
