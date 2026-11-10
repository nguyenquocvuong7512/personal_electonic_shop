import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import AdminGuard from '@/components/admin/AdminGuard'; // Nối component Guard vừa tạo
import '@/styles/admin/layout.css';

export default function AdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="admin-layout-container">
        <Sidebar />
        <div className="admin-main-wrapper">
          <Header />
          <main className="admin-content-body">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}