import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { shopApi } from "../../services/shopApi.js";
import { useAuthStore } from "../../stores/useAuthStore.js";
import Footer from "./Footer.jsx";
import ProductPagination from "./ProductPagination.jsx";

const PAGE_SIZE = 12;

function formatPrice(price) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export default function ShopProfile() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);

  const sid = sellerId != null ? Number(sellerId) : NaN;
  const isValidId = Number.isFinite(sid);

  const { data: shopRes, isLoading: shopLoading } = useQuery({
    queryKey: ["shop-profile", sid],
    queryFn: () => shopApi.getShop(sid),
    enabled: isValidId,
  });

  const shopPayload = shopRes?.data;
  const seller = shopPayload?.seller;
  const displayName = seller?.shopName || seller?.fullname || "Cửa hàng";

  const { data: prodRes, isLoading: prodLoading } = useQuery({
    queryKey: ["shop-products", sid, page],
    queryFn: () =>
      shopApi.getShopProducts(sid, { page, limit: PAGE_SIZE, sortBy: "latest" }),
    enabled: isValidId,
  });

  const products = Array.isArray(prodRes?.data) ? prodRes.data : [];
  const pagination = prodRes?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const isOwnShop =
    user?.role === "seller" && Number(user?.id) === Number(seller?.id);

  const followMutation = useMutation({
    mutationFn: () => shopApi.follow(sid),
    onSuccess: (res) => {
      const fc = res?.data?.followerCount;
      queryClient.setQueryData(["shop-profile", sid], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isFollowing: true,
            followerCount:
              typeof fc === "number" ? fc : old.data.followerCount,
          },
        };
      });
      toast.success("Đã theo dõi cửa hàng");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể theo dõi");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: () => shopApi.unfollow(sid),
    onSuccess: (res) => {
      const fc = res?.data?.followerCount;
      queryClient.setQueryData(["shop-profile", sid], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: {
            ...old.data,
            isFollowing: false,
            followerCount:
              typeof fc === "number" ? fc : old.data.followerCount,
          },
        };
      });
      toast.success("Đã hủy theo dõi");
    },
    onError: (err) => {
      toast.error(err.message || "Không thể hủy theo dõi");
    },
  });

  const followerCountFmt =
    shopPayload?.followerCount != null
      ? new Intl.NumberFormat("vi-VN").format(shopPayload.followerCount)
      : null;
  const shopRatingAvg = shopPayload?.ratingSummary?.average;
  const shopRatingCount = shopPayload?.ratingSummary?.count ?? 0;

  const handleFollowClick = () => {
    if (!isAuthenticated || user?.role !== "buyer") {
      toast.info("Đăng nhập tài khoản khách để theo dõi cửa hàng");
      navigate("/customer/login", { state: { from: `/customer/shops/${sid}` } });
      return;
    }
    if (isOwnShop) return;
    const following = shopPayload?.isFollowing;
    if (following) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  };

  if (!isValidId) {
    return (
      <>
        <div className="mx-auto max-w-7xl p-6">
          <p className="text-gray-600">ID cửa hàng không hợp lệ.</p>
        </div>
        <Footer />
      </>
    );
  }

  const avatarSrc =
    seller?.avatar && String(seller.avatar).startsWith("http")
      ? seller.avatar
      : null;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white pb-12">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
          {shopLoading && !shopPayload ? (
            <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-gray-200" />
                  <div className="space-y-2">
                    <div className="h-6 w-48 rounded bg-gray-200" />
                    <div className="h-4 w-32 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          ) : !seller ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center text-gray-600 shadow">
              Không tìm thấy cửa hàng.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border-2 border-orange-100 bg-white shadow-xl">
              <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 px-6 py-8 text-white sm:px-10">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white/90 bg-orange-100 text-4xl shadow-md sm:h-24 sm:w-24">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span aria-hidden="true">👤</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-orange-100">
                        Trang cửa hàng
                      </p>
                      <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                        {displayName}
                      </h1>
                      <p className="mt-2 text-sm text-orange-50">
                        {followerCountFmt != null
                          ? `${followerCountFmt} người theo dõi`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:items-end">
                    <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-end">
                      <div className="flex min-w-[150px] flex-col items-center justify-center rounded-xl bg-orange-600/95 px-5 py-4 text-center shadow-md ring-1 ring-white/20">
                        <div className="flex items-center gap-2">
                          <span className="text-4xl font-extrabold leading-none tracking-tight text-white">
                            {shopRatingAvg != null ? Number(shopRatingAvg).toFixed(1) : "—"}
                          </span>
                          <span className="text-2xl leading-none" aria-hidden>
                            ⭐
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-white/95">Đánh giá shop</p>
                        <p className="mt-0.5 text-[11px] text-white/80">
                          {shopRatingCount > 0
                            ? `${new Intl.NumberFormat("vi-VN").format(shopRatingCount)} lượt`
                            : "Chưa có lượt đánh giá"}
                        </p>
                      </div>
                      {isOwnShop ? (
                        <span className="flex min-h-[48px] items-center justify-center rounded-full bg-white/20 px-4 py-2 text-center text-sm font-medium backdrop-blur-sm sm:self-center">
                          Đây là shop của bạn
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFollowClick}
                          disabled={
                            followMutation.isPending || unfollowMutation.isPending
                          }
                          className={`min-h-[48px] min-w-[180px] self-center rounded-full px-6 py-3 text-sm font-bold shadow-lg transition hover:scale-[1.02] disabled:opacity-60 ${
                            shopPayload?.isFollowing
                              ? "border-2 border-white bg-white/10 text-white hover:bg-white/20"
                              : "bg-white text-orange-600 hover:bg-orange-50"
                          }`}
                        >
                          {followMutation.isPending || unfollowMutation.isPending
                            ? "Đang xử lý…"
                            : shopPayload?.isFollowing
                              ? "Hủy theo dõi"
                              : "Theo dõi cửa hàng"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-4 py-8 sm:px-8">
                <h2 className="mb-6 text-lg font-bold text-gray-900">
                  Sản phẩm đang bán
                </h2>

                {prodLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse rounded-2xl bg-gray-100 p-4"
                      >
                        <div className="h-48 rounded-xl bg-gray-200" />
                        <div className="mt-4 h-5 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <p className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
                    Shop chưa có sản phẩm hiển thị.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                      {products.map((p) => (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ")
                              navigate(`/customer/products/${p.id}`);
                          }}
                          className="group cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-lg transition-all hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
                          onClick={() =>
                            navigate(`/customer/products/${p.id}`)
                          }
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={
                                p.thumbnail ||
                                "https://via.placeholder.com/300"
                              }
                              alt={p.title}
                              className="h-52 w-full object-cover transition-transform group-hover:scale-105"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300?text=No+Image";
                              }}
                            />
                            {!p.inStock && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50">
                                <span className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">
                                  Hết hàng
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="mt-3 line-clamp-2 font-semibold text-gray-900">
                            {p.title}
                          </p>
                          <p className="mt-2 font-bold text-orange-600">
                            {formatPrice(p.price)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <ProductPagination
                      className="mt-10"
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
