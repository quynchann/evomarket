import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ShoppingCart,
  Loader2,
  Star
} from "lucide-react";
import { cartApi, syncCartQueryAfterMutation } from "../../services/cartApi";
import * as productApi from "../../services/productApi";

export default function ARTryOnScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch product data
  const { data: productData, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", id],
    queryFn: () => productApi.getProductById(id),
    enabled: !!id,
  });

  // Use fetched product data, fallback to state if available
  const product = productData?.data || location.state?.product;

  // Add to cart mutation
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

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setIsLoading(false);
          };
        }
      } catch (error) {
        console.error("Error accessing camera:", error);
        toast.error("Không thể truy cập camera");
        setIsLoading(false);
      }
    };

    initCamera();

    // Cleanup
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle back button
  const handleBack = () => {
    navigate(-1);
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    addToCartMutation.mutate({
      productId: Number(id),
      variantId: null,
      quantity: 1,
    });
  };

  // Show loading while fetching product
  if (isLoadingProduct || !product) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          {isLoadingProduct ? (
            <>
              <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" />
              <p>Đang tải thông tin sản phẩm...</p>
            </>
          ) : (
            <>
              <p>Không tìm thấy thông tin sản phẩm</p>
              <button 
                onClick={handleBack}
                className="mt-4 rounded-lg bg-blue-600 px-6 py-2 hover:bg-blue-700"
              >
                Quay lại
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Video Stream */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        playsInline
        muted
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70">
          <div className="text-center text-white">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin" />
            <p>Đang khởi động camera...</p>
          </div>
        </div>
      )}

      {/* Top overlay - Header */}
      <div className="absolute left-0 right-0 top-0 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          
          <div className="flex-1 px-4 text-center">
            <p className="text-xs text-white/80 mb-1">Thử đồ ảo - Di chuyển để xem góc khác</p>
            <h1 className="text-xl font-bold text-white drop-shadow-lg">{product?.title || "Sản phẩm"}</h1>
          </div>
          
          {/* Empty space to balance layout */}
          <div className="h-10 w-10"></div>
        </div>
      </div>

      {/* Face tracking frame guides */}
      <div className="absolute left-1/2 top-1/2 h-[60%] w-[70%] max-w-md -translate-x-1/2 -translate-y-1/2">
        <div className="relative h-full w-full">
          {/* Corner brackets */}
          <div className="absolute left-0 top-0 h-16 w-16 border-l-2 border-t-2 border-white/50"></div>
          <div className="absolute right-0 top-0 h-16 w-16 border-r-2 border-t-2 border-white/50"></div>
          <div className="absolute bottom-0 left-0 h-16 w-16 border-b-2 border-l-2 border-white/50"></div>
          <div className="absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-white/50"></div>
        </div>
      </div>

      {/* Bottom overlay - Product Card & Add to Cart */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/10 via-transparent to-transparent p-4 pb-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          {/* Product info card with Add to Cart button combined */}
          <div className="flex flex-1 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-sm backdrop-blur-sm">
            {/* Product thumbnail */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.thumbnail || product.images?.[0] || "/placeholder-product.png"}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Product details */}
            <div className="min-w-0 flex-1">
              <h3 className="mb-1 truncate text-base font-semibold text-white drop-shadow-md">
                {product.title}
              </h3>
              <p className="text-2xl font-bold text-white drop-shadow-md">
                ${product.price?.toFixed(2) || "0.00"}
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm text-white/90 drop-shadow-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">
                    {product.ratingSummary?.average?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-white/75">({product.ratingSummary?.count || 0})</span>
                </div>
                <span className="text-white/60">•</span>
                <span className="font-medium text-green-300">
                  Còn {product.stock || 0} sản phẩm
                </span>
              </div>
            </div>

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-white shadow-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
            >
              {addToCartMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
              <span className="font-semibold whitespace-nowrap">Thêm vào giỏ hàng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
