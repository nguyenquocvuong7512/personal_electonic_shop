
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import UserTable from "@/components/admin/UserTable";
import { userService } from "@/services/userService";
import "@/styles/admin/users.css";

export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  // Lấy danh sách người dùng từ Laravel API.
  const fetchUsers = useCallback(
    async (
      searchKeyword = keyword,
      searchRole = role,
      searchStatus = status
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await userService.getAll({
          per_page: 10,
          keyword: searchKeyword.trim(),
          vaitro: searchRole,
          trangthai: searchStatus,
        });

        const dataList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
            ? response.data.data
            : [];

        setUsers(dataList);
      } catch (err) {
        console.error("Lỗi khi lấy danh sách người dùng:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải danh sách người dùng. Vui lòng kiểm tra kết nối và quyền truy cập."
        );
      } finally {
        setLoading(false);
      }
    },
    [keyword, role, status]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Xóa toàn bộ điều kiện tìm kiếm và bộ lọc.
  const handleReset = () => {
    setKeyword("");
    setRole("");
    setStatus("");
    fetchUsers("", "", "");
  };

  // Tìm kiếm bằng nút Lọc hoặc phím Enter.
  const handleSearch = () => {
    fetchUsers(keyword, role, status);
  };

  return (
    <div className="admin-users-page">
      {/* Tiêu đề và mô tả trang */}
      <div className="admin-users-heading">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tài khoản, vai trò và trạng thái người dùng.</p>
        </div>

        <div className="admin-users-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn-primary"
            onClick={() => router.push("/admin/users/create")}
          >
            <span aria-hidden="true">＋</span>
            Thêm người dùng
          </button>

          <button
            type="button"
            className="admin-users-btn admin-users-btn-secondary"
            onClick={() => router.push("/admin/users/trash")}
          >
            <span aria-hidden="true">▤</span>
            Thùng rác
          </button>
        </div>
      </div>

      {/* Khu vực tìm kiếm và bộ lọc */}
      <section className="admin-users-filter">
        <div className="admin-users-filter-heading">
          <div>
            <h2>Bộ lọc người dùng</h2>
            <p>Tìm theo tên, email hoặc số điện thoại.</p>
          </div>
        </div>

        <div className="admin-users-filter-grid">
          <div className="admin-users-filter-field admin-users-keyword">
            <label htmlFor="user-keyword">Từ khóa</label>
            <input
              id="user-keyword"
              type="text"
              placeholder="Nhập thông tin cần tìm..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>

          <div className="admin-users-filter-field">
            <label htmlFor="user-role">Vai trò</label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="thanhvien">Người dùng</option>
            </select>
          </div>

          <div className="admin-users-filter-field">
            <label htmlFor="user-status">Trạng thái</label>
            <select
              id="user-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="hoatdong">Hoạt động</option>
              <option value="khoa">Đã khóa</option>
            </select>
          </div>
        </div>

        <div className="admin-users-filter-actions">
          <button
            type="button"
            className="admin-users-btn admin-users-btn-primary"
            onClick={handleSearch}
            disabled={loading}
          >
            Tìm kiếm
          </button>

          <button
            type="button"
            className="admin-users-btn admin-users-btn-light"
            onClick={handleReset}
            disabled={loading}
          >
            Đặt lại
          </button>
        </div>
      </section>

      {/* Bảng danh sách người dùng */}
      <section className="admin-users-list">
        <div className="admin-users-list-heading">
          <div>
            <h2>Danh sách người dùng</h2>
            <p>Thông tin các tài khoản đang hoạt động trong hệ thống.</p>
          </div>
        </div>

        <UserTable
          users={users}
          loading={loading}
          error={error}
        />
      </section>
    </div>
  );
}
