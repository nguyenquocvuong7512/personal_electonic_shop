
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";

export default function UserTable({ users, loading, error }) {
  const router = useRouter();

  // Xu ly xoa mem nguoi dung.
  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn đưa người dùng "${user.ten}" vào thùng rác không?`
    );

    if (!confirmed) return;

    try {
      await userService.delete(user.id);

      alert("Đã đưa người dùng vào thùng rác.");

      // Tai lai danh sach sau khi xoa.
      window.location.reload();
    } catch (err) {
      console.error("Lỗi xóa người dùng:", err);

      alert(
        err.response?.data?.message ||
          "Không thể xóa người dùng. Vui lòng thử lại."
      );
    }
  };

  // Trang thai tai du lieu.
  if (loading) {
    return (
      <div className="admin-status-message">
        Đang tải danh sách người dùng...
      </div>
    );
  }

  // Hien thi loi API.
  if (error) {
    return (
      <div className="admin-status-message error">
        {error}
      </div>
    );
  }

  // Danh sach rong.
  if (!users || users.length === 0) {
    return (
      <div className="admin-status-message">
        Chưa có người dùng nào.
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên người dùng</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {users.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>

              <td>
                <strong>{item.ten || "Chưa cập nhật"}</strong>
              </td>

              <td>{item.email || "-"}</td>

              <td>{item.sodienthoai || "-"}</td>

              <td>{item.diachi || "-"}</td>

              <td>
                <span
                  className={`user-role-badge ${item.vaitro || ""}`}
                >
                  {item.vaitro || "Chưa xác định"}
                </span>
              </td>

              <td>
                <span
                  className={`user-status-badge ${item.trangthai || ""}`}
                >
                  {item.trangthai === "hoatdong"
                    ? "Hoạt động"
                    : item.trangthai === "khoa"
                      ? "Đã khóa"
                      : item.trangthai || "Chưa xác định"}
                </span>
              </td>

              <td>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString("vi-VN")
                  : "-"}
              </td>

              <td>
                <div className="user-table-actions">
                  <button
                    type="button"
                    className="user-edit-btn"
                    onClick={() =>
                      router.push(`/admin/users/edit/${item.id}`)
                    }
                  >
                    Sửa
                  </button>

                  <button
                    type="button"
                    className="user-delete-btn"
                    onClick={() => handleDelete(item)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
