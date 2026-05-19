import { UserAddress } from '../models/index.js'
import ApiError from '../utils/api-error.js'
import { StatusCodes } from 'http-status-codes'
import { Op } from 'sequelize'

const toDto = (row) => {
  const plain = row?.get ? row.get({ plain: true }) : row
  if (!plain) return null
  return {
    id: plain.id,
    label: plain.label || '',
    recipientFullname: plain.recipient_fullname || '',
    recipientPhone: plain.recipient_phone || '',
    address: plain.address || '',
    city: plain.city || '',
    state: plain.state || '',
    country: plain.country || '',
    isDefault: !!plain.is_default
  }
}

export const listAddressesForUser = async (userId) => {
  const rows = await UserAddress.findAll({
    where: { user_id: userId },
    order: [
      ['is_default', 'DESC'],
      ['id', 'ASC']
    ]
  })
  return rows.map((r) => toDto(r))
}

const parseBody = (body) => ({
  label: (body.label || body.name || '').toString().trim(),
  recipient_fullname: (body.recipientFullname || body.fullname || '').toString().trim(),
  recipient_phone: (body.recipientPhone || body.phone || '').toString().trim(),
  address: (body.address || '').toString().trim(),
  city: (body.city || '').toString().trim(),
  state: (body.state || '').toString().trim(),
  country: (body.country || 'Việt Nam').toString().trim(),
  is_default: Boolean(body.isDefault ?? body.is_default)
})

const validatePayload = (p) => {
  if (!p.recipient_fullname) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập họ tên người nhận', 'VALIDATION_ERROR')
  }
  if (!p.recipient_phone) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập số điện thoại', 'VALIDATION_ERROR')
  }
  if (!p.address) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập địa chỉ', 'VALIDATION_ERROR')
  }
}

export const createAddress = async (userId, body) => {
  const p = parseBody(body)
  if (!p.label) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập tên địa chỉ (VD: Nhà riêng)', 'VALIDATION_ERROR')
  }
  validatePayload(p)

  const count = await UserAddress.count({ where: { user_id: userId } })
  const is_default = p.is_default || count === 0

  if (is_default) {
    await UserAddress.update({ is_default: false }, { where: { user_id: userId } })
  }

  const row = await UserAddress.create({
    user_id: userId,
    label: p.label,
    recipient_fullname: p.recipient_fullname,
    recipient_phone: p.recipient_phone,
    address: p.address.substring(0, 200),
    city: p.city.substring(0, 50),
    state: p.state.substring(0, 50),
    country: p.country.substring(0, 50),
    zipcode: '',
    is_default
  })

  return toDto(row)
}

export const updateAddress = async (userId, addressId, body) => {
  const row = await UserAddress.findOne({
    where: { id: addressId, user_id: userId }
  })
  if (!row) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ', 'ADDRESS_NOT_FOUND')
  }

  const p = parseBody({ ...toDto(row), ...body })
  if (!p.label) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vui lòng nhập tên địa chỉ (VD: Nhà riêng)', 'VALIDATION_ERROR')
  }
  validatePayload(p)

  const wantsDefault = p.is_default

  if (wantsDefault) {
    await UserAddress.update({ is_default: false }, { where: { user_id: userId, id: { [Op.ne]: addressId } } })
  }

  if (!wantsDefault && row.is_default) {
    const other = await UserAddress.findOne({
      where: { user_id: userId, id: { [Op.ne]: addressId } },
      order: [['id', 'ASC']]
    })
    if (other) await other.update({ is_default: true })
  }

  await row.update({
    label: p.label,
    recipient_fullname: p.recipient_fullname,
    recipient_phone: p.recipient_phone,
    address: p.address.substring(0, 200),
    city: p.city.substring(0, 50),
    state: p.state.substring(0, 50),
    country: p.country.substring(0, 50),
    zipcode: '',
    is_default: wantsDefault
  })

  await row.reload()
  return toDto(row)
}

export const deleteAddress = async (userId, addressId) => {
  const row = await UserAddress.findOne({
    where: { id: addressId, user_id: userId }
  })
  if (!row) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ', 'ADDRESS_NOT_FOUND')
  }

  const wasDefault = row.is_default
  await row.destroy()

  if (wasDefault) {
    const first = await UserAddress.findOne({
      where: { user_id: userId },
      order: [['id', 'ASC']]
    })
    if (first) await first.update({ is_default: true })
  }

  return listAddressesForUser(userId)
}

export const setDefaultAddress = async (userId, addressId) => {
  const row = await UserAddress.findOne({
    where: { id: addressId, user_id: userId }
  })
  if (!row) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy địa chỉ', 'ADDRESS_NOT_FOUND')
  }

  await UserAddress.update({ is_default: false }, { where: { user_id: userId } })
  await row.update({ is_default: true })

  return listAddressesForUser(userId)
}
