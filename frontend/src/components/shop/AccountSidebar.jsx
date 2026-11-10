'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AccountSidebar({
  activeTab = 'profile',
  user = null,
  orderCount = null,
}) {
  const pathname = usePathname();

  // Xác định active menu dựa trên URL hoặc prop
  const currentActive =
    activeTab || (pathname?.includes('/orders') ? 'orders' : 'profile');

  const menuItems = [
    {
      id: 'profile',
      label: 'Thông tin tài khoản',
      href: '/profile',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'Danh sách đơn hàng',
      href: '/orders',
      // Chỉ hiển thị số lượng đơn hàng thực tế khi được truyền vào (tránh hardcode sai lệch)
      badge:
        orderCount !== null && orderCount !== undefined
          ? String(orderCount)
          : null,
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'address',
      label: 'Sổ địa chỉ',
      href: '/profile#address',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
    },
    {
      id: 'password',
      label: 'Đổi mật khẩu',
      href: '/profile#password',
      icon: (
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-full">
      {/* Thẻ Sidebar phong cách White Card bo tròn và shadow nhẹ */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        {/* Phần tóm tắt người dùng ở đầu Sidebar */}
        <div className="p-5 border-b border-gray-100 flex items-center gap-3.5 bg-gradient-to-r from-gray-50 to-white">
          <div className="relative">
            <div className="w-13 h-13 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center text-gray-900 font-bold text-lg shadow-sm">
              {user?.ten ? user.ten.charAt(0).toUpperCase() : 'A'}
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 font-medium">Tài khoản của</p>
            <h3 className="text-base font-bold text-gray-900 truncate">
              {user?.ten || 'Nguyễn Quốc Vượng'}
            </h3>
            <div className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full bg-yellow-100/80 border border-yellow-300 text-[11px] font-semibold text-yellow-800">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              Thành viên VIP
            </div>
          </div>
        </div>

        {/* Danh sách Menu điều hướng */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentActive === item.id;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-yellow-400 text-gray-950 font-bold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={
                      isActive
                        ? 'text-gray-950'
                        : 'text-gray-500 group-hover:text-gray-900'
                    }
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? 'bg-gray-950 text-yellow-400'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-2 mt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_info');
                  window.dispatchEvent(new Event('authChange'));
                  window.location.href = '/login';
                }
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Đăng xuất</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
