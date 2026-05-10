import { StatusCodes } from 'http-status-codes'
import * as cartService from '../services/cart.service.js'

export const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCartForUser(req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const addItem = async (req, res, next) => {
  try {
    const { productId, variantId, quantity } = req.body
    const data = await cartService.addOrUpdateItem(req.user.id, {
      productId: Number(productId),
      variantId: variantId != null ? Number(variantId) : null,
      quantity: Number(quantity)
    })
    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const updateItem = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id)
    const { quantity } = req.body
    const data = await cartService.updateLineQuantity(req.user.id, cartItemId, Number(quantity))
    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const removeItem = async (req, res, next) => {
  try {
    const cartItemId = Number(req.params.id)
    const data = await cartService.removeLine(req.user.id, cartItemId)
    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}

export const clearCart = async (req, res, next) => {
  try {
    const data = await cartService.clearCart(req.user.id)
    res.status(StatusCodes.OK).json({
      success: true,
      data
    })
  } catch (err) {
    next(err)
  }
}
