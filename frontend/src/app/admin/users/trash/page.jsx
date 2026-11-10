
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { userService } from "@/services/userService";
import "@/styles/admin/users.css";

export default function UserTrashPage() {
  // Danh sach nguoi dung da xoa mem
  const [users, setUsers] = useState([]);

  // Tu khoa tim kiem
  const [search, setSearch] = useState("");

  // Trang thai tai du lieu va xu ly thao tac
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // Thong bao ket qua
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Lay danh sach nguoi dung trong thung rac
  const fetchTrash = useCallback(async (keyword = "") => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await userService.getTrash({
        keyword: keyword.trim(),
        per_page: 10,
      });

      // Ho tro ca response phan trang va response mang truc tiep
      const data = response?.data;

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];

      setUsers(userList);
    } catch (err) {
      setUsers([]);
      setError(
        err.response?.data?.message ||
          "Không thể tải danh sách người dùng đã xóa."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Tai du lieu khi mo trang
  useEffect(() => {
    fetchTrash("");
  }, [fetchTrash]);

  // Tim kiem nguoi dung trong thung rac
  const handleSearch = (event) => {
    event.preventDefault();
    fetchTrash(search);
  };

  // Lam moi danh sach
  const handleReset = () => {
    setSearch("");
    fetchTrash("");
  };

  // Khoi phuc nguoi dung
  const handleRestore = async (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn khôi phục người dùng "${user.ten}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(user.id);
      setError("");
      setMessage("");

      await userService.restore(user.id);

      setMessage(`Đã khôi phục người dùng "${user.ten}" thành công.`);

      // Tai lai danh sach voi tu khoa hien tai
      await fetchTrash(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể khôi phục người dùng. Vui lòng thử lại."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Xoa vinh vien nguoi dung
  const handleForceDelete = async (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa vĩnh viễn người dùng "${user.ten}"? Thao tác này không thể hoàn tác.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(user.id);
      setError("");
      setMessage("");

      await userService.forceDelete(user.id);

      setMessage(`Đã xóa vĩnh viễn người dùng "${user.ten}".`);

      // Tai lai danh sach sau khi xoa
      await fetchTrash(search);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không thể xóa vĩnh viễn người dùng. Vui lòng thử lại."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Dinh dang ngay xoa
  const formatDeletedDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return parsedDate.toLocaleString("vi-VN");
  };

  return (
    <main className="admin-users-page user-trash-page">
      {/* Tieu de va nut quay lai */}
      <div className="trash-header">
        <div>
          <h1>Thùng rác người dùng</h1>
          <p>
            Quản lý người dùng đã xóa, khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="trash-back-button"
        >
          ← Quản lý người dùng
        </Link>
      </div>

      {/* Tim kiem nguoi dung */}
      <form
        className="trash-search-form"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Nhập tên, email hoặc số điện thoại..."
          aria-label="Tìm kiếm người dùng trong thùng rác"
        />

        <button type="submit" disabled={loading}>
          Tìm kiếm
        </button>

        <button
          type="button"
          className="trash-reset-button"
          disabled={loading}
          onClick={handleReset}
        >
          Làm mới
        </button>
      </form>

      {/* Thong bao ket qua */}
      {message && (
        <div
          className="trash-alert trash-alert-success"
          role="status"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className="trash-alert trash-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Bang danh sach nguoi dung da xoa */}
      <section className="trash-table-card">
        <div className="trash-table-heading">
          <h2>Danh sách người dùng đã xóa</h2>
          <span>{users.length} người dùng</span>
        </div>

        {loading ? (
          <div className="trash-empty-state">
            Đang tải dữ liệu...
          </div>
        ) : users.length === 0 ? (
          <div className="trash-empty-state">
            <div className="trash-empty-icon">🗑️</div>
            <h3>Thùng rác đang trống</h3>
            <p>Không tìm thấy người dùng nào đã bị xóa.</p>
          </div>
        ) : (
          <div className="trash-table-wrapper">
            <table className="trash-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Họ và tên</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Vai trò</th>
                  <th>Ngày xóa</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>

                    <td className="trash-user-name">
                      {user.ten || "—"}
                    </td>

                    <td>{user.email || "—"}</td>

                    <td>{user.sodienthoai || "—"}</td>

                    <td>
                      {user.vaitro === "admin"
                        ? "Quản trị viên"
                        : user.vaitro === "user" ||
                            user.vaitro === "thanhvien"
                          ? "Thành viên"
                          : user.vaitro || "—"}
                    </td>

                    <td>
                      {formatDeletedDate(user.deleted_at)}
                    </td>

                    <td>
                      <div className="trash-actions">
                        <button
                          type="button"
                          className="trash-restore-button"
                          disabled={processingId !== null}
                          onClick={() => handleRestore(user)}
                        >
                          {processingId === user.id
                            ? "Đang xử lý..."
                            : "Khôi phục"}
                        </button>

                        <button
                          type="button"
                          className="trash-delete-button"
                          disabled={processingId !== null}
                          onClick={() => handleForceDelete(user)}
                        >
                          Xóa vĩnh viễn
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
