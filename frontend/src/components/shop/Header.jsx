"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { cartService } from "@/services/cartService";
import api from "@/services/api";
import "@/styles/shop/header.css";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [categories, setCategories] = useState([]);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const categoryMenuRef = useRef(null);
  const userMenuRef = useRef(null);

  // 1. Tải thông tin người dùng
  const loadUser = () => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  };

  // 2. Tải giỏ hàng để cập nhật số lượng và tổng tiền
  const loadCart = async () => {
    try {
      const response = await cartService.get();
      const data = response?.data || response;
      if (data && Array.isArray(data.items)) {
        const totalItems = data.items.reduce(
          (sum, item) => sum + (Number(item.soluong) || 0),
          0,
        );
        setCartCount(totalItems);
        setCartTotal(Number(data.total) || 0);
      } else {
        setCartCount(0);
        setCartTotal(0);
      }
    } catch {
      // Giữ nguyên trạng thái mặc định nếu chưa gọi được API
      setCartCount(0);
      setCartTotal(0);
    }
  };

  // 3. Tải số lượng sản phẩm yêu thích từ LocalStorage
  const loadWishlist = () => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("shop_wishlist") || "[]");
      setWishlistCount(Array.isArray(saved) ? saved.length : 0);
    } catch {
      setWishlistCount(0);
    }
  };

  // 4. Tải danh sách danh mục cho Menu
  const loadCategories = async () => {
    try {
      const res = await api.get("/danh-muc", { params: { per_page: 20 } });
      const items =
        res.data?.data?.data ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      if (Array.isArray(items) && items.length > 0) {
        setCategories(items);
      }
    } catch {
      // Không ném lỗi ra UI
    }
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      loadUser();
      loadCart();
      loadWishlist();
      loadCategories();
    });

    // Lắng nghe sự kiện đăng nhập / đăng xuất
    window.addEventListener("authChange", loadUser);

    // Lắng nghe sự kiện giỏ hàng thay đổi từ ProductCard hoặc Cart
    window.addEventListener("cartChange", loadCart);

    // Lắng nghe sự kiện danh sách yêu thích thay đổi
    window.addEventListener("wishlistChange", loadWishlist);

    // Đóng dropdown khi click bên ngoài
    const handleClickOutside = (e) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target)
      ) {
        setShowCategoryMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("authChange", loadUser);
      window.removeEventListener("cartChange", loadCart);
      window.removeEventListener("wishlistChange", loadWishlist);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setShowUserMenu(false);
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/products");
    }
  };

  return (
    <header className="shop-header">
      {/* 1. THANH TRÊN CÙNG - TOPBAR */}
      <div className="shop-header-topbar">
        <div className="shop-header-container topbar-container">
          <div className="topbar-left">
            <span>
              Chào mừng bạn đến với <strong>Website bán hàng</strong>
            </span>
            <span className="topbar-separator">|</span>
            <span className="topbar-hotline">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Hỗ trợ 24/7: <strong>1800 6868</strong> (Miễn phí)
            </span>
          </div>

          <div className="topbar-right">
            <Link href="/products" className="topbar-link">
              Khuyến mãi hot
            </Link>
            <span className="topbar-separator">|</span>
            <Link href="/cart" className="topbar-link">
              Theo dõi đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* 2. THANH CHÍNH - MAIN HEADER */}
      <div className="shop-header-main">
        <div className="shop-header-container main-container">
          {/* Logo */}
          <Link href="/" className="shop-logo">
            <span className="logo-text">Website bán hàng</span>
            <span className="logo-dot">.</span>
          </Link>

          {/* Ô tìm kiếm sản phẩm trung tâm */}
          <form className="header-search-form" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu công nghệ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="header-search-input"
            />
            <button
              type="submit"
              className="header-search-btn"
              aria-label="Tìm kiếm"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </form>

          {/* Các nút chức năng (Yêu thích, Tài khoản, Giỏ hàng) */}
          <div className="header-actions">
            {/* Yêu thích */}
            <Link
              href="/products"
              className="header-action-item"
              title="Sản phẩm yêu thích"
            >
              <div className="action-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span className="action-badge">{wishlistCount}</span>
              </div>
              <span className="action-text">Yêu thích</span>
            </Link>

            {/* Tài khoản người dùng */}
            <div className="header-user-wrapper" ref={userMenuRef}>
              {user ? (
                <div className="user-dropdown-container">
                  <button
                    type="button"
                    className="header-action-item user-active-item"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-label="Tài khoản người dùng"
                    aria-expanded={showUserMenu}
                  >
                    <div className="action-icon-wrapper">
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div className="user-info-text">
                      <span className="user-greeting-label">Xin chào,</span>
                      <strong className="user-name">{user.ten}</strong>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={`user-chevron ${showUserMenu ? "open" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>

                  <div className={`user-dropdown-menu ${showUserMenu ? 'show' : ''}`}>
                    <Link
                      href="/profile"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Thông tin tài khoản
                    </Link>

                    <Link
                      href="/orders"
                      className="dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                      Đơn hàng của tôi
                    </Link>

                    {user.vaitro === 'admin' && (
                      <Link
                        href="/admin"
                        className="dropdown-item admin-link"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        Trang quản trị
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="dropdown-item logout-link"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="header-action-item"
                  title="Đăng nhập"
                >
                  <div className="action-icon-wrapper">
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <span className="action-text">Đăng nhập</span>
                </Link>
              )}
            </div>

            {/* Giỏ hàng */}
            <Link
              href="/cart"
              className="header-action-item header-cart-box"
              title="Xem giỏ hàng"
            >
              <div className="action-icon-wrapper cart-icon-wrapper">
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="action-badge cart-badge">{cartCount}</span>
              </div>
              <div className="cart-total-info">
                <span className="cart-total-label">Giỏ hàng</span>
                <strong className="cart-total-amount">
                  {cartTotal.toLocaleString("vi-VN")} đ
                </strong>
              </div>
            </Link>

            {/* Mobile menu hamburger toggle */}
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu"
            >
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M3 12h18M3 6h18M3 18h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 3. THANH ĐIỀU HƯỚNG DƯỚI - NAVIGATION BAR */}
      <div
        className={`shop-header-navbar ${mobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="shop-header-container navbar-container">
          {/* Nút danh mục thả xuống */}
          <div className="category-dropdown-wrapper" ref={categoryMenuRef}>
            <button
              type="button"
              className="category-btn"
              onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>Danh mục sản phẩm</span>
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`category-chevron ${showCategoryMenu ? "open" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {/* Menu danh mục xổ xuống */}
            {showCategoryMenu && (
              <div className="category-flyout-menu">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?danhmuc_id=${cat.id}`}
                      className="category-flyout-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span>{cat.ten}</span>
                    </Link>
                  ))
                ) : (
                  <>
                    <Link
                      href="/products"
                      className="category-flyout-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <span>Điện thoại & Máy tính bảng</span>
                    </Link>
                    <Link
                      href="/products"
                      className="category-flyout-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <span>Laptop & Máy tính</span>
                    </Link>
                    <Link
                      href="/products"
                      className="category-flyout-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <span>Tai nghe & Âm thanh</span>
                    </Link>
                    <Link
                      href="/products"
                      className="category-flyout-item"
                      onClick={() => setShowCategoryMenu(false)}
                    >
                      <span>Phụ kiện công nghệ</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Danh sách liên kết điều hướng chính */}
          <nav className="shop-nav">
            <Link href="/" className="nav-link active">
              Trang chủ
            </Link>
            <Link href="/products" className="nav-link">
              Sản phẩm
            </Link>
            {/* <Link href="/#san-pham-moi" className="nav-link">
              Sản phẩm mới
            </Link>
            <Link href="/#san-pham-hot" className="nav-link">
              Sản phẩm HOT
            </Link> */}
            <Link href="/posts" className="nav-link">
              Bài viết
            </Link>
            <Link href="/#khuyen-mai" className="nav-link">
              Đang khuyến mãi
            </Link>
            <Link href="/#de-xuat" className="nav-link">
              Đề xuất cho bạn
            </Link>
            <Link href="/cart" className="nav-link">
              Giỏ hàng
            </Link>
          </nav>

          {/* Cam kết / Ưu đãi nhanh */}
          <div className="navbar-badge">
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>Cam kết 100% chính hãng</span>
          </div>
        </div>
      </div>
    </header>
  );
}
