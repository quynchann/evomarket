import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as productApi from "../../services/productApi";
import { reviewApi } from "../../services/reviewApi.js";
import { cartApi, syncCartQueryAfterMutation } from "../../services/cartApi";
import { useAuthStore } from "../../stores/useAuthStore";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const addToCartMutation = useMutation({
    mutationFn: (payload) => cartApi.addItem(payload),
    onSuccess: (data) => {
      syncCartQueryAfterMutation(queryClient, data);
      toast.success("Đã thêm vào giỏ hàng");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thêm vào giỏ hàng");
    },
  });

  /** Mua ngay: chuẩn hóa 1 dòng giờ hàng đúng số lượng PDP rồi sang checkout chỉ cho dòng đó */
  const buyNowMutation = useMutation({
    mutationFn: async () => {
      const productIdNum = Number(id);
      const cartRes = await cartApi.getCart();
      const currentItems = Array.isArray(cartRes?.data?.items)
        ? cartRes.data.items
        : [];
      const existingLine = currentItems.find(
        (line) =>
          Number(line.productId) === productIdNum &&
          (line.variantId == null || line.variantId === ""),
      );
      if (existingLine?.id != null) {
        await cartApi.removeItem(existingLine.id);
      }
      return cartApi.addItem({
        productId: productIdNum,
        variantId: null,
        quantity,
      });
    },
    onSuccess: (fullResponse) => {
      syncCartQueryAfterMutation(queryClient, fullResponse);
      const inner = fullResponse?.data ?? fullResponse;
      const itemsArr = Array.isArray(inner?.items) ? inner.items : [];
      const productIdNum = Number(id);
      const line = itemsArr.find(
        (ci) =>
          Number(ci.productId) === productIdNum &&
          (ci.variantId == null || ci.variantId === ""),
      );
      if (!line?.id) {
        toast.error("Không lấy được dòng đơn để thanh toán");
        return;
      }
      navigate("/customer/checkout", { state: { lineIds: [line.id] } });
    },
    onError: (err) => {
      toast.error(err.message || "Không thể thực hiện Mua ngay");
    },
  });

  // Fetch product detail
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });

  const product = data?.data;

  const { data: reviewsPayload } = useQuery({
    queryKey: ["product-reviews", id],
    queryFn: async () => {
      const res = await reviewApi.listByProduct(id, { page: 1, limit: 8 });
      return res?.data ?? null;
    },
    enabled: Boolean(id && product?.id),
  });

  const publicReviews = reviewsPayload?.reviews ?? [];
  const ratingSummary = product?.ratingSummary ?? { average: null, count: 0 };

  useEffect(() => {
    if (!id || !product?.id) return;
    const run = async () => {
      try {
        const { accessToken, user: u } = useAuthStore.getState();
        const isBuyer = u?.role === 'buyer' && Boolean(accessToken);
        await productApi.trackProductView(id, {
          accessToken: accessToken || undefined,
          isBuyer,
        });
      } catch {
        /* âm thầm — không làm phiền khách */
      }
    };
    run();
  }, [id, product?.id]);

  useEffect(() => {
    if (error) {
      toast.error("Không thể tải thông tin sản phẩm");
      navigate("/customer/homepage");
    }
  }, [error, navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle quantity change
  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào giỏ hàng");
      navigate("/customer/login");
      return;
    }
    if (user?.role !== "buyer") {
      toast.error("Chỉ tài khoản người mua mới thêm được vào giỏ hàng");
      return;
    }

    addToCartMutation.mutate({
      productId: Number(id),
      variantId: null,
      quantity,
    });
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mua hàng");
      navigate("/customer/login");
      return;
    }
    if (user?.role !== "buyer") {
      toast.error("Chỉ tài khoản người mua mới mua được hàng");
      return;
    }
    buyNowMutation.mutate();
  };

  // Handle try on (UI only - chưa implement chức năng)
  const handleTryOn = () => {
    // TODO: Implement AR try-on feature
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-50">
        <div className="mx-auto max-w-7xl p-6">
          <div className="animate-pulse">
            <div className="mb-4 h-8 w-64 rounded bg-gray-300"></div>
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="h-96 rounded-xl bg-gray-300"></div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded bg-gray-300"></div>
                <div className="h-6 w-1/4 rounded bg-gray-300"></div>
                <div className="h-32 rounded bg-gray-300"></div>
                <div className="h-12 w-1/3 rounded bg-gray-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.thumbnail || 'https://via.placeholder.com/600'];

  return (
    <div className="min-h-screen bg-orange-50">
      <main className="mx-auto max-w-7xl p-6">
        {/* Product Detail Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                src={images[selectedImage] || 'https://via.placeholder.com/600'}
                alt={product.title}
                className="h-[400px] w-full object-cover lg:h-[500px]"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600?text=No+Image';
                }}
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="rounded-lg bg-red-500 px-6 py-3 text-xl font-bold text-white">
                    HẾT HÀNG
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 overflow-hidden rounded-lg transition ${
                      selectedImage === idx
                        ? 'ring-4 ring-orange-500'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="h-20 w-20 object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

            {/* Rating & Sold (placeholder) */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">
                  {ratingSummary.average != null ? Number(ratingSummary.average).toFixed(1) : "—"}
                </span>
                <span className="text-gray-500">
                  ({new Intl.NumberFormat("vi-VN").format(ratingSummary.count ?? 0)} đánh giá)
                </span>
              </div>
              <span className="text-gray-400">|</span>
              <div className="text-gray-600">
                Đã bán: <span className="font-semibold text-gray-900">{product.sold}</span>
              </div>
            </div>

            {/* Price */}
            <div className="rounded-xl bg-gray-50 p-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-orange-600">
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Kho:</span>
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </span>
            </div>

            {/* Quantity Selector */}
            {product.inStock && (
              <div className="flex items-center gap-4">
                <span className="text-gray-600">Số lượng:</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 text-xl font-bold transition hover:border-orange-500 hover:text-orange-500 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-xl font-semibold">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-300 text-xl font-bold transition hover:border-orange-500 hover:text-orange-500 disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Try On Button */}
            <button
              onClick={handleTryOn}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 p-[2px] shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
            >
              <div className="relative flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform group-hover:scale-110">
                  <svg 
                    className="h-6 w-6 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-lg font-bold text-white">Thử Đồ Ảo (AR)</p>
                  <p className="text-xs text-white/90">Xem sản phẩm trên khuôn mặt của bạn</p>
                </div>
                <div className="absolute right-4 flex items-center gap-1 text-white/80 transition-all group-hover:gap-2">
                  <span className="text-sm font-semibold">Thử ngay</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={
                  !product.inStock ||
                  addToCartMutation.isPending ||
                  buyNowMutation.isPending
                }
                className="flex-1 rounded-lg border-2 border-orange-500 px-6 py-3 font-semibold text-orange-500 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {addToCartMutation.isPending ? "Đang thêm..." : "🛒 Thêm vào giỏ"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={
                  !product.inStock ||
                  buyNowMutation.isPending ||
                  addToCartMutation.isPending
                }
                className="flex-1 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {buyNowMutation.isPending ? "Đang xử lý..." : "Mua ngay"}
              </button>
            </div>

            {/* Seller Info */}
            <div className="rounded-xl border-2 border-gray-200 bg-white p-6">
              <h3 className="mb-3 font-semibold text-gray-900">Thông tin người bán</h3>
              <button
                type="button"
                onClick={() =>
                  navigate(`/customer/shops/${product.seller.id}`)
                }
                className="flex w-full cursor-pointer items-center gap-4 rounded-lg text-left outline-none ring-orange-400 transition hover:bg-orange-50/80 focus-visible:ring-2"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-2xl">👤</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {product.seller.shopName || product.seller.fullname}
                  </p>
                  <p className="text-sm text-gray-500">Cửa hàng — xem trang shop</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Đánh giá khách hàng */}
        {publicReviews.length > 0 && (
          <div className="mt-8 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">Đánh giá từ khách hàng</h2>
            <ul className="divide-y divide-gray-100">
              {publicReviews.map((r) => (
                <li key={r.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium text-gray-900">
                      {r.user?.fullname?.trim() || "Khách hàng"}
                    </span>
                    <span className="text-amber-500">{"★".repeat(Math.min(5, Math.max(0, r.rating || 0)))}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{r.comment}</p>}
                  {r.created_at && (
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleString("vi-VN")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Product Description */}
        <div className="mt-8 rounded-xl bg-white p-8 shadow-lg">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Mô tả sản phẩm</h2>
          <div className="prose max-w-none text-gray-700">
            {product.description ? (
              <p className="whitespace-pre-wrap">{product.description}</p>
            ) : (
              <p className="text-gray-500">Chưa có mô tả cho sản phẩm này.</p>
            )}
          </div>
        </div>

        {/* Category Badge */}
        <div className="mt-8">
          <button
            onClick={() => navigate(`/customer/categories/${product.category.id}`)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow transition hover:bg-orange-50 hover:text-orange-600"
          >
            <span>📂</span>
            <span>Xem thêm sản phẩm trong: {product.category.name}</span>
          </button>
        </div>
      </main>
    </div>
  );
}
