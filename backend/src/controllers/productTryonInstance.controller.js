import { StatusCodes } from 'http-status-codes'
import * as productTryonInstanceService from '../services/productTryonInstance.service.js'

export const getTryonInstance = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    const instances =
      await productTryonInstanceService.listTryonInstancesForSeller(
        req.user.id,
        productId,
      )

    res.status(StatusCodes.OK).json({
      success: true,
      data: { instances, instance: instances[0] ?? null },
    })
  } catch (err) {
    next(err)
  }
}

export const saveTryonInstance = async (req, res, next) => {
  try {
    const productId = Number(req.params.id)
    const result = await productTryonInstanceService.saveTryonInstanceForSeller(
      req.user.id,
      productId,
      req.body,
    )

    res.status(StatusCodes.OK).json({
      success: true,
      data: result,
    })
  } catch (err) {
    next(err)
  }
}
