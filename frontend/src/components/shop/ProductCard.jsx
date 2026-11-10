"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { cartService } from "../../services/cartService";

/**
 * Component hiển thị thẻ sản phẩm chuẩn phong cách thương mại điện tử
 * @param {{ product: any; badge?: string | null }} props
 */
export default function ProductCard({ product, badge = null }) {
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [cartMessageIsError, setCartMessageIsError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !product?.id) return;
    const frameId = requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("shop_wishlist") || "[]");
        setIsWishlisted(saved.includes(product.id));
      } catch {
        setIsWishlisted(false);
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [product?.id]);

  if (!product) return null;

  // 1. Lấy đường dẫn hình ảnh (ưu tiên sanpham_hinhanh)
  const imagePath = product.sanpham_hinhanh || product.hinhanh;
  const imageUrl = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `http://localhost:8000/storage/${imagePath}`
    : "/placeholder.svg";

  // 2. Kiểm tra sản phẩm có giá khuyến mãi hay không
  const priceNum = Number(product.gia) || 0;
  const salePriceNum = Number(product.giakhuyenmai) || 0;
  const hasDiscount = salePriceNum > 0 && salePriceNum < priceNum;

  const discountPercent = hasDiscount
    ? Math.round(((priceNum - salePriceNum) / priceNum) * 100)
    : 0;

  // Xử lý loại nhãn (Badge)
  let badgeLabel = null;
  let badgeClass = "";

  if (badge === "new" || badge === "MỚI") {
    badgeLabel = "MỚI";
    badgeClass = "badge-new";
  } else if (badge === "hot" || badge === "HOT") {
    badgeLabel = "HOT";
    badgeClass = "badge-hot";
  } else if (badge === "sale" || hasDiscount) {
    badgeLabel = discountPercent > 0 ? `-${discountPercent}%` : "GIẢM GIÁ";
    badgeClass = "badge-sale";
  }

  // Toggle yêu thích (Wishlist)
  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window === "undefined") return;

    try {
      const saved = JSON.parse(localStorage.getItem("shop_wishlist") || "[]");
      let updated;
      if (saved.includes(product.id)) {
        updated = saved.filter((id) => id !== product.id);
        setIsWishlisted(false);
      } else {
        updated = [...saved, product.id];
        setIsWishlisted(true);
      }
      localStorage.setItem("shop_wishlist", JSON.stringify(updated));
      window.dispatchEvent(
        new CustomEvent("wishlistChange", {
          detail: { count: updated.length },
        }),
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = async (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setAdding(true);
    setCartMessage("");
    setCartMessageIsError(false);

    try {
      const response = await cartService.add(product.id);
      setCartMessage(response.message || "Đã thêm vào giỏ hàng!");
      // Thông báo cập nhật giỏ hàng cho Header
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cartChange"));
      }
      setTimeout(() => {
        setCartMessage("");
      }, 2500);
    } catch (error) {
      setCartMessage(
        error.response?.data?.message ||
          "Không thể thêm sản phẩm vào giỏ hàng.",
      );
      setCartMessageIsError(true);
      setTimeout(() => {
        setCartMessage("");
      }, 3500);
    } finally {
      setAdding(false);
    }
  };

  const categoryName =
    product.danhmuc?.ten || product.thuonghieu?.ten || "Thiết bị điện tử";

  return (
    <div className="product-card">
      {/* Khung hiển thị hình ảnh */}
      <div className="product-image-wrapper">
        <Link
          href={`/productdetail/${product.id}`}
          className="product-image-link"
        >
          {" "}
          <img
            src={imageUrl}
            alt={product.ten || "Sản phẩm"}
            className="product-image"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </Link>

        {/* Nhãn NEW / HOT / SALE */}
        {badgeLabel && (
          <span className={`product-badge ${badgeClass}`}>{badgeLabel}</span>
        )}

        {/* Nút yêu thích */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
          title={isWishlisted ? "Đã yêu thích" : "Thêm vào yêu thích"}
          aria-label="Yêu thích sản phẩm"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill={isWishlisted ? "#ef4444" : "none"}
            stroke={isWishlisted ? "#ef4444" : "#6b7280"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="product-info">
        {/* Tên danh mục */}
        <span className="product-category">{categoryName}</span>

        {/* Tên sản phẩm */}
        <h3 className="product-name" title={product.ten}>
          <Link href={`/productdetail/${product.id}`}>{product.ten}</Link>
        </h3>

        {/* Khối hiển thị giá */}
        <div className="product-price-box">
          {hasDiscount ? (
            <>
              <span className="product-sale-price">
                {salePriceNum.toLocaleString("vi-VN")} đ
              </span>
              <span className="product-original-price strike">
                {priceNum.toLocaleString("vi-VN")} đ
              </span>
            </>
          ) : (
            <span className="product-price">
              {priceNum.toLocaleString("vi-VN")} đ
            </span>
          )}
        </div>

        {/* Số lượng / Trạng thái kho */}
        <div className="product-stock-line">
          {product.soluong > 0 ? (
            <span className="stock-available">
              Còn lại: <strong>{product.soluong}</strong>
            </span>
          ) : (
            <span className="out-of-stock">Hết hàng</span>
          )}
        </div>

        {/* Nút thêm vào giỏ hàng */}
        <button
          type="button"
          className="product-add-to-cart"
          onClick={handleAddToCart}
          disabled={adding || product.soluong <= 0}
          title={product.soluong <= 0 ? "Sản phẩm đã hết hàng" : "Thêm vào giỏ"}
        >
          {adding ? (
            <span className="cart-btn-text">Đang thêm...</span>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="cart-icon"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="cart-btn-text">Thêm vào giỏ</span>
            </>
          )}
        </button>

        {/* Thông báo thao tác giỏ hàng */}
        {cartMessage && (
          <p
            className={`product-cart-message ${
              cartMessageIsError
                ? "product-cart-message-error"
                : "product-cart-message-success"
            }`}
            role={cartMessageIsError ? "alert" : "status"}
          >
            {cartMessage}
          </p>
        )}
      </div>
    </div>
  );
}
