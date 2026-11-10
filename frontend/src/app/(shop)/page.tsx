"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "../../components/shop/ProductCard";
import api from "../../services/api";
import type { Product } from "../../types/product";
import "../../styles/shop/home.css";
import "../../styles/shop/header.css";
import "../../styles/shop/shop.css";

// Mở rộng Product type cho đầy đủ các trường từ API
interface ExtendedProduct extends Product {
  slug?: string;
  mota?: string;
  hinhanh?: string;
  sanpham_hinhanh?: string;
  created_at?: string;
  danhmuc?: { id: number; ten: string };
  thuonghieu?: { id: number; ten: string };
}

export default function HomePage() {
  // Toàn bộ danh sách sản phẩm lấy từ API
  const [allProducts, setAllProducts] = useState<ExtendedProduct[]>([]);
  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);
  // Thông báo lỗi
  const [error, setError] = useState("");
  // Từ khóa tìm kiếm nhanh tại Hero banner
  const [heroSearch, setHeroSearch] = useState("");
  // Danh mục đang lọc nhanh
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    setError("");

    // Gọi API lấy danh sách sản phẩm với per_page=50 để đủ dữ liệu hiển thị các khu vực
    api
      .get("/san-pham", { params: { per_page: 50 } })
      .then((response) => {
        const productList: ExtendedProduct[] =
          response.data?.data?.data ||
          response.data?.data ||
          (Array.isArray(response.data) ? response.data : []);
        setAllProducts(productList);
      })
      .catch(() => {
        setError("Không thể tải danh sách sản phẩm từ hệ thống. Vui lòng kiểm tra lại kết nối.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 1. Phân loại KHU VỰC A: SẢN PHẨM MỚI (NEW)
  // Sắp xếp theo ngày tạo mới nhất (created_at) hoặc ID giảm dần
  const newProducts = useMemo(() => {
    const list = [...allProducts];
    list.sort((a, b) => {
      if (a.created_at && b.created_at) {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return b.id - a.id;
    });
    return list.slice(0, 8);
  }, [allProducts]);

  // 2. Phân loại KHU VỰC B: SẢN PHẨM NỔI BẬT / HOT (HOT)
  // Ưu tiên sản phẩm có số lượng tồn kho tốt hoặc các sản phẩm đầu bảng
  const hotProducts = useMemo(() => {
    const list = [...allProducts];
    list.sort((a, b) => (b.soluong || 0) - (a.soluong || 0));
    return list.slice(0, 8);
  }, [allProducts]);

  // 3. Phân loại KHU VỰC C: SẢN PHẨM KHUYẾN MÃI (SALE)
  // Lọc chính xác những sản phẩm có giakhuyenmai hợp lệ và nhỏ hơn giá bán
  const saleProducts = useMemo(() => {
    return allProducts
      .filter(
        (product) =>
          product.giakhuyenmai &&
          Number(product.giakhuyenmai) > 0 &&
          Number(product.giakhuyenmai) < Number(product.gia)
      )
      .slice(0, 8);
  }, [allProducts]);

  // 4. Phân loại KHU VỰC D: SẢN PHẨM ĐỀ XUẤT (FEATURED)
  // Sản phẩm đề xuất dành cho bạn (chọn các sản phẩm xen kẽ để tạo sự đa dạng)
  const featuredProducts = useMemo(() => {
    if (allProducts.length <= 4) return allProducts;
    // Chọn lọc danh sách đề xuất
    const list = allProducts.filter((_, idx) => idx % 2 === 0);
    return list.slice(0, 8);
  }, [allProducts]);

  // Sản phẩm HOT tiêu biểu cho Hero Banner bên phải
  const heroHotProduct = useMemo(() => {
    if (saleProducts.length > 0) return saleProducts[0];
    if (hotProducts.length > 0) return hotProducts[0];
    if (allProducts.length > 0) return allProducts[0];
    return null;
  }, [saleProducts, hotProducts, allProducts]);

  // Lọc sản phẩm tìm kiếm nhanh nếu người dùng nhập tìm kiếm ở Hero
  const searchResults = useMemo(() => {
    if (!heroSearch.trim()) return [];
    const keyword = heroSearch.toLowerCase().trim();
    return allProducts.filter(
      (p) =>
        p.ten?.toLowerCase().includes(keyword) ||
        p.danhmuc?.ten?.toLowerCase().includes(keyword) ||
        p.thuonghieu?.ten?.toLowerCase().includes(keyword)
    );
  }, [allProducts, heroSearch]);

  return (
    <div className="home-page-container">
      {/* ========================================================
          1. HERO SECTION - BANNER ĐẦU TRANG (PHONG CÁCH ELECTRO)
          ======================================================== */}
      <section className="electro-hero">
        <div className="electro-hero-container">
          {/* Cột trái: Thông điệp lớn & Tìm kiếm nhanh */}
          <div className="hero-left-col">
            <div className="hero-subbadge">
              <span className="badge-pulse"></span>
              CÔNG NGHỆ ĐỈNH CAO 2026
            </div>

            <h1 className="hero-main-title">
              HƠN <span className="highlight-number">1 TRIỆU</span> SẢN PHẨM CÔNG NGHỆ ĐIỆN TỬ
            </h1>

            <p className="hero-subtext">
              Khám phá thế giới laptop, smartphone, thiết bị âm thanh và phụ kiện thông minh chính hãng với mức giá ưu đãi tốt nhất hôm nay.
            </p>

            {/* Ô tìm kiếm nhanh ngay tại Hero */}
            <div className="hero-search-box">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm bạn mong muốn..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="hero-search-input"
              />
              <button
                type="button"
                className="hero-search-btn"
                onClick={() => {
                  if (heroSearch.trim()) {
                    const el = document.getElementById("ket-qua-tim-kiem");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>Tìm kiếm</span>
              </button>
            </div>

            {/* Các tag tìm kiếm phổ biến */}
            <div className="hero-quick-tags">
              <span className="tag-label">Xu hướng:</span>
              <button type="button" onClick={() => setHeroSearch("Laptop")}>Laptop</button>
              <button type="button" onClick={() => setHeroSearch("Điện thoại")}>Điện thoại</button>
              <button type="button" onClick={() => setHeroSearch("Tai nghe")}>Tai nghe</button>
              <button type="button" onClick={() => setHeroSearch("Bàn phím")}>Bàn phím</button>
            </div>

            <div className="hero-cta-buttons">
              <Link href="/products" className="btn-primary-hero">
                Khám phá ngay
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#khuyen-mai" className="btn-secondary-hero">
                Xem khuyến mãi hot
              </a>
            </div>
          </div>

          {/* Cột phải: Khối sản phẩm HOT hôm nay (Hot Products Today) */}
          <div className="hero-right-col">
            <div className="hero-hot-card-wrapper">
              <div className="hot-card-header">
                <span className="hot-card-icon">🔥</span>
                <span className="hot-card-title">SẢN PHẨM HOT HÔM NAY</span>
                <span className="hot-badge-pill">Ưu đãi</span>
              </div>

              {heroHotProduct ? (
                <div className="hero-hot-product-card">
                  <div className="hot-product-image-box">
                    <img
                      src={
                        //https://example.com/ao.jpg
                        heroHotProduct.sanpham_hinhanh || heroHotProduct.hinhanh
                          //products/ao.jpg->http://localhost:8000/storage/products/ao.jpg
                          ? (heroHotProduct.sanpham_hinhanh || heroHotProduct.hinhanh)!.startsWith("http")
                            //placeholder.svg
                            ? (heroHotProduct.sanpham_hinhanh || heroHotProduct.hinhanh)!
                            : `http://localhost:8000/storage/${heroHotProduct.sanpham_hinhanh || heroHotProduct.hinhanh}`
                          : "/placeholder.svg"
                      }
                      alt={heroHotProduct.ten}
                      className="hot-product-image"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />

                    {heroHotProduct.giakhuyenmai &&
                      // giảm giá = (giá bán - khuyến mãi) /giá bán *100
                      Number(heroHotProduct.giakhuyenmai) < Number(heroHotProduct.gia) && (
                        <span className="hot-discount-tag">
                          -
                          {Math.round(
                            ((Number(heroHotProduct.gia) - Number(heroHotProduct.giakhuyenmai)) /
                              Number(heroHotProduct.gia)) *
                            100
                          )}
                          %
                        </span>
                      )}
                  </div>

                  <div className="hot-product-info">
                    <span className="hot-category-badge">
                      {heroHotProduct.danhmuc?.ten || heroHotProduct.thuonghieu?.ten || "Điện tử cao cấp"}
                    </span>
                    <h3 className="hot-title" title={heroHotProduct.ten}>
                      {heroHotProduct.ten}
                    </h3>
                    <div className="hot-price-row">
                      {heroHotProduct.giakhuyenmai &&
                        Number(heroHotProduct.giakhuyenmai) < Number(heroHotProduct.gia) ? (
                        <>
                          <span className="hot-sale-price">
                            {Number(heroHotProduct.giakhuyenmai).toLocaleString("vi-VN")} đ
                          </span>
                          <span className="hot-old-price">
                            {Number(heroHotProduct.gia).toLocaleString("vi-VN")} đ
                          </span>
                        </>
                      ) : (
                        <span className="hot-sale-price">
                          {Number(heroHotProduct.gia).toLocaleString("vi-VN")} đ
                        </span>
                      )}
                    </div>

                    <Link href="/products" className="hot-view-detail-btn">
                      Mua ngay giá tốt
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hot-card-empty">
                  <p>Đang cập nhật sản phẩm nổi bật hôm nay...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. CAM KẾT DỊCH VỤ - HIGHLIGHT FEATURES BAR
          ======================================================== */}
      <section className="features-highlight-bar">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon-wrap">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            </div>
            <div className="feature-text">
              <strong>Miễn phí vận chuyển</strong>
              <span>Đơn hàng từ 500.000 đ</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div className="feature-text">
              <strong>Bảo hành chính hãng</strong>
              <span>100% linh kiện chính hãng 12 tháng</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </div>
            <div className="feature-text">
              <strong>Đổi trả trong 7 ngày</strong>
              <span>Hoàn tiền nếu có lỗi nhà sản xuất</span>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon-wrap">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
              </svg>
            </div>
            <div className="feature-text">
              <strong>Hỗ trợ kỹ thuật 24/7</strong>
              <span>Đội ngũ tư vấn tận tình</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. BANNER DANH MỤC VÀ CHƯƠNG TRÌNH KHUYẾN MÃI
          ======================================================== */}
      <section className="promo-banners-section">
        <div className="promo-container">
          <div className="promo-banners-grid-top">
            {/* Banner 1: Gaming */}
            <div className="promo-card promo-gaming">
              <div className="promo-card-content">
                <span className="promo-tag">#GIẢI TRÍ ĐỈNH CAO</span>
                <h3>Thiết Bị Chơi Game & Console</h3>
                <p>Khám phá máy chơi game và tay cầm thế hệ mới</p>
                <Link href="/products" className="promo-link-btn">
                  Mua ngay
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Banner 2: Laptop */}
            <div className="promo-card promo-laptop">
              <div className="promo-card-content">
                <span className="promo-tag">LÀM VIỆC & HỌC TẬP</span>
                <h3>Laptop & Máy Tính Văn Phòng</h3>
                <p>Cấu hình mạnh mẽ, hiệu năng mượt mà</p>
                <Link href="/products" className="promo-link-btn">
                  Xem chi tiết
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Banner 3: Smartphone */}
            <div className="promo-card promo-phone">
              <div className="promo-card-content">
                <span className="promo-tag">ƯU ĐÃI TRONG TUẦN</span>
                <h3>Điện Thoại & Máy Tính Bảng</h3>
                <p>Giảm giá đến 35% cho các dòng máy mới</p>
                <Link href="/products" className="promo-link-btn">
                  Khám phá
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Hàng banner danh mục thứ hai */}
          <div className="promo-banners-grid-bottom">
            <div className="promo-mini-card">
              <div className="mini-card-text">
                <span className="mini-tag">Âm thanh cao cấp</span>
                <h4>Tai nghe & Loa Bluetooth</h4>
                <Link href="/products" className="mini-link">Xem ngay →</Link>
              </div>
            </div>

            <div className="promo-mini-card">
              <div className="mini-card-text">
                <span className="mini-tag">Đồng hồ thông minh</span>
                <h4>Smartwatch & Vòng đeo tay</h4>
                <Link href="/products" className="mini-link">Xem ngay →</Link>
              </div>
            </div>

            <div className="promo-mini-card">
              <div className="mini-card-text">
                <span className="mini-tag">Phụ kiện PC</span>
                <h4>Chuột, Bàn phím & Màn hình</h4>
                <Link href="/products" className="mini-link">Xem ngay →</Link>
              </div>
            </div>

            <div className="promo-mini-card">
              <div className="mini-card-text">
                <span className="mini-tag">Kỹ thuật số</span>
                <h4>Máy ảnh & Thiết bị quay chụp</h4>
                <Link href="/products" className="mini-link">Xem ngay →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          KHU VỰC KẾT QUẢ TÌM KIẾM NHANH (NẾU CÓ NHẬP TỪ KHÓA)
          ======================================================== */}
      {heroSearch.trim() && (
        <section id="ket-qua-tim-kiem" className="product-section search-results-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <span className="section-subheading">KẾT QUẢ TÌM KIẾM</span>
              <h2 className="section-title">
                Sản phẩm phù hợp với: &ldquo;{heroSearch}&rdquo; ({searchResults.length})
              </h2>
            </div>
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setHeroSearch("")}
            >
              Xóa tìm kiếm
            </button>
          </div>

          {searchResults.length > 0 ? (
            <div className="products-grid">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="empty-state-box">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p className="empty-text">Không tìm thấy sản phẩm nào phù hợp với &ldquo;{heroSearch}&rdquo;.</p>
              <span className="empty-subtext">Hãy thử tìm kiếm với từ khóa khác như: laptop, điện thoại, phụ kiện...</span>
            </div>
          )}
        </section>
      )}

      {/* ========================================================
          4 KHU VỰC SẢN PHẨM BẮT BUỘC THEO ĐỀ BÀI:
          A. SẢN PHẨM MỚI (NEW)
          B. SẢN PHẨM NỔI BẬT / HOT (HOT)
          C. SẢN PHẨM KHUYẾN MÃI (SALE)
          D. SẢN PHẨM ĐỀ XUẤT (FEATURED)
          ======================================================== */}

      {/* ========================================================
          KHU VỰC A: SẢN PHẨM MỚI — NEW
          ======================================================== */}
      <section id="san-pham-moi" className="product-section section-new-products">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-badge-tag badge-tag-new">MỚI NHẤT</div>
            <h2 className="section-title">Sản phẩm mới</h2>
            <p className="section-description">
              Những thiết bị công nghệ mới nhất vừa cập bến cửa hàng, sẵn sàng phục vụ bạn.
            </p>
          </div>
          <Link href="/products" className="view-all-link">
            <span>Xem tất cả</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Đang tải danh sách sản phẩm mới...</p>
          </div>
        ) : error ? (
          <div className="error-state-box">
            <p>{error}</p>
          </div>
        ) : newProducts.length > 0 ? (
          <div className="products-grid">
            {newProducts.map((product) => (
              <ProductCard key={`new-${product.id}`} product={product} badge="new" />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p className="empty-text">Hiện chưa có sản phẩm mới nào được cập nhật.</p>
            <span className="empty-subtext">Vui lòng quay lại sau để xem các sản phẩm mới nhất.</span>
          </div>
        )}
      </section>

      {/* ========================================================
          KHU VỰC B: SẢN PHẨM NỔI BẬT / HOT — HOT
          ======================================================== */}
      <section id="san-pham-hot" className="product-section section-hot-products">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-badge-tag badge-tag-hot">XU HƯỚNG 🔥</div>
            <h2 className="section-title">Sản phẩm HOT</h2>
            <p className="section-description">
              Những sản phẩm công nghệ bán chạy và được cộng đồng quan tâm nhiều nhất.
            </p>
          </div>
          <Link href="/products" className="view-all-link">
            <span>Xem tất cả</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Đang tải danh sách sản phẩm HOT...</p>
          </div>
        ) : error ? (
          <div className="error-state-box">
            <p>{error}</p>
          </div>
        ) : hotProducts.length > 0 ? (
          <div className="products-grid">
            {hotProducts.map((product) => (
              <ProductCard key={`hot-${product.id}`} product={product} badge="hot" />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p className="empty-text">Hiện chưa có sản phẩm HOT nào.</p>
            <span className="empty-subtext">Danh sách sản phẩm nổi bật sẽ sớm được bổ sung.</span>
          </div>
        )}
      </section>

      {/* ========================================================
          BANNER QUẢNG CÁO GIỮA TRANG (THAM KHẢO ẢNH ELECTRO)
          ======================================================== */}
      <section className="mid-banner-strip">
        <div className="mid-banner-container">
          <div className="mid-banner-card banner-card-blue">
            <div className="mid-banner-info">
              <span className="mid-banner-subtitle">SIÊU PHẨM LAPTOP G9 ULTRA 4K</span>
              <h3>Trang bị vi xử lý Core i7 thế hệ mới</h3>
              <p>Trải nghiệm tốc độ xử lý đỉnh cao cho công việc & sáng tạo</p>
              <Link href="/products" className="mid-banner-btn">
                Tìm hiểu thêm
              </Link>
            </div>
          </div>

          <div className="mid-banner-card banner-card-dark">
            <div className="mid-banner-info">
              <span className="mid-banner-subtitle">ĐỒNG HỒ THÔNG MINH SMART G3</span>
              <h3>Hỗ trợ kết nối 4G LTE độc lập</h3>
              <p>Màn hình AMOLED sắc nét, theo dõi sức khỏe 24/7</p>
              <Link href="/products" className="mid-banner-btn yellow-btn">
                Xem ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          KHU VỰC C: SẢN PHẨM KHUYẾN MÃI — SALE
          ======================================================== */}
      <section id="khuyen-mai" className="product-section section-sale-products">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-badge-tag badge-tag-sale">ƯU ĐÃI ĐẶC BIỆT ⚡</div>
            <h2 className="section-title">Đang khuyến mãi</h2>
            <p className="section-description">
              Cơ hội mua sắm thiết bị điện tử chính hãng với mức giá giảm trực tiếp cực sốc.
            </p>
          </div>
          <Link href="/products" className="view-all-link">
            <span>Xem tất cả khuyến mãi</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Đang tải danh sách sản phẩm khuyến mãi...</p>
          </div>
        ) : error ? (
          <div className="error-state-box">
            <p>{error}</p>
          </div>
        ) : saleProducts.length > 0 ? (
          <div className="products-grid">
            {saleProducts.map((product) => (
              <ProductCard key={`sale-${product.id}`} product={product} badge="sale" />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p className="empty-text">Hiện tại chưa có sản phẩm nào đang trong chương trình giảm giá.</p>
            <span className="empty-subtext">Hãy theo dõi thường xuyên để không bỏ lỡ những ưu đãi hấp dẫn sắp tới!</span>
          </div>
        )}
      </section>

      {/* ========================================================
          KHU VỰC D: SẢN PHẨM ĐỀ XUẤT — FEATURED
          ======================================================== */}
      <section id="de-xuat" className="product-section section-featured-products">
        <div className="section-header">
          <div className="section-title-wrap">
            <div className="section-badge-tag badge-tag-featured">GỢI Ý RIÊNG</div>
            <h2 className="section-title">Sản phẩm nổi bật dành cho bạn</h2>
            <p className="section-description">
              Những gợi ý sản phẩm công nghệ phù hợp nhất dựa trên xu hướng mua sắm hôm nay.
            </p>
          </div>
          <Link href="/products" className="view-all-link">
            <span>Xem tất cả</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="loading-state-box">
            <div className="spinner"></div>
            <p>Đang tải danh sách sản phẩm đề xuất...</p>
          </div>
        ) : error ? (
          <div className="error-state-box">
            <p>{error}</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="products-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={`featured-${product.id}`} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state-box">
            <p className="empty-text">Chưa có sản phẩm đề xuất phù hợp.</p>
            <span className="empty-subtext">Chúng tôi đang cập nhật thêm nhiều sản phẩm chất lượng dành cho bạn.</span>
          </div>
        )}
      </section>

      {/* ========================================================
          5. ĐỐI TÁC VÀ THƯƠNG HIỆU HÀNG ĐẦU (BRAND SHOWCASE)
          ======================================================== */}
      <section className="brands-showcase-section">
        <div className="brands-container">
          <span className="brands-title">THƯƠNG HIỆU CÔNG NGHỆ CHÍNH HÃNG</span>
          <div className="brands-list">
            <span className="brand-logo-text">APPLE</span>
            <span className="brand-logo-text">SAMSUNG</span>
            <span className="brand-logo-text">SONY</span>
            <span className="brand-logo-text">ASUS</span>
            <span className="brand-logo-text">DELL</span>
            <span className="brand-logo-text">LENOVO</span>
            <span className="brand-logo-text">XIAOMI</span>
          </div>
        </div>
      </section>
    </div>
  );
}