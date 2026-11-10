'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import api from '@/services/api';
export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
  }, []);

const handleLogout = async () => {
  try {
    await api.post('/logout');
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
  } finally {
    // Xóa token
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');

    // Chuyển về trang đăng nhập chung
    router.push('/login');
  }
};

  return (
    <header className="admin-top-header">
      <div className="header-search">
        <input type="text" placeholder="Tìm kiếm nhanh..." />
      </div>

      <div className="header-user">
        {/* Nút quay lại giao diện Shop */}
        <Link href="/" className="btn-back-shop">
          🏠 Xem Website
        </Link>

        <span className="user-name">
          Xin chào, {user ? user.ten : 'Admin'} 👋
        </span>
        <div className="user-avatar">
          {user && user.ten ? user.ten.charAt(0).toUpperCase() : 'A'}
        </div>

        <button onClick={handleLogout} className="btn-admin-logout">
          Đăng xuất
        </button>
      </div>
    </header>
  );
}