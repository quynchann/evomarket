import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import * as productApi from '../../services/productApi'
import Footer from './Footer'
import ProductPagination from './ProductPagination'

const PAGE_SIZE = 12

const SORT_OPTIONS = [
  { value: '', label: '', sortBy: 'ucb' },
  { value: 'new', label: 'Mới nhất', sortBy: 'latest' },
  { value: 'popular', label: 'Bán chạy', sortBy: 'popular' },
  { value: 'price_asc', label: 'Giá thấp → cao', sortBy: 'price_asc' },
  { value: 'price_desc', label: 'Giá cao → thấp', sortBy: 'price_desc' },
]

const PAGE_TITLES = {
  featured: 'Sản phẩm nổi bật',
  new: 'Sản phẩm mới về',
}

function resolveSortBy(sort) {
  return SORT_OPTIONS.find((o) => o.value === sort)?.sortBy ?? 'ucb'
}

export default function AllProducts() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const sort = searchParams.get('sort') || 'ucb'
  const categoryId = searchParams.get('category') || ''
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [sort, categoryId])

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: productApi.getCategories,
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['all-products', sort, categoryId, page],
    queryFn: () =>
      productApi.getProducts({
        sortBy: resolveSortBy(sort),
        categoryId: categoryId || undefined,
        page,
        limit: PAGE_SIZE,
      }),
  })

  const categories = categoriesData?.data || []
  const products = Array.isArray(data?.data) ? data.data : []
  const pagination = data?.pagination
  const totalPages = pagination?.totalPages ?? 1
  const pageTitle = PAGE_TITLES[sort] || 'Tất cả sản phẩm'

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)

  const updateParams = (next) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value)
      else params.delete(key)
    })
    setSearchParams(params)
  }

  return (
    <>
      <div className="w-full p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-800 lg:text-2xl">
                {pageTitle}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {pagination?.total != null
                  ? `${pagination.total} sản phẩm`
                  : 'Danh sách sản phẩm'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={sort}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition outline-none focus:border-orange-400">
                {SORT_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    hidden={opt.value === ''}>
                    {opt.label}
                  </option>
                ))}
              </select>

              <select
                value={categoryId}
                onChange={(e) => updateParams({ category: e.target.value })}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition outline-none focus:border-orange-400">
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-gray-200 p-4">
                  <div className="h-48 w-full rounded-xl bg-gray-300 lg:h-56" />
                  <div className="mt-4 h-5 rounded bg-gray-300" />
                  <div className="mt-3 h-5 w-2/3 rounded bg-gray-300" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="rounded-2xl bg-red-50 px-6 py-12 text-center text-red-700">
              Không tải được sản phẩm. Vui lòng thử lại sau.
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-gray-50 px-6 py-16 text-center text-gray-600">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {products.map((p) => (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        navigate(`/customer/products/${p.id}`)
                    }}
                    className="group cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md"
                    onClick={() => navigate(`/customer/products/${p.id}`)}>
                    <div className="relative">
                      <img
                        src={p.thumbnail || 'https://via.placeholder.com/300'}
                        alt={p.title}
                        className="h-40 w-full object-cover transition-transform group-hover:scale-105 sm:h-48"
                        onError={(e) => {
                          e.target.src =
                            'https://via.placeholder.com/300?text=No+Image'
                        }}
                      />
                      {sort === 'new' && (
                        <div className="absolute top-2 left-2 rounded bg-green-500 px-2 py-0.5 text-xs font-bold text-white">
                          MỚI
                        </div>
                      )}
                      {!p.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-lg bg-red-500 px-3 py-1 text-xs font-bold text-white">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {p.category?.name && (
                        <p className="mb-1 text-xs font-medium text-orange-500">
                          {p.category.name}
                        </p>
                      )}
                      <p className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm text-gray-800">
                        {p.title}
                      </p>
                      <p className="text-base font-bold text-orange-600">
                        {formatPrice(p.price)}
                      </p>
                      {p.sold > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                          Đã bán {p.sold}
                        </p>
                      )}
                    </div>
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
      <Footer />
    </>
  )
}
