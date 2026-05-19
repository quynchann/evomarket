import { StatusCodes } from 'http-status-codes'
import * as addressService from '../services/address.service.js'

export const listAddresses = async (req, res, next) => {
  try {
    const data = await addressService.listAddressesForUser(req.user.id)
    res.status(StatusCodes.OK).json({ success: true, data })
  } catch (err) {
    next(err)
  }
}

export const createAddress = async (req, res, next) => {
  try {
    const created = await addressService.createAddress(req.user.id, req.body)
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Đã thêm địa chỉ',
      data: created
    })
  } catch (err) {
    next(err)
  }
}

export const updateAddress = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const updated = await addressService.updateAddress(req.user.id, id, req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã cập nhật địa chỉ',
      data: updated
    })
  } catch (err) {
    next(err)
  }
}

export const deleteAddress = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const data = await addressService.deleteAddress(req.user.id, id)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã xóa địa chỉ',
      data
    })
  } catch (err) {
    next(err)
  }
}

export const setDefaultAddress = async (req, res, next) => {
  try {
    const id = Number(req.params.id)
    const data = await addressService.setDefaultAddress(req.user.id, id)
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Đã đặt địa chỉ mặc định',
      data
    })
  } catch (err) {
    next(err)
  }
}
