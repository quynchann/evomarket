import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Camera,
  ChevronDown,
  Save,
  Send,
  Loader2,
  Check,
} from 'lucide-react'
import apiService from '../../services/api.js'
import { useAuthStore } from '../../stores/useAuthStore.js'
import TryonModelPreview from './tryon/TryonModelPreview.jsx'
import {
  DEFAULT_TRYON_CONFIG,
  TRYON_TYPE_META,
  arSettingsToTryonConfig,
  applyTypeToConfig,
  resolveTryOnTypeFromCategory,
  tryonConfigToTransform,
  tryonInstanceToConfig,
  tryonInstancesToConfig,
} from './tryon/tryonConfig.js'

export default function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((s) => s.accessToken)
  const fileInputRef = useRef(null)
  const modelFileInputRef = useRef(null)

  // Form state
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState('')
  const [importPrice, setImportPrice] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState(100)
  const [imageUrls, setImageUrls] = useState([])

  // AR Try-On Settings state
  const [enableAR, setEnableAR] = useState(false)
  // const [tryOnType, setTryOnType] = useState('glasses')
  const [modelUrl, setModelUrl] = useState(null)
  const [modelPreview, setModelPreview] = useState(null)
  const [tryonConfig, setTryonConfig] = useState({ ...DEFAULT_TRYON_CONFIG })

  // Loading states
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingModel, setUploadingModel] = useState(false)

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['seller', 'categories'],
    queryFn: async () => {
      const res = await apiService.seller.listCategories()
      return res?.data?.categories || []
    },
    enabled: !!accessToken,
  })

  const categories = categoriesData || []

  // Fetch product if editing
  const { data: productData } = useQuery({
    queryKey: ['seller', 'product', id],
    queryFn: async () => {
      const res = await apiService.seller.getProduct(id)
      return res?.data?.product
    },
    enabled: !!id && !!accessToken,
  })

  // Load product data when editing
  useEffect(() => {
    if (productData) {
      setProductName(productData.name || productData.title || '')
      setCategory(productData.categoryId?.toString() || '')
      setImportPrice(productData.importPrice?.toString() || '')
      setPrice(productData.price?.toString() || '')
      setDescription(productData.description || '')
      setStock(productData.stock || 100)

      if (productData.images?.length) {
        setImageUrls(productData.images)
      } else if (productData.thumbnail) {
        setImageUrls([productData.thumbnail])
      }

      const tryonList = productData.tryonInstances
      const tryon = productData.tryonInstance
      const ar = productData.arSettings
      const type = resolveTryOnTypeFromCategory(
        productData.categoryId,
        categoriesData || [],
      )

      if (tryonList?.length || tryon?.model_url || ar?.modelUrl) {
        setEnableAR(true)
        setModelUrl(
          tryonList?.[0]?.model_url || tryon?.model_url || ar?.modelUrl,
        )
        if (tryonList?.length) {
          setTryonConfig(tryonInstancesToConfig(tryonList, type))
        } else if (tryon) {
          setTryonConfig(tryonInstanceToConfig(tryon, type))
        } else {
          setTryonConfig(arSettingsToTryonConfig(ar))
        }
      }
    }
  }, [productData, categoriesData])

  useEffect(() => {
    if (!enableAR || !category) return
    const type = resolveTryOnTypeFromCategory(category, categories)
    setTryonConfig((prev) => applyTypeToConfig(prev, type))
  }, [category, categories, enableAR])

  // Handle image upload
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} vượt quá 5MB`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    try {
      setUploadingImage(true)
      const uploadedUrls = []

      for (const file of validFiles) {
        const response = await apiService.seller.uploadProductImage(file)
        const imageUrl = response.data?.url
        if (imageUrl) uploadedUrls.push(imageUrl)
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls])
      toast.success(`Đã tải lên ${uploadedUrls.length} ảnh`)
    } catch (error) {
      toast.error(error.message || 'Tải ảnh lên thất bại')
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle model file upload
  const handleModelFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validExtensions = ['.glb', '.gltf']
    const fileExtension = file.name
      .substring(file.name.lastIndexOf('.'))
      .toLowerCase()

    if (!validExtensions.includes(fileExtension)) {
      toast.error('Chỉ hỗ trợ file .glb hoặc .gltf')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Kích thước file không được vượt quá 10MB')
      return
    }

    try {
      setUploadingModel(true)

      // Create preview info
      setModelPreview({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
      })

      const response = await apiService.seller.uploadProductTryonModel(file)
      const url = response.data?.url
      if (url) setModelUrl(url)

      toast.success('Đã tải model xong')
    } catch (error) {
      toast.error(error.message || 'Tải model lên thất bại')
      setModelPreview(null)
    } finally {
      setUploadingModel(false)
    }
  }

  // Remove image
  const removeImage = (index) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveTryonConfig = async () => {
    if (!id || !modelUrl) {
      toast.error('Cần có sản phẩm và model 3D trước khi lưu cấu hình AR')
      return
    }

    await apiService.seller.saveProductTryonInstance(Number(id), {
      model_url: modelUrl,
      type: tryonConfig.type,
      transform_config: tryonConfigToTransform(tryonConfig),
    })
    toast.success('Đã lưu cấu hình AR Try-On')
  }

  // Save product mutation
  const saveProductMutation = useMutation({
    mutationFn: async (payload) => {
      if (id) {
        const res = await apiService.seller.updateProduct(id, payload)
        return res.data.product
      }
      const res = await apiService.seller.createProduct(payload)
      return res.data.product
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller', 'products'] })
      toast.success(id ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm mới')
      navigate('/seller/products')
    },
    onError: (err) => {
      toast.error(err.message || 'Không thể lưu sản phẩm')
    },
  })

  // Handle save draft
  const handleSaveDraft = () => {
    handleSubmit('draft')
  }

  // Handle publish
  const handlePublish = () => {
    handleSubmit('active')
  }

  // Handle form submission
  const handleSubmit = (status = 'active') => {
    // Validation
    if (!productName.trim()) {
      toast.error('Vui lòng nhập tên sản phẩm')
      return
    }
    if (!category) {
      toast.error('Vui lòng chọn danh mục')
      return
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Vui lòng nhập giá hợp lệ')
      return
    }
    if (imageUrls.length === 0) {
      toast.error('Vui lòng thêm ít nhất 1 ảnh sản phẩm')
      return
    }

    // Build payload
    const payload = {
      categoryId: parseInt(category, 10),
      title: productName.trim(),
      importPrice: parseFloat(importPrice) || 0,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      status: status,
      description: description.trim(),
      thumbnail: imageUrls[0] || '',
      images: imageUrls,
    }

    // Add AR settings if enabled
    if (enableAR && modelUrl) {
      payload.arSettings = {
        enabled: true,
        type: tryonConfig.type,
        tryOnType: tryonConfig.type,
        modelUrl,
        anchorIndex: tryonConfig.anchorIndex,
        positionX: tryonConfig.position.x,
        positionY: tryonConfig.position.y,
        positionZ: tryonConfig.position.z,
        rotationX: tryonConfig.rotation.x,
        rotationY: tryonConfig.rotation.y,
        rotationZ: tryonConfig.rotation.z,
        scale: tryonConfig.scale.x,
        scaleX: tryonConfig.scale.x,
        scaleY: tryonConfig.scale.y,
        scaleZ: tryonConfig.scale.z,
      }
    }

    saveProductMutation.mutate(payload)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-rose-50">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-orange-100 bg-white/80 shadow-sm backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/seller/products')}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-orange-600 transition-all hover:scale-105 hover:shadow-md">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="bg-gradient-to-r from-orange-600 to-rose-600 bg-clip-text text-2xl font-bold text-transparent">
                  {id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                </h1>
                <p className="mt-0.5 text-sm text-slate-600">
                  Điền thông tin sản phẩm và cài đặt AR Try-On
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSaveDraft}
                disabled={saveProductMutation.isPending}
                className="flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-white px-6 py-2.5 font-semibold text-orange-600 transition-all hover:border-orange-300 hover:bg-orange-50 disabled:opacity-50">
                <Save className="h-5 w-5" />
                Lưu nháp
              </button>
              <button
                onClick={handlePublish}
                disabled={saveProductMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-6 py-2.5 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-50">
                {saveProductMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
                {id ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Product Information */}
          <div className="space-y-6">
            {/* Product Info Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                  <span className="text-xl">📋</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Thông tin sản phẩm
                </h2>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Danh mục <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none">
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Import Price and Selling Price */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Giá nhập (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={importPrice}
                      onChange={(e) => setImportPrice(e.target.value)}
                      placeholder="299,000"
                      step="1000"
                      min="0"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Giá bán (VNĐ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="499,000"
                      step="1000"
                      min="0"
                      className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mô tả sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kính mát thời trang với thiết kế hiện đại, phù hợp cho cả nam và nữ.&#10;Chất liệu cao cấp, nhẹ và bền, màng lọc tia UV và ánh sáng xanh.&#10;Bảo vệ mắt khỏi tia UV và ánh sáng xanh."
                    rows={5}
                    className="w-full resize-none rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none"
                  />
                  <div className="mt-1 text-right text-xs text-slate-500">
                    {description.length}/1000
                  </div>
                </div>

                {/* Product Images */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Hình ảnh sản phẩm <span className="text-red-500">*</span>
                  </label>

                  <div className="grid grid-cols-4 gap-3">
                    {/* Existing images */}
                    {imageUrls.map((url, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <X className="h-4 w-4" />
                        </button>
                        {index === 0 && (
                          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1">
                            <span className="text-xs font-medium text-white">
                              Ảnh chính
                            </span>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add more button */}
                    {imageUrls.length < 8 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                        className="group relative aspect-square overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-all hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50">
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-orange-500">
                          {uploadingImage ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                          ) : (
                            <>
                              <Plus className="h-6 w-6" />
                              <span className="text-xs font-medium">
                                Thêm ảnh
                                <br />
                                (Tối đa 8 ảnh)
                              </span>
                            </>
                          )}
                        </div>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Số lượng tồn kho <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-800 transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-100 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Virtual Try-On Settings */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-200">
                    <span className="text-xl">🥽</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">
                    Cài đặt thử đồ ảo
                  </h2>
                </div>

                {/* Enable AR Toggle */}
                <button
                  onClick={() => setEnableAR(!enableAR)}
                  className={`relative h-7 w-14 rounded-full transition-colors ${
                    enableAR ? 'bg-green-500' : 'bg-slate-300'
                  }`}>
                  <div
                    className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                      enableAR ? 'translate-x-7' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              {enableAR ? (
                <div className="space-y-5">
                  {/* Enable AR Try-On */}
                  {/* <div className="flex items-center justify-between rounded-xl bg-white/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <span className="text-sm font-bold">1</span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          Bật tính năng AR Try-On
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Info className="h-3 w-3" />
                          Bật tính năng thử đồ ảo
                        </div>
                      </div>
                    </div>
                    <div className="flex h-6 w-12 items-center justify-center rounded-full bg-green-500">
                      <span className="text-xs font-bold text-white">BẬT</span>
                    </div>
                  </div> */}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <span className="text-sm font-bold">1</span>
                        </div>
                        <label className="text-sm font-semibold text-slate-700">
                          Loại AR (theo danh mục)
                        </label>
                      </div>
                      <div className="rounded-xl border-2 border-purple-100 bg-white/90 px-4 py-3 text-sm text-slate-700">
                        {category ? (
                          <>
                            <span className="font-semibold text-purple-800">
                              {TRYON_TYPE_META[tryonConfig.type]?.label ||
                                'Kính'}
                            </span>
                            <span className="mt-1 block font-mono text-xs text-slate-500">
                              Anchor: {(tryonConfig.anchors || []).join(', ')}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-500">
                            Chọn danh mục sản phẩm (Mũ / Kính / Hoa tai) bên
                            trái
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3D Model File */}
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <span className="text-sm font-bold">2</span>
                        </div>
                        <label className="text-sm font-semibold text-slate-700">
                          File 3D
                        </label>
                      </div>
                      <button
                        onClick={() => modelFileInputRef.current?.click()}
                        disabled={uploadingModel}
                        className="w-full rounded-xl border-2 border-dashed border-purple-300 bg-white/80 px-4 py-3 text-sm font-medium text-purple-600 transition-all hover:border-purple-400 hover:bg-purple-50 disabled:opacity-50">
                        {uploadingModel ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải lên...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Upload className="h-4 w-4" />
                            Tải lên Model 3D (.glb, .gltf)
                          </span>
                        )}
                      </button>
                      <input
                        ref={modelFileInputRef}
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handleModelFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Model file info */}
                  {modelPreview && (
                    <div className="rounded-xl border-2 border-green-200 bg-green-50 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <Check className="size-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-green-800">
                            {modelPreview.name}
                          </div>
                          <div className="text-xs text-green-600">
                            {modelPreview.size}
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-green-700">
                        Định dạng hỗ trợ: GLB, GLTF; Kích thước tối đa: 10MB
                      </p>
                    </div>
                  )}

                  {/* Model Preview — MindAR + A-Frame */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                        <span className="text-sm font-bold">3</span>
                      </div>
                      <label className="text-sm font-semibold text-slate-700">
                        Xem trước &amp; căn chỉnh
                      </label>
                    </div>

                    {modelUrl ? (
                      <TryonModelPreview
                        modelUrl={modelUrl}
                        config={tryonConfig}
                        onConfigChange={setTryonConfig}
                        productId={id ? Number(id) : null}
                        onSave={id ? handleSaveTryonConfig : undefined}
                      />
                    ) : (
                      <div className="flex aspect-video flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400">
                        <Camera className="h-10 w-10" />
                        <p className="text-center text-sm font-medium">
                          Tải file .glb để bật camera và căn chỉnh model
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl bg-white/80 p-8 text-center">
                  <div className="mb-4 text-6xl">🥽</div>
                  <h3 className="mb-2 text-lg font-semibold text-slate-800">
                    AR Try-On đã tắt
                  </h3>
                  <p className="text-sm text-slate-600">
                    Bật công tắc ở trên để thêm tính năng thử đồ ảo cho sản phẩm
                    này
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
