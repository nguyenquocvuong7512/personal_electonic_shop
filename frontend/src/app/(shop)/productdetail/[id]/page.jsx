
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "../../../../services/api";
import ProductDetail from "../../../../components/shop/ProductDetail";
import "../../../../styles/shop/productdetail.css";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id;

  // Lưu thông tin sản phẩm lấy từ API
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError("");

      try {
        // Lấy chi tiết sản phẩm theo ID
        const response = await api.get(`/san-pham/${id}`);

        if (cancelled) return;

        if (response.data?.success && response.data?.data) {
          setProduct(response.data.data);
        } else {
          setError("Không tìm thấy sản phẩm.");
        }
      } catch (err) {
        if (cancelled) return;

        console.error("Lỗi tải chi tiết sản phẩm:", err);
        setError(
          err.response?.status === 404
            ? "Không tìm thấy sản phẩm."
            : "Không thể tải chi tiết sản phẩm."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <main className="product-detail">Đang tải sản phẩm...</main>;
  }

  if (error) {
    return <main className="product-detail">{error}</main>;
  }

  if (!product) {
    return <main className="product-detail">Không có dữ liệu sản phẩm.</main>;
  }

  
 return (
  <main className="product-detail">
    <ProductDetail product={product} />
  </main>
);

}
