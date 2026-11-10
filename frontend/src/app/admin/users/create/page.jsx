"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { userService } from "@/services/userService";
import "@/styles/admin/users.css";

export default function AdminCreateUserPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    ten: "",
    email: "",
    matkhau: "",
    sodienthoai: "",
    diachi: "",
    vaitro: "user",
    trangthai: "hoatdong",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.matkhau.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        sodienthoai: form.sodienthoai.trim() || null,
        diachi: form.diachi.trim() || null,
      };

      const response = await userService.create(payload);

      setSuccess(response?.message || "Tạo người dùng thành công.");

      // Chuyển về danh sách sau khi tạo thành công.
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      console.error("Lỗi tạo người dùng:", err);

      const validationErrors = err.response?.data?.errors;
      const firstValidationError = validationErrors
        ? Object.values(validationErrors).flat()[0]
        : null;

      setError(
        firstValidationError ||
          err.response?.data?.message ||
          "Không thể tạo người dùng. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-users-page">
      <div className="admin-header">
        <h1>Thêm người dùng</h1>
      </div>

      <form className="user-edit-form" onSubmit={handleSubmit}>
        {error && <div className="admin-status-message error">{error}</div>}

        {success && <div className="admin-status-message">{success}</div>}

        <div className="user-edit-field">
          <label htmlFor="ten">Họ và tên *</label>
          <input
            id="ten"
            name="ten"
            value={form.ten}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="example@email.com"
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="matkhau">Mật khẩu *</label>
          <input
            id="matkhau"
            name="matkhau"
            type="password"
            value={form.matkhau}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Ít nhất 8 ký tự"
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
            placeholder="Nhập số điện thoại"
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
            placeholder="Nhập địa chỉ"
          />
        </div>

        <div className="user-edit-field">
          <label htmlFor="vaitro">Vai trò *</label>
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
          <label htmlFor="trangthai">Trạng thái *</label>
          <select
            id="trangthai"
            name="trangthai"
            value={form.trangthai}
            onChange={handleChange}
            required
          >
            <option value="hoatdong">Hoạt động</option>
            <option value="khoa">Khóa</option>
          </select>
        </div>

        <div className="user-edit-actions">
          <button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo người dùng"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/users")}
            disabled={loading}
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
