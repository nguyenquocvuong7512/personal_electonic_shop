'use client';

import React from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  return (
    <div className="admin-dashboard">
      <h1 style={{ marginBottom: '20px', color: '#1e293b' }}>
        Tổng quan hệ thống
      </h1>

      {/* Danh sách thẻ thống kê nhanh */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        <div style={cardStyle}>
          <h3>📦 Sản phẩm</h3>
          <p style={numberStyle}>---</p>
          <Link href="/admin/products" style={linkStyle}>Xem danh sách &rarr;</Link>
        </div>

        <div style={cardStyle}>
          <h3>📦 Danh mục</h3>
          <p style={numberStyle}>---</p>
          <Link href="/admin/categories" style={linkStyle}>Xem danh sách &rarr;</Link>
        </div>

        <div style={cardStyle}>
          <h3>🏷️ Thương hiệu</h3>
          <p style={numberStyle}>---</p>
          <Link href="/admin/brands" style={linkStyle}>Xem danh sách &rarr;</Link>
        </div>

        <div style={cardStyle}>
          <h3>🛒 Đơn hàng</h3>
          <p style={numberStyle}>---</p>
          <Link href="/admin/orders" style={linkStyle}>Quản lý đơn hàng &rarr;</Link>
        </div>

        <div style={cardStyle}>
          <h3>👥 Tài khoản</h3>
          <p style={numberStyle}>---</p>
          <Link href="/admin/users" style={linkStyle}>Quản lý người dùng &rarr;</Link>
        </div>
      </div>
    </div>
  );
}

// Inline style đơn giản cho các thẻ thống kê nhanh
const cardStyle = {
  background: '#ffffff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
};

const numberStyle = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#0284c7',
  margin: '10px 0',
};

const linkStyle = {
  fontSize: '14px',
  color: '#64748b',
  textDecoration: 'none',
  fontWeight: '500',
};