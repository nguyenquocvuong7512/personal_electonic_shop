'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { title: 'Dashboard', path: '/admin', icon: '📊' },
    { title: 'Sản phẩm', path: '/admin/products', icon: '📦' },
    { title: 'Danh mục', path: '/admin/categories', icon: '📂' },
    { title: 'Thương hiệu', path: '/admin/brands', icon: '🏷️' },
    { title: 'Đơn hàng', path: '/admin/orders', icon: '🛒' },
    { title: 'Khuyến mãi', path: '/admin/promotions', icon: '🎟️' },
    { title: 'Bài viết', path: '/admin/posts', icon: '📝' },
    { title: 'Danh mục bài viết', path: '/admin/topics', icon: '📂' },
    { title: 'Tài khoản', path: '/admin/users', icon: '👥' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>Admin Portal</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== '/admin' && pathname.startsWith(item.path + '/'));

            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-title">{item.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
