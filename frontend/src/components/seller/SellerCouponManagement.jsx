import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { sellerApi, queryKeys } from "../../services/api.js";

function formatPrice(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(n));
}

function statusBadge(status) {
  const map = {
    active: { text: "Đang chạy", className: "bg-emerald-100 text-emerald-800" },
    scheduled: { text: "Chưa bắt đầu", className: "bg-sky-100 text-sky-800" },
    expired: { text: "Hết hạn", className: "bg-slate-200 text-slate-700" },
    exhausted: { text: "Hết lượt", className: "bg-amber-100 text-amber-900" },
  };
  const s = map[status] || map.expired;
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.className}`}>
      {s.text}
    </span>
  );
}

function isoToDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="flex min-h-dvh items-center justify-center p-3 sm:p-4">
        <div
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
        <div className="relative z-60 w-full max-w-lg rounded-xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          <div className="px-4 py-4 sm:px-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  code: "",
  discountType: "Percentage",
  discountValue: "",
  minOrderValue: "0",
  maxUses: "",
  startDate: "",
  endDate: "",
  newUserOnly: false,
};

export default function SellerCouponManagement() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.sellerCoupons,
    queryFn: async () => {
      const res = await sellerApi.listCoupons();
      return res.data?.coupons ?? [];
    },
  });

  const createMut = useMutation({
    mutationFn: (payload) => sellerApi.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCoupons });
      toast.success("Đã tạo mã khuyến mãi");
      setModalOpen(false);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Không tạo được mã"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }) => sellerApi.updateCoupon(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCoupons });
      toast.success("Đã cập nhật mã");
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (e) => toast.error(e.message || "Không cập nhật được"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => sellerApi.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.sellerCoupons });
      toast.success("Đã xóa mã");
    },
    onError: (e) => toast.error(e.message || "Không xóa được"),
  });

  const coupons = useMemo(() => {
    const list = Array.isArray(data) ? data : [];
    if (!searchTerm.trim()) return list;
    const search = searchTerm.toLowerCase();
    return list.filter(c => 
      c.code.toLowerCase().includes(search)
    );
  }, [data, searchTerm]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      code: c.code,
      discountType: c.discountType || "Percentage",
      discountValue: String(c.discountValue ?? ""),
      minOrderValue: String(c.minOrderValue ?? "0"),
      maxUses: c.maxUses != null ? String(c.maxUses) : "",
      startDate: isoToDateInput(c.startDate),
      endDate: isoToDateInput(c.endDate),
      newUserOnly: !!c.newUserOnly,
    });
    setModalOpen(true);
  };

  const buildPayload = (forCreate) => {
    const discountValue = Number(form.discountValue);
    const minOrderValue = Math.floor(Number(form.minOrderValue) || 0);
    const maxUsesRaw = form.maxUses.trim();
    const payload = {
      discountType: form.discountType,
      discountValue,
      minOrderValue,
      maxUses: maxUsesRaw === "" ? null : Number(maxUsesRaw),
      startDate: form.startDate.trim() || null,
      endDate: form.endDate.trim() || null,
      newUserOnly: form.newUserOnly,
    };
    if (forCreate) {
      payload.code = form.code.trim().toUpperCase();
    }
    return payload;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editing) {
      updateMut.mutate({ id: editing.id, payload: buildPayload(false) });
    } else {
      if (!form.code.trim()) {
        toast.error("Nhập mã voucher");
        return;
      }
      createMut.mutate(buildPayload(true));
    }
  };

  const handleDelete = (c) => {
    if (!window.confirm(`Xóa mã "${c.code}"? Chỉ xóa được khi chưa có lượt dùng.`)) return;
    deleteMut.mutate(c.id);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Khuyến mãi shop</h1>
          <p className="mt-1 text-sm text-slate-600">
            Tạo và quản lý mã giảm giá cho sản phẩm của shop. Khách áp dụng khi thanh toán theo từng shop.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
        >
          + Tạo mã mới
        </button>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error?.message || "Không tải được danh sách mã"}
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Tìm kiếm mã khuyến mãi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 pl-10 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Mã</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Ưu đãi</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Đơn tối thiểu</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Lượt</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Hạn</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Đang tải…
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    {searchTerm ? (
                      <>Không tìm thấy mã nào khớp với &quot;{searchTerm}&quot;</>
                    ) : (
                      <>Chưa có mã nào. Nhấn &quot;Tạo mã mới&quot; để bắt đầu.</>
                    )}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50/40">
                    <td className="px-4 py-3 font-mono font-medium text-slate-900">{c.code}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.discountType === "Percentage"
                        ? `${c.discountValue}%`
                        : formatPrice(c.discountValue)}
                      {c.newUserOnly && (
                        <span className="ml-2 text-xs text-orange-700">(khách mới)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{formatPrice(c.minOrderValue)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {c.maxUses == null ? (
                        "Không giới hạn"
                      ) : (
                        <>
                          {c.usedCount}/{c.maxUses}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="whitespace-nowrap text-xs">
                        {c.startDate ? isoToDateInput(c.startDate) : "—"}
                        {" → "}
                        {c.endDate ? isoToDateInput(c.endDate) : "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">{statusBadge(c.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="mr-2 text-orange-600 hover:underline"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c)}
                        className="text-red-600 hover:underline disabled:opacity-50"
                        disabled={deleteMut.isPending}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? `Sửa mã ${editing.code}` : "Tạo mã khuyến mãi"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editing && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Mã voucher</label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono uppercase focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="VD: SHOP20"
                maxLength={50}
                required
              />
              <p className="mt-1 text-xs text-slate-500">Chữ in hoa, số, gạch. Không đổi được sau khi tạo.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Loại giảm</label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))}
              >
                <option value="Percentage">Phần trăm (%)</option>
                <option value="Fixed">Số tiền cố định (₫)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {form.discountType === "Percentage" ? "Phần trăm (0-100)" : "Số tiền giảm"}
              </label>
              <input
                type="number"
                min={form.discountType === "Percentage" ? "0" : "0.01"}
                max={form.discountType === "Percentage" ? "100" : undefined}
                step="any"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.discountValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (form.discountType === "Percentage") {
                    if (value === "" || (Number(value) >= 0 && Number(value) <= 100)) {
                      setForm((f) => ({ ...f, discountValue: value }));
                    }
                  } else {
                    setForm((f) => ({ ...f, discountValue: value }));
                  }
                }}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Giá trị đơn tối thiểu (₫)</label>
              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.minOrderValue}
                onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tổng lượt dùng (để trống = không giới hạn)</label>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="VD: 100"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-orange-500 focus:outline-none"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-800">
            <input
              type="checkbox"
              checked={form.newUserOnly}
              onChange={(e) => setForm((f) => ({ ...f, newUserOnly: e.target.checked }))}
            />
            Chỉ khách mới (chưa có đơn / chưa dùng ưu đãi người mới)
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60"
            >
              {editing ? "Lưu thay đổi" : "Tạo mã"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
