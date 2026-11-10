
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import api from "@/services/api";
import "@/styles/admin/trash.css";

export default function ProductTrashPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // Lấy danh sách sản phẩm đã xóa mềm từ Laravel.
  const fetchTrash = useCallback(async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/san-pham/thung-rac", {
        params: {
          search: keyword.trim() || undefined,
          per_page: 100,
        },
      });

      // Laravel trả dữ liệu phân trang: data.data là danh sách.
      const result = response.data?.data;
      const list = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
          ? result
          : [];

      setProducts(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách thùng rác."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  // Tìm kiếm khi gửi biểu mẫu.
  const handleSearch = async (event) => {
    event.preventDefault();
    setMessage("");
    await fetchTrash(search);
  };

  // Khôi phục sản phẩm đã xóa mềm.
  const handleRestore = async (product) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn khôi phục "${product.ten}" không?`
    );

    if (!confirmed) return;

    setProcessingId(product.id);
    setError("");
    setMessage("");

    try {
      const response = await api.patch(
        `/san-pham/${product.id}/restore`
      );

      setMessage(
        response.data?.message || "Khôi phục sản phẩm thành công."
      );

      // Tải lại danh sách để sản phẩm vừa khôi phục biến mất.
      await fetchTrash(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể khôi phục sản phẩm."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Xóa sản phẩm vĩnh viễn khỏi cơ sở dữ liệu.
  const handleForceDelete = async (product) => {
    const confirmed = window.confirm(
      `CẢNH BÁO: Bạn có chắc muốn xóa vĩnh viễn "${product.ten}" không?\n\n` +
      "Thao tác này không thể hoàn tác."
    );

    if (!confirmed) return;

    setProcessingId(product.id);
    setError("");
    setMessage("");

    try {
      const response = await api.delete(
        `/san-pham/${product.id}/force-delete`
      );

      setMessage(
        response.data?.message || "Xóa vĩnh viễn thành công."
      );

      // Cập nhật danh sách sau khi xóa thành công.
      await fetchTrash(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa vĩnh viễn sản phẩm."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Định dạng giá tiền theo chuẩn Việt Nam.
  const formatPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "—";
    }

    return (
      Number(price).toLocaleString("vi-VN") + " đ"
    );
  };

  return (
    <main className="product-trash-page">
      <div className="trash-header">
        <div>
          <h1>Thùng rác sản phẩm</h1>
          <p>
            Quản lý sản phẩm đã xóa, khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>

        <Link
          href="/admin/products"
          className="trash-back-button"
        >
          ← Quản lý sản phẩm
        </Link>
      </div>

      <form className="trash-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nhập tên sản phẩm cần tìm..."
          aria-label="Tìm kiếm sản phẩm trong thùng rác"
        />

        <button type="submit" disabled={loading}>
          Tìm kiếm
        </button>

        <button
          type="button"
          className="trash-reset-button"
          disabled={loading && products.length === 0}
          onClick={() => {
            setSearch("");
            setMessage("");
            fetchTrash("");
          }}
        >
          Làm mới
        </button>
      </form>

      {message && (
        <div className="trash-alert trash-alert-success" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="trash-alert trash-alert-error" role="alert">
          {error}
        </div>
      )}

      <section className="trash-table-card">
        <div className="trash-table-heading">
          <h2>Danh sách sản phẩm đã xóa</h2>
          <span>{products.length} sản phẩm</span>
        </div>

        {loading ? (
          <div className="trash-empty-state">
            Đang tải dữ liệu...
          </div>
        ) : products.length === 0 ? (
          <div className="trash-empty-state">
            <div className="trash-empty-icon">🗑️</div>
            <h3>Thùng rác đang trống</h3>
            <p>Không tìm thấy sản phẩm nào đã bị xóa.</p>
          </div>
        ) : (
          <div className="trash-table-wrapper">
            <table className="trash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Ngày xóa</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>

                    <td className="trash-product-name">
                      {product.ten}
                    </td>

                    <td>
                      {product.danhmuc?.ten ||
                        product.danhmuc?.tendanhmuc ||
                        "—"}
                    </td>

                    <td>{formatPrice(product.gia)}</td>

                    <td>
                      {product.deleted_at
                        ? new Date(
                            product.deleted_at
                          ).toLocaleString("vi-VN")
                        : "—"}
                    </td>

                    <td>
                      <div className="trash-actions">
                        <button
                          type="button"
                          className="trash-restore-button"
                          disabled={processingId !== null}
                          onClick={() => handleRestore(product)}
                        >
                          {processingId === product.id
                            ? "Đang xử lý..."
                            : "Khôi phục"}
                        </button>

                        <button
                          type="button"
                          className="trash-delete-button"
                          disabled={processingId !== null}
                          onClick={() => handleForceDelete(product)}
                        >
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
