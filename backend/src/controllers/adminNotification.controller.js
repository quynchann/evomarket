import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/api-error.js'
import * as notificationService from '../services/notification.service.js'

const ALLOWED_NOTIFY_ROLES = ['buyer', 'seller']

export const notifyByRole = async (req, res, next) => {
  try {
    const { role, type, title, message, metadata } = req.body || {}

    if (!role || !ALLOWED_NOTIFY_ROLES.includes(String(role))) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'role phải là buyer hoặc seller',
        'INVALID_ROLE',
      )
    }
    const t = title != null ? String(title).trim() : ''
    const m = message != null ? String(message).trim() : ''
    if (!t && !m) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        'Cần ít nhất title hoặc message',
        'INVALID_BODY',
      )
    }

    const data = await notificationService.createAndPushForAllUsersWithRole(
      String(role),
      {
        type: type != null ? String(type) : 'system_announcement',
        title: t || 'Thông báo',
        message: m || null,
        metadata: metadata ?? null,
      },
    )

    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}
