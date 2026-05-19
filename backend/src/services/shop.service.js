import { User, SellerShopFollow } from '../models/index.js'
import ApiError from '@/utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { getSellerTodayStats } from './order.service.js'
import { emitSellerTodayStats } from '@/sockets/emitters/system.emitter.js'
import { getSellerRatingSummary } from './review.service.js'

const shopDisplayName = (row) => {
  const u = row?.get ? row.get({ plain: true }) : row
  const sn = u?.shop_name != null ? String(u.shop_name).trim() : ''
  const fn = u?.fullname != null ? String(u.fullname).trim() : ''
  return sn || fn || 'Shop'
}

/**
 * @param {number} sellerId
 * @param {{ id: number, role: string } | null | undefined} viewer
 */
export const getPublicShopProfile = async (sellerId, viewer) => {
  const sid = Number(sellerId)
  if (!Number.isFinite(sid)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'ID shop không hợp lệ', 'INVALID_SELLER_ID')
  }

  const seller = await User.findOne({
    where: { id: sid, role: 'seller' },
    attributes: ['id', 'fullname', 'shop_name', 'avatar'],
  })
  if (!seller) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cửa hàng', 'SHOP_NOT_FOUND')
  }

  const followerCount = await SellerShopFollow.count({ where: { seller_id: sid } })

  const ratingSummary = await getSellerRatingSummary(sid)

  let isFollowing = false
  if (viewer?.role === 'buyer' && Number(viewer.id) !== sid) {
    const row = await SellerShopFollow.findOne({
      where: { seller_id: sid, follower_id: Number(viewer.id) },
    })
    isFollowing = Boolean(row)
  }

  return {
    seller: {
      id: seller.id,
      shopName: shopDisplayName(seller),
      fullname: seller.fullname || '',
      avatar: seller.avatar || null,
    },
    followerCount,
    ratingSummary,
    isFollowing,
  }
}

async function emitSellerStatsRefresh(sellerIdNum) {
  const stats = await getSellerTodayStats(sellerIdNum)
  emitSellerTodayStats(sellerIdNum, stats)
}

export const followShop = async (sellerId, followerId) => {
  const sid = Number(sellerId)
  const fid = Number(followerId)
  if (!Number.isFinite(sid) || !Number.isFinite(fid)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }
  if (sid === fid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Không thể theo dõi chính mình', 'INVALID_FOLLOW')
  }

  const seller = await User.findOne({
    where: { id: sid, role: 'seller' },
    attributes: ['id'],
  })
  if (!seller) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy cửa hàng', 'SHOP_NOT_FOUND')
  }

  const follower = await User.findByPk(fid, {
    attributes: ['id', 'role'],
  })
  if (!follower || follower.role !== 'buyer') {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      'Chỉ tài khoản khách có thể theo dõi shop',
      'FOLLOW_FORBIDDEN',
    )
  }

  const [, created] = await SellerShopFollow.findOrCreate({
    where: { seller_id: sid, follower_id: fid },
    defaults: { seller_id: sid, follower_id: fid },
  })

  await emitSellerStatsRefresh(sid)
  const followerCount = await SellerShopFollow.count({ where: { seller_id: sid } })

  return { followerCount, wasNew: Boolean(created) }
}

export const unfollowShop = async (sellerId, followerId) => {
  const sid = Number(sellerId)
  const fid = Number(followerId)
  if (!Number.isFinite(sid) || !Number.isFinite(fid)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tham số không hợp lệ', 'INVALID_PARAMS')
  }

  const deleted = await SellerShopFollow.destroy({
    where: { seller_id: sid, follower_id: fid },
  })

  await emitSellerStatsRefresh(sid)
  const followerCount = await SellerShopFollow.count({ where: { seller_id: sid } })

  return { followerCount, removed: deleted > 0 }
}
