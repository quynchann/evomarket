import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/api-error.js'
import * as notificationService from '../services/notification.service.js'

export const listMine = async (req, res, next) => {
  try {
    const userId = req.user.id
    const limit = req.query.limit
    const offset = req.query.offset
    const data = await notificationService.listForUser(userId, {
      limit,
      offset,
    })
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const getUnreadCount = async (req, res, next) => {
  try {
    const n = await notificationService.getUnreadCountForUser(req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data: { unreadCount: n },
    })
  } catch (err) {
    next(err)
  }
}

export const markOneRead = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isFinite(id)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'ID không hợp lệ', 'INVALID_ID')
    }
    const result = await notificationService.markAsReadForUser(req.user.id, id)
    if (!result.updated) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        'Không tìm thấy thông báo',
        'NOTIFICATION_NOT_FOUND',
      )
    }
    res.status(StatusCodes.OK).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export const markAllRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllReadForUser(req.user.id)
    res.status(StatusCodes.OK).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
