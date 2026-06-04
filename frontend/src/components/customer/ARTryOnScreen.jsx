import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, ShoppingCart, Loader2, Star } from 'lucide-react'
import { cartApi, syncCartQueryAfterMutation } from '../../services/cartApi'
import * as productApi from '../../services/productApi'
import FaceTryonScene from '../tryon/FaceTryonScene.jsx'
import { buildTryonSceneItems } from '../seller/tryon/tryonConfig.js'
import { stopMindarScene } from '../seller/tryon/useMindarSceneHost.js'

export default function ARTryOnScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const screenRef = useRef(null)

  useEffect(() => {
    return () => {
      stopMindarScene(screenRef.current)
    }
  }, [])

  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  })

  const product = productData?.data || location.state?.product

  const tryonItems = useMemo(() => {
    const instances = product?.tryonInstances || []
    const categoryName = product?.category?.name || ''
    return buildTryonSceneItems(instances, categoryName)
  }, [product])

  const addToCartMutation = useMutation({
    mutationFn: (payload) => cartApi.addItem(payload),
    onSuccess: (data) => {
      syncCartQueryAfterMutation(queryClient, data)
      toast.success('Đã thêm vào giỏ hàng')
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể thêm vào giỏ hàng')
    },
  })

  const handleBack = () => navigate(-1)

  const handleAddToCart = () => {
    if (!product) {
      toast.error('Không tìm thấy thông tin sản phẩm')
      return
    }
    addToCartMutation.mutate({
      productId: Number(id),
      variantId: null,
      quantity: 1,
    })
  }

  if (isLoadingProduct) {
    return (
      <div className="flex h-dvh items-center justify-center bg-gray-900 text-white">
        <Loader2 className="mr-2 h-10 w-10 animate-spin" />
        <p>Đang tải thông tin sản phẩm...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-gray-900 text-white">
        <p>Không tìm thấy thông tin sản phẩm</p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg bg-blue-600 px-6 py-2 hover:bg-blue-700">
          Quay lại
        </button>
      </div>
    )
  }

  if (!tryonItems.length) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-4 bg-gray-900 px-6 text-center text-white">
        <p className="text-lg font-medium">
          Sản phẩm chưa có cấu hình thử đồ AR
        </p>
        <p className="text-sm text-white/70">
          Người bán cần upload file .glb và lưu cấu hình AR trong form sản phẩm.
        </p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg bg-blue-600 px-6 py-2 hover:bg-blue-700">
          Quay lại
        </button>
      </div>
    )
  }

  return (
    <div
      ref={screenRef}
      className="relative h-dvh w-full overflow-hidden bg-black">
      <FaceTryonScene items={tryonItems} fullscreen />

      <div className="pointer-events-none absolute top-0 right-0 left-0 z-20 bg-linear-to-b from-black/70 to-transparent p-4">
        <div className="pointer-events-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
            <ArrowLeft className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 text-center">
            <p className="mb-1 text-xs text-white/80">
              Thử đồ ảo — di chuyển mặt để xem các góc
            </p>
            <h1 className="text-lg font-bold text-white drop-shadow-lg">
              {product.title}
            </h1>
          </div>

          <div className="h-10 w-10" />
        </div>
      </div>

      <div className="pointer-events-none absolute top-1/2 left-1/2 z-10 h-[60%] w-[70%] max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-full w-full">
          <div className="absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-white/40" />
          <div className="absolute top-0 right-0 h-16 w-16 border-t-2 border-r-2 border-white/40" />
          <div className="absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-white/40" />
          <div className="absolute right-0 bottom-0 h-16 w-16 border-r-2 border-b-2 border-white/40" />
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 bg-linear-to-t from-black/80 via-black/30 to-transparent p-4 pb-8">
        <div className="pointer-events-auto mx-auto flex max-w-4xl items-center gap-4">
          <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-800">
              <img
                src={
                  product.thumbnail ||
                  product.images?.[0] ||
                  '/placeholder-product.png'
                }
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-base font-semibold text-white">
                {product.title}
              </h3>
              <p className="text-xl font-bold text-white">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price || 0)}
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/90">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>
                    {product.ratingSummary?.average?.toFixed(1) || '0.0'}
                  </span>
                  <span className="text-white/60">
                    ({product.ratingSummary?.count || 0})
                  </span>
                </div>
                <span className="text-white/50">•</span>
                <span className="text-green-300">Còn {product.stock || 0}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="flex shrink-0 items-center gap-2 rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-5 py-3 text-white shadow-lg disabled:opacity-50">
              {addToCartMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span className="hidden font-semibold whitespace-nowrap sm:inline">
                Thêm vào giỏ
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
