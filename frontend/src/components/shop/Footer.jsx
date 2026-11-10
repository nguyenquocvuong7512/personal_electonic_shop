'use client';

import React from 'react';
import Link from 'next/link';

// Footer của khu vực Shop phong cách thương mại điện tử Electro
export default function Footer() {
  return (
    <footer className="shop-footer">
      {/* 1. Dải ưu đãi bản tin (Newsletter strip) */}
      <div className="footer-newsletter-strip">
        <div className="shop-footer-container newsletter-flex">
          <div className="newsletter-text">
            <div className="newsletter-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <h3>Đăng ký nhận bản tin khuyến mãi</h3>
              <p>...và nhận ngay voucher <strong>100.000 đ</strong> cho đơn hàng công nghệ đầu tiên</p>
            </div>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn..."
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-btn">
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* 2. Nội dung chính Footer */}
      <div className="shop-footer-main">
        <div className="shop-footer-container footer-grid">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="footer-col brand-col">
            <Link href="/" className="footer-logo">
              <span className="logo-text">Website bán hàng</span>
              <span className="logo-dot">.</span>
            </Link>
            <div className="footer-hotline-box">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#fed700" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <div>
                <span className="hotline-title">Tổng đài hỗ trợ 24/7</span>
                <strong className="hotline-number">1800 6868</strong>
              </div>
            </div>
            <p className="footer-address">
              Địa chỉ: 123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="footer-email">
              Email: lienhe@websitebanhang.vn
            </p>
          </div>

          {/* Cột 2: Danh mục mua sắm nhanh */}
          <div className="footer-col">
            <h4>Danh mục nổi bật</h4>
            <ul className="footer-links">
              <li><Link href="/products">Điện thoại & Máy tính bảng</Link></li>
              <li><Link href="/products">Laptop & Máy tính văn phòng</Link></li>
              <li><Link href="/products">Tai nghe & Thiết bị âm thanh</Link></li>
              <li><Link href="/products">Phụ kiện công nghệ cao cấp</Link></li>
              <li><Link href="/products">Thiết bị chơi game & Console</Link></li>
              <li><Link href="/products">Máy ảnh & Thiết bị kỹ thuật số</Link></li>
            </ul>
          </div>

          {/* Cột 3: Chăm sóc khách hàng */}
          <div className="footer-col">
            <h4>Chăm sóc khách hàng</h4>
            <ul className="footer-links">
              <li><Link href="/products">Tra cứu đơn hàng</Link></li>
              <li><Link href="/products">Chính sách bảo hành 12 tháng</Link></li>
              <li><Link href="/products">Chính sách đổi trả trong 7 ngày</Link></li>
              <li><Link href="/products">Hướng dẫn thanh toán & Vận chuyển</Link></li>
              <li><Link href="/products">Câu hỏi thường gặp (FAQ)</Link></li>
            </ul>
          </div>

          {/* Cột 4: Về chúng tôi & Kết nối */}
          <div className="footer-col">
            <h4>Về chúng tôi</h4>
            <ul className="footer-links">
              <li><Link href="/products">Giới thiệu cửa hàng</Link></li>
              <li><Link href="/products">Hệ thống showroom toàn quốc</Link></li>
              <li><Link href="/products">Tuyển dụng nhân tài</Link></li>
              <li><Link href="/products">Cam kết bảo mật thông tin</Link></li>
            </ul>

            <div className="footer-social-links">
              <span className="social-label">Kết nối với chúng tôi:</span>
              <div className="social-icons">
                <span className="social-badge">Facebook</span>
                <span className="social-badge">YouTube</span>
                <span className="social-badge">Zalo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dải bản quyền & Cổng thanh toán */}
      <div className="shop-footer-bottom">
        <div className="shop-footer-container footer-bottom-flex">
          <p className="copyright-text">
            © 2026 <strong>Website bán hàng</strong>. Bản quyền thuộc về hệ thống thương mại điện tử công nghệ.
          </p>
          <div className="payment-badges">
            <span className="payment-tag">Visa</span>
            <span className="payment-tag">MasterCard</span>
            <span className="payment-tag">MoMo</span>
            <span className="payment-tag">ZaloPay</span>
            <span className="payment-tag">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}