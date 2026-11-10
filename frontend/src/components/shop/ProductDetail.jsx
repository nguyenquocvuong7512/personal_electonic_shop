"use client";

import React from "react";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import api from "../../services/api";
import { cartService } from "../../services/cartService";
export default function ProductDetail({ product }) {
  if (!product) return null;

  // Danh sách sản phẩm cùng danh mục
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchRelatedProducts() {
      setRelatedLoading(true);

      try {
        const response = await api.get(`/san-pham/${product.id}/lien-quan`);

        if (cancelled) return;

        const data = response.data?.data;
        setRelatedProducts(Array.isArray(data) ? data : []);
      } catch (error) {
        if (!cancelled) {
          console.error("Lỗi tải sản phẩm liên quan:", error);
          setRelatedProducts([]);
        }
      } finally {
        if (!cancelled) {
          setRelatedLoading(false);
        }
      }
    }

    fetchRelatedProducts();

    return () => {
      cancelled = true;
    };
  }, [product.id]);

  // Ưu tiên đường dẫn ảnh sản phẩm có sẵn trong dữ liệu API
  const imagePath = product.sanpham_hinhanh || product.hinhanh;
  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:8000/storage/${imagePath}`
    : "/placeholder.svg";

  // Chỉ áp dụng giá khuyến mãi khi giá này hợp lệ
  const price = Number(product.gia) || 0;
  const salePrice = Number(product.giakhuyenmai) || 0;
  const hasDiscount = salePrice > 0 && salePrice < price;
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageIsError, setCartMessageIsError] = useState(false);

  // Không cho số lượng vượt quá tồn kho
  const stock = Math.max(0, Number(product.soluong) || 0);

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increaseQuantity = () => {
    setQuantity((current) => Math.min(stock, current + 1));
  };

  // Thêm sản phẩm cùng số lượng đã chọn vào giỏ hàng
  const handleAddToCart = async () => {
    if (stock <= 0 || quantity > stock) return;

    setAdding(true);
    setCartMessage("");
    setCartMessageIsError(false);

    try {
      const response = await cartService.add(product.id, quantity);

      setCartMessage(response.message || "Đã thêm vào giỏ hàng!");

      // Báo cho Header cập nhật số lượng giỏ hàng
      window.dispatchEvent(new CustomEvent("cartChange"));
    } catch (error) {
      setCartMessage(
        error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng.",
      );
      setCartMessageIsError(true);
    } finally {
      setAdding(false);
    }
  };
  return (
    <div className="product-detail-content">
      <div className="product-detail-layout">
        {/* Hình ảnh sản phẩm */}
        <div className="product-detail-image">
          <img
            src={imageUrl}
            alt={product.ten || "Sản phẩm"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="product-detail-info">
          <h1>{product.ten}</h1>

          <div className="product-detail-price">
            {hasDiscount ? (
              <>
                <strong>{salePrice.toLocaleString("vi-VN")} đ</strong>
                <del>{price.toLocaleString("vi-VN")} đ</del>
              </>
            ) : (
              <strong>{price.toLocaleString("vi-VN")} đ</strong>
            )}
          </div>

          <p>
            <b>Danh mục:</b> {product.danhmuc?.ten || "Chưa phân loại"}
          </p>

          <p>
            <b>Thương hiệu:</b> {product.thuonghieu?.ten || "Chưa cập nhật"}
          </p>

          <p>
            <b>Tình trạng:</b>{" "}
            {product.soluong > 0
              ? `Còn ${product.soluong} sản phẩm`
              : "Hết hàng"}
          </p>
          {/* Chọn số lượng */}
          <div className="product-detail-quantity">
            <span>Số lượng:</span>

            <div className="quantity-control">
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                aria-label="Giảm số lượng"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                type="button"
                onClick={increaseQuantity}
                disabled={quantity >= stock}
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>

          {/* Thêm giỏ hàng */}
          <button
            type="button"
            className="product-detail-add-cart"
            onClick={handleAddToCart}
            disabled={adding || stock <= 0}
          >
            {stock <= 0
              ? "Hết hàng"
              : adding
                ? "Đang thêm..."
                : "Thêm vào giỏ hàng"}
          </button>

          {cartMessage && (
            <p
              className={`product-detail-cart-message ${
                cartMessageIsError ? "error" : "success"
              }`}
              role="status"
            >
              {cartMessage}
            </p>
          )}
        </div>
      </div>

      {/* Mô tả sản phẩm */}
      <section className="product-detail-description">
        <h2>Mô tả sản phẩm</h2>
        <p>{product.mota || "Sản phẩm chưa có mô tả."}</p>
      </section>

      {/* Sản phẩm liên quan */}
      <section className="product-related">
        <h2>Sản phẩm liên quan</h2>

        {relatedLoading ? (
          <p>Đang tải sản phẩm liên quan...</p>
        ) : relatedProducts.length === 0 ? (
          <p>Chưa có sản phẩm liên quan.</p>
        ) : (
          <div className="products-grid">
            {relatedProducts
              .filter((item) => item.id !== product.id)
              .slice(0, 4)
              .map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
