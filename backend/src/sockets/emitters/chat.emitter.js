/**
 * Chat Namespace Emitters
 * Helper functions để emit chat events từ business logic
 */

import { io } from '../index.js';
import { NAMESPACES, CHAT_EVENTS, ROOMS } from '../socket.constants.js';

/**
 * Get chat namespace instance
 * @returns {import('socket.io').Namespace}
 */
const getChatNamespace = () => {
  return io.of(NAMESPACES.CHAT);
};

/**
 * Broadcast tin nhắn mới trong conversation
 * @param {number|string} conversationId - ID của conversation
 * @param {object} message - Message data
 * @example
 * emitNewMessage('conv-123', {
 *   id: 1,
 *   conversationId: 'conv-123',
 *   senderId: 456,
 *   content: 'Xin chào!',
 *   createdAt: new Date().toISOString(),
 * });
 */
export const emitNewMessage = (conversationId, message) => {
  try {
    const chatNs = getChatNamespace();
    const roomName = ROOMS.CHAT.CONVERSATION(conversationId);
    
    chatNs.to(roomName).emit(CHAT_EVENTS.MESSAGE_NEW, message);
    
    console.log(`[Emitter] New message broadcast to conversation ${conversationId}`);
  } catch (error) {
    console.error('[Emitter] Error broadcasting new message:', error);
  }
};

/**
 * Emit typing indicator (bắt đầu typing)
 * @param {number|string} conversationId - ID của conversation
 * @param {number|string} userId - ID của user đang typing
 * @param {string} socketId - Socket ID để exclude sender (optional)
 * @example
 * emitTypingStart('conv-123', 456, 'socket-abc');
 */
export const emitTypingStart = (conversationId, userId, socketId = null) => {
  try {
    const chatNs = getChatNamespace();
    const roomName = ROOMS.CHAT.CONVERSATION(conversationId);
    
    const payload = {
      conversationId,
      userId,
      timestamp: new Date().toISOString(),
    };

    if (socketId) {
      // Emit cho tất cả trừ sender
      chatNs.to(roomName).except(socketId).emit(CHAT_EVENTS.TYPING_START, payload);
    } else {
      chatNs.to(roomName).emit(CHAT_EVENTS.TYPING_START, payload);
    }
    
    console.log(`[Emitter] Typing start indicator sent for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error('[Emitter] Error sending typing start:', error);
  }
};

/**
 * Emit typing indicator (ngừng typing)
 * @param {number|string} conversationId - ID của conversation
 * @param {number|string} userId - ID của user
 * @param {string} socketId - Socket ID để exclude sender (optional)
 * @example
 * emitTypingStop('conv-123', 456, 'socket-abc');
 */
export const emitTypingStop = (conversationId, userId, socketId = null) => {
  try {
    const chatNs = getChatNamespace();
    const roomName = ROOMS.CHAT.CONVERSATION(conversationId);
    
    const payload = {
      conversationId,
      userId,
      timestamp: new Date().toISOString(),
    };

    if (socketId) {
      chatNs.to(roomName).except(socketId).emit(CHAT_EVENTS.TYPING_STOP, payload);
    } else {
      chatNs.to(roomName).emit(CHAT_EVENTS.TYPING_STOP, payload);
    }
    
    console.log(`[Emitter] Typing stop indicator sent for user ${userId} in conversation ${conversationId}`);
  } catch (error) {
    console.error('[Emitter] Error sending typing stop:', error);
  }
};

/**
 * Broadcast read receipt trong conversation
 * @param {number|string} conversationId - ID của conversation
 * @param {number|string} messageId - ID của message đã đọc
 * @param {number|string} userId - ID của user đã đọc
 * @param {string} socketId - Socket ID để exclude sender (optional)
 * @example
 * emitMessageRead('conv-123', 789, 456, 'socket-abc');
 */
export const emitMessageRead = (conversationId, messageId, userId, socketId = null) => {
  try {
    const chatNs = getChatNamespace();
    const roomName = ROOMS.CHAT.CONVERSATION(conversationId);
    
    const payload = {
      conversationId,
      messageId,
      userId,
      timestamp: new Date().toISOString(),
    };

    if (socketId) {
      chatNs.to(roomName).except(socketId).emit(CHAT_EVENTS.MESSAGE_READ, payload);
    } else {
      chatNs.to(roomName).emit(CHAT_EVENTS.MESSAGE_READ, payload);
    }
    
    console.log(`[Emitter] Message read receipt sent for message ${messageId} by user ${userId}`);
  } catch (error) {
    console.error('[Emitter] Error sending read receipt:', error);
  }
};

/**
 * Gửi notification về conversation mới (ví dụ: có người bắt đầu chat)
 * Có thể emit về /system namespace để trigger notification badge
 * @param {number|string} userId - User nhận notification
 * @param {object} conversationData - Data về conversation mới
 * @example
 * emitNewConversation(123, {
 *   id: 'conv-456',
 *   participantId: 789,
 *   participantName: 'Nguyễn Văn A',
 *   lastMessage: 'Xin chào, tôi quan tâm sản phẩm...',
 * });
 */
export const emitNewConversation = (userId, conversationData) => {
  try {
    // Có thể emit qua system namespace hoặc custom event
    const systemNs = io.of(NAMESPACES.SYSTEM);
    const roomName = `user:${userId}`;
    
    systemNs.to(roomName).emit('conversation:new', conversationData);
    
    console.log(`[Emitter] New conversation notification sent to user ${userId}`);
  } catch (error) {
    console.error('[Emitter] Error sending new conversation notification:', error);
  }
};
