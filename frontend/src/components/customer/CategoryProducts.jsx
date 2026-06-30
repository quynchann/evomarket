import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import * as productApi from "../../services/productApi";
import Footer from "./Footer";
import ProductPagination from "./ProductPagination";

const PAGE_SIZE = 12;

export default function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: productApi.getCategories,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["category-products", categoryId, page],
    queryFn: () =>
      productApi.getProductsByCategory(categoryId, {
        page,
        limit: PAGE_SIZE,
      }),
    enabled: categoryId != null && categoryId !== "",
  });

  const categories = categoriesData?.data || [];
  const category = categories.find((c) => String(c.id) === String(categoryId));
  const categoryName =
    category?.name ||
    (categoryId ? `Danh mục #${categoryId}` : "Danh mục");

  const products = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const totalPages = pagination?.totalPages ?? 1;

  return (
    <>
      <div className="w-full p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl">🌸</span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-800 lg:text-2xl">
                {categoryName}
              </h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {pagination?.total != null
                  ? `${pagination.total} sản phẩm`
                  : "Danh sách sản phẩm theo danh mục"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-gray-200 p-4"
                >
                  <div className="h-56 w-full rounded-xl bg-gray-300 lg:h-64" />
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
              Chưa có sản phẩm trong danh mục này.
            </div>
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
                    className="group cursor-pointer rounded-2xl border-2 border-gray-100 bg-white p-5 shadow-lg transition-all hover:-translate-y-2 hover:border-orange-300 hover:shadow-2xl"
                    onClick={() => navigate(`/customer/products/${p.id}`)}
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img
                        src={p.thumbnail || "https://via.placeholder.com/300"}
                        alt={p.title}
                        className="h-56 w-full rounded-xl object-cover transition-transform group-hover:scale-110 lg:h-64"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300?text=No+Image";
                        }}
                      />
                      {!p.inStock && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/60 backdrop-blur-sm">
                          <span className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                            Hết hàng
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <p className="line-clamp-2 min-h-[3rem] text-base font-bold text-gray-800">
                        {p.title}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xl font-bold text-orange-600">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-600">
                          Kho: {p.stock}
                        </span>
                        <span className="flex items-center gap-1 text-base text-yellow-500">
                          ★★★★★
                        </span>
                      </div>
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
  );
}
