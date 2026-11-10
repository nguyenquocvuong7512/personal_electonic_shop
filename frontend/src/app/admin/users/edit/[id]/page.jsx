
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import "@/styles/admin/users.css";

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  // Lưu thông tin người dùng trong biểu mẫu.
  const [form, setForm] = useState({
    ten: "",
    email: "",
    sodienthoai: "",
    diachi: "",
    vaitro: "user",
    trangthai: "hoatdong",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Tải thông tin người dùng theo ID trên URL.
  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await userService.getById(id);
        const user = response.data;

        setForm({
          ten: user.ten || "",
          email: user.email || "",
          sodienthoai: user.sodienthoai || "",
          diachi: user.diachi || "",
          vaitro: user.vaitro || "user",
          trangthai: user.trangthai || "hoatdong",
        });
      } catch (err) {
        console.error("Lỗi tải thông tin người dùng:", err);

        setError(
          err.response?.data?.message ||
            "Không thể tải thông tin người dùng."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  // Cập nhật giá trị của từng trường trong biểu mẫu.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Gửi thông tin cập nhật lên máy chủ Laravel.
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await userService.update(id, form);

      setMessage(
        response.message || "Cập nhật người dùng thành công."
      );

      // Quay lại danh sách sau khi cập nhật thành công.
      setTimeout(() => {
        router.push("/admin/users");
      }, 800);
    } catch (err) {
      console.error("Lỗi cập nhật người dùng:", err);

      // Lấy lỗi xác thực do Laravel trả về.
      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          err.response?.data?.message ||
          "Cập nhật người dùng thất bại."
      );
    } finally {
      setSaving(false);
    }
  };

  // Hiển thị trạng thái khi đang tải dữ liệu.
  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="admin-status-message">
          Đang tải thông tin người dùng...
        </div>
      </div>
    );
  }

  // Hiển thị lỗi nếu không tải được thông tin người dùng.
  if (error && !form.ten && !form.email) {
    return (
      <div className="admin-users-page">
        <div className="admin-status-message error">
          {error}
        </div>

        <button
          type="button"
          onClick={() => router.push("/admin/users")}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <h1>Chỉnh sửa người dùng #{id}</h1>
      </div>

      <form className="user-edit-form" onSubmit={handleSubmit}>
        <div className="user-edit-field">
          <label htmlFor="ten">Tên người dùng</label>
          <input
            id="ten"
            name="ten"
            value={form.ten}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="sodienthoai">Số điện thoại</label>
          <input
            id="sodienthoai"
            name="sodienthoai"
            value={form.sodienthoai}
            onChange={handleChange}
            maxLength={20}
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="diachi">Địa chỉ</label>
          <input
            id="diachi"
            name="diachi"
            value={form.diachi}
            onChange={handleChange}
            maxLength={255}
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="vaitro">Vai trò</label>
          <select
            id="vaitro"
            name="vaitro"
            value={form.vaitro}
            onChange={handleChange}
            required
          >
            <option value="thanhvien">Người dùng</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>

        <div className="user-edit-field">
          <label htmlFor="trangthai">Trạng thái</label>
          <select
            id="trangthai"
            name="trangthai"
            value={form.trangthai}
            onChange={handleChange}
            required
          >
            <option value="hoatdong">Hoạt động</option>
            <option value="khoa">Đã khóa</option>
          </select>
        </div>

        {error && (
          <div className="admin-status-message error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-status-message">
            {message}
          </div>
        )}

        <div className="user-edit-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          <button
            type="button"
            className="user-edit-cancel"
            onClick={() => router.push("/admin/users")}
            disabled={saving}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
