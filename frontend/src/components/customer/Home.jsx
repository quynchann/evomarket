import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as productApi from '../../services/productApi'
import Footer from './Footer'
import bannerSummer from '../../assets/banner-summer-clean.png'
import bannerJewelry from '../../assets/banner-jewelry-elegant.png'
import bannerHats from '../../assets/banner-hats.png'

export default function HomePage() {
  const navigate = useNavigate()
  const [bannerIndex, setBannerIndex] = useState(0)

  // Fetch categories from API
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  })

  // Fetch featured products from API
  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => productApi.getFeaturedProducts(16),
  })

  // Fetch all products from API
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productApi.getProducts({ limit: 16 }),
  })

  const categories = categoriesData?.data || []
  const featuredProducts = featuredData?.data || []
  const products = productsData?.data || []

  // Format price helper
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const bannerSlides = [
    {
      title: 'HELLO SUMMER',
      heading: 'Tỏa sáng rực rỡ ngày hè',
      subtitle: 'Kính mát thời trang – Bảo vệ toàn diện',
      discount: '30%',
      image: bannerSummer,
    },
    {
      title: 'TRENDY HATS',
      heading: 'Mũ phong cách cho mọi dịp',
      subtitle: 'Mũ bucket, mũ lưỡi trai – Bảo vệ tối ưu',
      discount: '25%',
      image: bannerHats,
    },
    {
      title: 'ELEGANT JEWELRY',
      heading: 'Hoa tai tinh tế nổi bật',
      subtitle: 'Trang sức cao cấp – Tôn vinh vẻ đẹp',
      discount: '20%',
      image: bannerJewelry,
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setBannerIndex((prev) => (prev + 1) % bannerSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [bannerSlides.length])

  return (
    <>
      <div className="w-full bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Hero Banner - Carousel */}
          <section className="relative mt-6 h-[400px] overflow-hidden rounded-2xl">
            {/* Banner Slides */}
            {bannerSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  idx === bannerIndex ? 'opacity-100' : 'opacity-0'
                }`}>
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={slide.image}
                    alt={slide.heading}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-transparent"></div>
                </div>

                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-8 lg:px-16">
                    <div className="flex items-center justify-between">
                      {/* Left Content */}
                      <div className="z-10 max-w-xl">
                        <div className="mb-4 flex items-center gap-2">
                          <div className="text-orange-500">
                            <svg
                              className="h-8 w-8"
                              fill="currentColor"
                              viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold tracking-wider text-orange-500 uppercase">
                            {slide.title}
                          </span>
                        </div>
                        <h1 className="mb-3 text-4xl leading-tight font-bold text-orange-600 lg:text-5xl">
                          {slide.heading}
                        </h1>
                        <p className="mb-6 text-base text-gray-700">
                          {slide.subtitle}
                        </p>
                        <button
                          onClick={() => scrollToSection('noibat')}
                          className="transform rounded-lg bg-orange-500 px-8 py-3 text-sm font-bold text-white uppercase shadow-lg transition-all hover:scale-105 hover:bg-orange-600">
                          KHÁM PHÁ NGAY
                        </button>
                      </div>

                      {/* Right Content - Discount Badge */}
                      <div className="hidden lg:block">
                        <div className="relative">
                          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl">
                            <div className="text-center">
                              <div className="mb-1 text-xs font-medium">
                                UP TO
                              </div>
                              <div className="text-4xl font-bold">
                                {slide.discount}
                              </div>
                              <div className="text-xs font-medium">OFF</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            <button
              onClick={() =>
                setBannerIndex((prev) =>
                  prev === 0 ? bannerSlides.length - 1 : prev - 1,
                )
              }
              className="absolute top-1/2 left-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:scale-110 hover:bg-white">
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setBannerIndex((prev) =>
                  prev === bannerSlides.length - 1 ? 0 : prev + 1,
                )
              }
              className="absolute top-1/2 right-4 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-lg transition-all hover:scale-110 hover:bg-white">
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Carousel Indicators */}
            <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 transform gap-2">
              {bannerSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setBannerIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === bannerIndex
                      ? 'w-8 bg-orange-500'
                      : 'w-2 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </section>

          {/* Category Cards */}
          <section className="py-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                {
                  name: 'Mũ',
                  desc: 'Phong cách đa dạng, bảo vệ tối ưu',
                  image:
                    'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=400&h=300&fit=crop&q=80',
                  id: categories.find((c) => c.name === 'Mũ')?.id,
                },
                {
                  name: 'Kính',
                  desc: 'Thời trang sành điệu, bảo vệ mắt',
                  image:
                    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop&q=80',
                  id: categories.find((c) => c.name === 'Kính')?.id,
                },
                {
                  name: 'Hoa tai',
                  desc: 'Tinh tế, nữ tính và nổi bật',
                  image:
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop&q=80',
                  id: categories.find((c) => c.name === 'Hoa tai')?.id,
                },
              ].map((cat, idx) => (
                <div
                  key={idx}
                  onClick={() =>
                    cat.id && navigate(`/customer/categories/${cat.id}`)
                  }
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:shadow-lg">
                  <div className="flex items-center">
                    <div className="relative h-24 w-40 shrink-0">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Gradient overlay for smooth fade effect */}
                      <div className="absolute inset-y-0 right-0 w-12 bg-linear-to-r from-transparent to-white"></div>
                    </div>
                    <div className="grow py-3 pr-4 pl-2">
                      <h3 className="mb-1 text-base font-bold text-gray-800">
                        {cat.name}
                      </h3>
                      <p className="text-xs leading-relaxed text-gray-500">
                        {cat.desc}
                      </p>
                    </div>
                    <div className="shrink-0 pr-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-white shadow-md transition-colors group-hover:bg-orange-600">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section id="noibat" className="py-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Sản phẩm nổi bật
              </h3>
              <button
                onClick={() => navigate('/customer/products')}
                className="flex items-center gap-1 text-sm font-medium text-orange-500 transition hover:text-orange-600">
                Xem tất cả
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {isFeaturedLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-gray-100">
                    <div className="h-40 w-full rounded-t-lg bg-gray-200"></div>
                    <div className="p-3">
                      <div className="mb-2 h-3 rounded bg-gray-200"></div>
                      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {featuredProducts.slice(0, 4).map((p, idx) => {
                  const discounts = ['-20%', '-25%', '-30%', '-15%', '-20%']
                  const discount = discounts[idx % discounts.length]
                  const oldPrice =
                    p.price * (1 + Math.abs(parseInt(discount)) / 100)

                  return (
                    <div
                      key={p.id}
                      className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                      onClick={() => navigate(`/customer/products/${p.id}`)}>
                      <div className="relative">
                        <img
                          src={p.thumbnail || 'https://via.placeholder.com/300'}
                          alt={p.title}
                          className="h-40 w-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              'https://via.placeholder.com/300?text=No+Image'
                          }}
                        />
                        <div className="absolute top-2 left-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow">
                          {discount}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="mb-2 line-clamp-2 h-10 text-sm text-gray-800">
                          {p.title}
                        </p>
                        <div className="mb-1 flex items-center gap-2">
                          <p className="text-base font-bold text-orange-600">
                            {formatPrice(p.price)}
                          </p>
                          <p className="text-xs text-gray-400 line-through">
                            {formatPrice(oldPrice)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 py-12 text-center text-gray-500">
                Không có sản phẩm nào
              </div>
            )}
          </section>

          {/* New Arrivals */}
          <section className="py-8">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                Sản phẩm mới về
              </h3>
              <button
                onClick={() => navigate('/customer/products')}
                className="flex items-center gap-1 text-sm font-medium text-orange-500 transition hover:text-orange-600">
                Xem tất cả
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {isProductsLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-gray-100">
                    <div className="h-40 w-full rounded-t-lg bg-gray-200"></div>
                    <div className="p-3">
                      <div className="mb-2 h-3 rounded bg-gray-200"></div>
                      <div className="h-4 w-2/3 rounded bg-gray-200"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all hover:shadow-md"
                    onClick={() => navigate(`/customer/products/${p.id}`)}>
                    <div className="relative">
                      <img
                        src={p.thumbnail || 'https://via.placeholder.com/300'}
                        alt={p.title}
                        className="h-40 w-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/300?text=No+Image'
                        }}
                      />
                      <div className="absolute top-2 left-2 rounded bg-green-500 px-3 py-1 text-xs font-bold text-white">
                        MỚI
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="mb-2 line-clamp-2 h-10 text-sm text-gray-800">
                        {p.title}
                      </p>
                      <p className="text-base font-bold text-orange-600">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white py-12 text-center text-gray-500">
                Không có sản phẩm nào
              </div>
            )}
          </section>

          {/* Features Section */}
          <section className="py-8">
            <div className="rounded-xl bg-white px-8 py-5 shadow-sm">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 h-12 w-12">
                    <svg
                      className="h-full w-full text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-gray-800">
                    Miễn phí vận chuyển
                  </h4>
                  <p className="text-xs text-gray-500">
                    Cho đơn hàng từ 299.000đ
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 h-12 w-12">
                    <svg
                      className="h-full w-full text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-gray-800">
                    Đổi trả dễ dàng
                  </h4>
                  <p className="text-xs text-gray-500">Đổi trả trong 7 ngày</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 h-12 w-12">
                    <svg
                      className="h-full w-full text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-gray-800">
                    Thanh toán an toàn
                  </h4>
                  <p className="text-xs text-gray-500">Đa dạng phương thức</p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 h-12 w-12">
                    <svg
                      className="h-full w-full text-orange-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h4 className="mb-1 text-sm font-bold text-gray-800">
                    Chính hàng 100%
                  </h4>
                  <p className="text-xs text-gray-500">Cam kết chất lượng</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </>
  )
}
