import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as productApi from '../../services/productApi'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export default function SearchProducts() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryParam = searchParams.get('q') || ''

  const [searchInput, setSearchInput] = useState(queryParam)
  const [filters, setFilters] = useState({
    sortBy: 'ucb',
    minPrice: '',
    maxPrice: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch search results
  const { data: searchData, isLoading } = useQuery({
    queryKey: [
      'search-products',
      queryParam,
      filters.sortBy,
      filters.minPrice,
      filters.maxPrice,
    ],
    queryFn: () =>
      productApi.searchProducts(queryParam, {
        sortBy: filters.sortBy,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        limit: 50,
      }),
    enabled: !!queryParam,
  })

  const products = searchData?.data || []

  // Update search input when URL changes
  useEffect(() => {
    setSearchInput(queryParam)
  }, [queryParam])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchInput.trim()) {
      navigate(`/customer/search?q=${encodeURIComponent(searchInput.trim())}`)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const applyFilters = () => {
    setShowFilters(false)
    // Trigger refetch by updating the query key through sortBy
    setFilters({ ...filters })
  }

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        {/* Search Bar */}
        <div className="mb-6 rounded-2xl bg-white p-4 shadow-lg">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex flex-1 items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="ml-3 w-full bg-transparent text-gray-700 outline-none placeholder:text-gray-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="ml-2 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
              Tìm kiếm
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="rounded-xl border-2 border-gray-200 bg-white p-3 text-gray-700 transition hover:bg-gray-50">
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Bộ lọc</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-500 hover:text-orange-600">
                  Xóa bộ lọc
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Sort By */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Sắp xếp theo
                  </label>
                  <select
                    value={filters.sortBy == 'ucb' ? '' : filters.sortBy}
                    onChange={(e) =>
                      setFilters({ ...filters, sortBy: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200">
                    <option value="" hidden></option>
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá tăng dần</option>
                    <option value="price_desc">Giá giảm dần</option>
                    <option value="popular">Phổ biến</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Giá tối thiểu
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, minPrice: e.target.value })
                    }
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Giá tối đa
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters({ ...filters, maxPrice: e.target.value })
                    }
                    placeholder="1000000"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white transition hover:bg-orange-600">
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Info */}
        {queryParam && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Kết quả tìm kiếm cho "{queryParam}"
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {isLoading
                ? 'Đang tải...'
                : `Tìm thấy ${products.length} sản phẩm`}
            </p>
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4">
                <div className="h-56 w-full rounded-xl bg-gray-300 lg:h-64"></div>
                <div className="mt-4 h-5 rounded bg-gray-300"></div>
                <div className="mt-3 h-5 w-2/3 rounded bg-gray-300"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-lg transition-all hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl"
                onClick={() => navigate(`/customer/products/${product.id}`)}>
                <div className="relative overflow-hidden rounded-xl">
                  <img
                    src={product.thumbnail || 'https://via.placeholder.com/300'}
                    alt={product.title}
                    className="h-56 w-full rounded-xl object-cover transition-transform group-hover:scale-110 lg:h-64"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/300?text=No+Image'
                    }}
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                      <span className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        Hết hàng
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="line-clamp-2 min-h-[3rem] text-base font-bold text-gray-800">
                    {product.title}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xl font-bold text-red-600">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-600">
                      Đã bán {product.sold || 0}
                    </span>
                    <span className="flex items-center gap-1 text-base text-yellow-500">
                      ★★★★★
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : queryParam ? (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Không tìm thấy sản phẩm nào
            </h3>
            <p className="mt-2 text-gray-600">
              Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả
            </p>
            <button
              onClick={() => navigate('/customer/home')}
              className="mt-6 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600">
              Về trang chủ
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              Nhập từ khóa để tìm kiếm
            </h3>
            <p className="mt-2 text-gray-600">
              Tìm kiếm sản phẩm theo tên, mô tả hoặc danh mục
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
