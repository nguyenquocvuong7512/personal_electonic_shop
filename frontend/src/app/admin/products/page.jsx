
"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ProductTable from "@/components/admin/ProductTable";
import "@/styles/admin/products.css";
import { productService } from "@/services/productService";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Lấy danh sách sản phẩm từ Laravel API.
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await productService.getAll();
      console.log("Dữ liệu API trả về:", response);

      // Bóc tách danh sách sản phẩm từ phản hồi API.
      const dataList =
        response?.data?.data ||
        response?.data ||
        response ||
        [];

      setProducts(dataList);
    } catch (err) {
      console.error("Lỗi khi gọi API sản phẩm:", err);
      setError(
        "Không thể tải danh sách sản phẩm. Hãy kiểm tra kết nối với server Laravel!"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Xóa mềm sản phẩm và cập nhật danh sách trên giao diện.
  const handleDelete = async (id, ten) => {
    const isConfirmed = window.confirm(
      `Bạn có chắc chắn muốn đưa sản phẩm "${ten}" vào thùng rác?`
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(id);
      await productService.delete(id);

      setProducts((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      alert(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi đưa sản phẩm vào thùng rác!"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-status-message">
        Đang tải danh sách sản phẩm...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-status-message error">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-products-page">
      <div className="admin-header">
        <h1>Quản lý sản phẩm</h1>

        <div className="admin-product-header-actions">
          <Link
            href="/admin/products/trash"
            className="btn-product-trash"
          >
            🗑 Thùng rác
          </Link>

          <Link
            href="/admin/products/create"
            className="btn-add-product"
          >
            + Thêm sản phẩm mới
          </Link>
        </div>
      </div>

      <ProductTable
        products={products}
        loading={loading}
        error={error}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </div>
  );
}
