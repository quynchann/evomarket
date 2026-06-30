import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Trả về danh sách số trang (và "..." nếu cần) để hiển thị.
 * @param {number} current
 * @param {number} total
 * @param {number} siblingCount số trang hai bên trang hiện tại
 */
function buildPageItems(current, total, siblingCount = 1) {
  if (total <= 1) return [1];

  const items = new Set([1, total, current]);
  for (let i = 1; i <= siblingCount; i++) {
    if (current - i >= 1) items.add(current - i);
    if (current + i <= total) items.add(current + i);
  }

  const sorted = [...items].sort((a, b) => a - b);
  const result = [];

  sorted.forEach((num, idx) => {
    if (idx > 0 && num - sorted[idx - 1] > 1) {
      result.push("...");
    }
    result.push(num);
  });

  return result;
}

export default function ProductPagination({
  page,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (!totalPages || totalPages <= 1) return null;

  const items = buildPageItems(page, totalPages);

  const goTo = (next) => {
    const clamped = Math.max(1, Math.min(totalPages, next));
    if (clamped !== page) onPageChange(clamped);
  };

  const squareBtn =
    "flex h-10 w-10 items-center justify-center rounded-lg border-2 text-sm font-semibold transition";
  const squareIdle =
    "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:text-orange-600";
  const squareActive = "border-orange-500 bg-orange-500 text-white shadow-sm";
  const arrowBtn =
    "flex h-10 w-10 items-center justify-center rounded-lg border-2 border-gray-200 bg-white text-gray-700 shadow-sm transition enabled:hover:border-orange-300 enabled:hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      className={`flex items-center justify-center gap-2 ${className}`}
      aria-label="Phân trang sản phẩm"
    >
      <button
        type="button"
        aria-label="Trang trước"
        disabled={page <= 1}
        onClick={() => goTo(page - 1)}
        className={arrowBtn}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {items.map((item, idx) =>
        item === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex h-10 w-8 items-center justify-center text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Trang ${item}`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => goTo(item)}
            className={`${squareBtn} ${item === page ? squareActive : squareIdle}`}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Trang sau"
        disabled={page >= totalPages}
        onClick={() => goTo(page + 1)}
        className={arrowBtn}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </nav>
  );
}
