import { StatusCodes } from 'http-status-codes'
import * as reviewService from '../services/review.service.js'

/**
 * POST /api/reviews — mỗi order_item chỉ được đánh giá một lần (không cập nhật sau đó).
 * Body: { order_item_id, rating (1-5), comment? }
 */
export const createReview = async (req, res, next) => {
  try {
    const { order_item_id, rating, comment } = req.body ?? {}
    const review = await reviewService.submitBuyerProductReview(req.user.id, {
      order_item_id,
      rating,
      comment,
    })
    res.status(StatusCodes.OK).json({ success: true, data: { review } })
  } catch (err) {
    next(err)
  }
}
