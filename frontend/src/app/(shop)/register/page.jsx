'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import '@/styles/shop/register.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    ten: '',
    email: '',
    matkhau: '',
    matkhau_confirmation: '',
    sodienthoai: '',
    diachi: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu nhập lại
    if (formData.matkhau !== formData.matkhau_confirmation) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      setLoading(false);
      return;
    }

    try {
      await authService.register(formData);
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      
      // Chuyển hướng sang trang đăng nhập sau 1.5 giây
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setError(
        err.response?.data?.message || 
        err.response?.data?.errors?.email?.[0] || 
        'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Đăng ký tài khoản</h2>

      {error && <div className="register-error-alert">{error}</div>}
      {success && <div className="register-success-alert">{success}</div>}

      <form onSubmit={handleSubmit} className="register-form">
        <div className="form-group">
          <label className="form-label">Họ và tên (*)</label>
          <input
            type="text"
            name="ten"
            value={formData.ten}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email (*)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nhapemail@example.com"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu (*)</label>
          <input
            type="password"
            name="matkhau"
            value={formData.matkhau}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu (*)</label>
          <input
            type="password"
            name="matkhau_confirmation"
            value={formData.matkhau_confirmation}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại</label>
          <input
            type="text"
            name="sodienthoai"
            value={formData.sodienthoai}
            onChange={handleChange}
            placeholder="0912345678"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Địa chỉ</label>
          <input
            type="text"
            name="diachi"
            value={formData.diachi}
            onChange={handleChange}
            placeholder="Số 123, đường ABC..."
            className="form-input"
          />
        </div>

        <button type="submit" disabled={loading} className="btn-submit-register">
          {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
        </button>
      </form>

      <p className="register-login-prompt">
        Đã có tài khoản?{' '}
        <Link href="/login" className="login-link">
          Đăng nhập tại đây
        </Link>
      </p>
    </div>
  );
}