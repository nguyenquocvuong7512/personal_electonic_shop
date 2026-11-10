'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authService } from '@/services/authService';
import '@/styles/shop/login.css';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    matkhau: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Gọi hàm login từ authService
      const data = await authService.login(formData.email, formData.matkhau);
      const user = data.user;

      // 2. Điều hướng dựa vào vaitro
      if (user && user.vaitro === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setError(
        err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Đăng nhập</h2>

      {error && <div className="login-error-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="login-form">
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Mật khẩu (*)</label>
            <Link
              href="/forgot-password"
              style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: 600 }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#d4aa00')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#6b7280')}
            >
              Quên mật khẩu?
            </Link>
          </div>
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

        <button type="submit" disabled={loading} className="btn-submit-login">
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="login-register-prompt">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="register-link">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
