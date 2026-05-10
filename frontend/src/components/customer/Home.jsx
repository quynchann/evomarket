import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import * as productApi from "../../services/productApi";
import logoEvo from "../../assets/logo-evo.png";
import { HOME_BANNER_SLIDES } from "./homeBannerSlides";
import Footer from "./Footer";

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [productsIndex, setProductsIndex] = useState(0);

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: productApi.getCategories,
  });

  // Fetch featured products from API
  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ["featured-products"],
    queryFn: () => productApi.getFeaturedProducts(16),
  });

  // Fetch all products from API
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => productApi.getProducts({ limit: 16 }),
  });

  const categories = categoriesData?.data || [];
  const featuredProducts = featuredData?.data || [];
  const products = productsData?.data || [];

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % HOME_BANNER_SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ActiveBannerSlide = HOME_BANNER_SLIDES[bannerIndex];

  return (
    <>
      <div className="w-full p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
              {/* Welcome */}
              <section className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 p-5 text-white shadow-xl lg:flex-row lg:items-center lg:p-6">
                <div>
                  <h2 className="text-base font-bold lg:text-lg">
                    Chào mừng trở lại, {user?.fullname || "Nguyễn Văn A"}! 👋
                  </h2>
                  <p className="mt-1 text-xs lg:text-sm text-orange-50">Cùng EvoMarket khám phá xu hướng mới hôm nay!</p>
                </div>
                <div className="flex gap-4">
                  <div className="rounded-lg bg-white/20 backdrop-blur px-4 py-2">
                    <p className="text-xs text-orange-100">Xu Evo</p>
                    <p className="text-sm font-bold lg:text-base">1,250</p>
                  </div>
                  <div className="rounded-lg bg-white/20 backdrop-blur px-4 py-2">
                    <p className="text-xs text-orange-100">EvoPay</p>
                    <p className="text-sm font-bold lg:text-base">500K</p>
                  </div>
                </div>
              </section>

              {/* Banner động — SVG nhúng trong homeBannerSlides.jsx (không tải file ngoài) */}
              <section className="relative mt-5 h-44 overflow-hidden rounded-2xl shadow-xl lg:h-72">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700">
                  <ActiveBannerSlide
                    key={bannerIndex}
                    className="h-full w-full transition-opacity duration-700"
                  />
                </div>

              {/* Nút chuyển trái / phải */}
              <button
                onClick={() =>
                  setBannerIndex((prev) =>
                    prev === 0 ? HOME_BANNER_SLIDES.length - 1 : prev - 1,
                  )
                }
                className="absolute top-1/2 left-3 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur text-xl text-gray-700 shadow-lg transition hover:bg-white hover:scale-110"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setBannerIndex((prev) =>
                    prev === HOME_BANNER_SLIDES.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 backdrop-blur text-xl text-gray-700 shadow-lg transition hover:bg-white hover:scale-110"
              >
                ›
              </button>

              {/* Chấm nhỏ hiển thị vị trí */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-black/30 backdrop-blur px-3 py-2">
                {HOME_BANNER_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setBannerIndex(i)}
                    className={`h-2 w-2 rounded-full transition-all ${
                      i === bannerIndex ? "bg-white w-6" : "bg-white/60 hover:bg-white/80"
                    }`}
                  ></button>
                ))}
              </div>
              </section>

              {/* Danh mục sản phẩm */}
              <section id="danhmuc" className="mt-8 scroll-mt-28 lg:mt-10">
                <div className="mb-6 flex items-center gap-3">
                  <span className="text-3xl">🌸</span>
                  <h3 className="text-xl font-bold text-gray-800 lg:text-2xl">
                    Danh mục sản phẩm
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <div
                        key={cat.id}
                        className="group flex flex-col items-center rounded-3xl bg-white p-8 text-base font-semibold text-gray-700 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-3 cursor-pointer border-2 border-gray-100 hover:border-orange-300"
                        onClick={() => {
                          console.log('Category clicked:', cat.id);
                        }}
                      >
                        <div className="mb-5 flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 shadow-xl transition-transform group-hover:scale-110 group-hover:rotate-3">
                          {["Mũ", "Kính", "Hoa tai", "Vòng cổ"].includes(cat.name) ? (
                            <span className="text-5xl">
                              {cat.name === "Mũ" && "🧢"}
                              {cat.name === "Kính" && "🕶️"}
                              {cat.name === "Hoa tai" && "💍"}
                              {cat.name === "Vòng cổ" && "📿"}
                            </span>
                          ) : (
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-3">
                              <img src={logoEvo} alt="Category" className="h-full w-full object-contain" />
                            </div>
                          )}
                        </div>
                        <p className="text-center text-lg font-bold text-gray-800">{cat.name}</p>
                        <p className="mt-2 text-base text-orange-600 font-semibold">{cat.productCount} sản phẩm</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                      Đang tải danh mục...
                    </div>
                  )}
                </div>
              </section>

              {/* Flash Sale */}
              <section id="flashsale" className="mt-8 scroll-mt-28 lg:mt-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚡</span>
                    <h3 className="text-xl font-bold text-gray-800 lg:text-2xl">
                      Sản phẩm bán chạy
                    </h3>
                    {!isFeaturedLoading && featuredProducts.length > 4 && (
                      <span className="ml-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                        {Math.floor(featuredIndex / 4) + 1}/{Math.ceil(featuredProducts.length / 4)}
                      </span>
                    )}
                  </div>
                  <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition">
                    Xem tất cả →
                  </button>
                </div>
                {isFeaturedLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl bg-gray-200 p-4">
                        <div className="h-56 w-full rounded-xl bg-gray-300 lg:h-64"></div>
                        <div className="mt-4 h-5 rounded bg-gray-300"></div>
                        <div className="mt-3 h-5 w-2/3 rounded bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                ) : featuredProducts.length > 0 ? (
                  <div className="relative">
                    {/* Prev Button */}
                    {featuredIndex > 0 && (
                      <button
                        onClick={() => setFeaturedIndex(Math.max(0, featuredIndex - 4))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xl transition-all hover:scale-110 hover:bg-orange-500 hover:text-white border-2 border-gray-200"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                      {featuredProducts.slice(featuredIndex, featuredIndex + 4).map((p) => (
                        <div
                          key={p.id}
                          className="group rounded-2xl bg-white p-5 shadow-lg border-2 border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-orange-300 cursor-pointer"
                          onClick={() => navigate(`/customer/products/${p.id}`)}
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={p.thumbnail || 'https://via.placeholder.com/300'}
                              alt={p.title}
                              className="h-56 w-full rounded-xl object-cover transition-transform group-hover:scale-110 lg:h-64"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                              }}
                            />
                            {!p.inStock && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                                <span className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                  Hết hàng
                                </span>
                              </div>
                            )}
                            <div className="absolute top-3 right-3 rounded-full bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                              🔥 Hot
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="line-clamp-2 text-base font-bold text-gray-800 min-h-[3rem]">{p.title}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-xl font-bold text-red-600">{formatPrice(p.price)}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">Đã bán {p.sold}</span>
                              <span className="flex items-center gap-1 text-yellow-500 text-base">
                                ★★★★★
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Next Button */}
                    {featuredIndex + 4 < featuredProducts.length && (
                      <button
                        onClick={() => setFeaturedIndex(Math.min(featuredProducts.length - 4, featuredIndex + 4))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xl transition-all hover:scale-110 hover:bg-orange-500 hover:text-white border-2 border-gray-200"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Pagination Dots */}
                    {featuredProducts.length > 4 && (
                      <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.ceil(featuredProducts.length / 4) }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setFeaturedIndex(i * 4)}
                            className={`h-2.5 rounded-full transition-all ${
                              Math.floor(featuredIndex / 4) === i 
                                ? 'w-8 bg-orange-500' 
                                : 'w-2.5 bg-gray-300 hover:bg-orange-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                    Không có sản phẩm nào
                  </div>
                )}
              </section>

              {/* Sản phẩm nổi bật */}
              <section id="noibat" className="mt-8 scroll-mt-28 lg:mt-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔥</span>
                    <h3 className="text-xl font-bold text-gray-800 lg:text-2xl">
                      Sản phẩm mới nhất
                    </h3>
                    {!isProductsLoading && products.length > 4 && (
                      <span className="ml-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-600">
                        {Math.floor(productsIndex / 4) + 1}/{Math.ceil(products.length / 4)}
                      </span>
                    )}
                  </div>
                  <button className="text-sm font-semibold text-orange-600 hover:text-orange-700 transition">
                    Xem tất cả →
                  </button>
                </div>
                {isProductsLoading ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse rounded-2xl bg-gray-200 p-4">
                        <div className="h-56 w-full rounded-xl bg-gray-300 lg:h-64"></div>
                        <div className="mt-4 h-5 rounded bg-gray-300"></div>
                        <div className="mt-3 h-5 w-2/3 rounded bg-gray-300"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length > 0 ? (
                  <div className="relative">
                    {/* Prev Button */}
                    {productsIndex > 0 && (
                      <button
                        onClick={() => setProductsIndex(Math.max(0, productsIndex - 4))}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xl transition-all hover:scale-110 hover:bg-orange-500 hover:text-white border-2 border-gray-200"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                      {products.slice(productsIndex, productsIndex + 4).map((p) => (
                        <div
                          key={p.id}
                          className="group rounded-2xl bg-white p-5 shadow-lg border-2 border-gray-100 transition-all hover:shadow-2xl hover:-translate-y-2 hover:border-orange-300 cursor-pointer"
                          onClick={() => navigate(`/customer/products/${p.id}`)}
                        >
                          <div className="relative overflow-hidden rounded-xl">
                            <img
                              src={p.thumbnail || 'https://via.placeholder.com/300'}
                              alt={p.title}
                              className="h-56 w-full rounded-xl object-cover transition-transform group-hover:scale-110 lg:h-64"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300?text=No+Image';
                              }}
                            />
                            {!p.inStock && (
                              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                                <span className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                                  Hết hàng
                                </span>
                              </div>
                            )}
                            <div className="absolute top-3 left-3 rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white shadow-lg">
                              Mới
                            </div>
                          </div>
                          <div className="mt-4">
                            <p className="line-clamp-2 text-base font-bold text-gray-800 min-h-[3rem]">{p.title}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <p className="text-xl font-bold text-orange-600">{formatPrice(p.price)}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-gray-600 font-medium">Kho: {p.stock}</span>
                              <span className="flex items-center gap-1 text-yellow-500 text-base">
                                ★★★★★
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Next Button */}
                    {productsIndex + 4 < products.length && (
                      <button
                        onClick={() => setProductsIndex(Math.min(products.length - 4, productsIndex + 4))}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-2xl transition-all hover:scale-110 hover:bg-orange-500 hover:text-white border-2 border-gray-200"
                      >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}

                    {/* Pagination Dots */}
                    {products.length > 4 && (
                      <div className="mt-6 flex justify-center gap-2">
                        {Array.from({ length: Math.ceil(products.length / 4) }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setProductsIndex(i * 4)}
                            className={`h-2.5 rounded-full transition-all ${
                              Math.floor(productsIndex / 4) === i 
                                ? 'w-8 bg-green-500' 
                                : 'w-2.5 bg-gray-300 hover:bg-green-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-xl">
                    Không có sản phẩm nào
                  </div>
                )}
              </section>
            </div>
          </div>

      <Footer />
    </>
  );
}
