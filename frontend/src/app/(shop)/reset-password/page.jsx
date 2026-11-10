'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '@/services/authService';
import '@/styles/shop/login.css';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: searchParams.get('email') || '',
    token: (searchParams.get('token') || '').toUpperCase(),
    matkhau: '',
    matkhau_confirmation: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'token' ? value.toUpperCase().trim() : value,
    }));

    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.email.trim()) {
      setError('Vui lòng nhập địa chỉ email.');
      return;
    }

    if (!formData.token.trim()) {
      setError('Vui lòng nhập mã xác thực đã nhận.');
      return;
    }

    if (!formData.matkhau || formData.matkhau.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    if (formData.matkhau !== formData.matkhau_confirmation) {
      setError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.resetPassword({
        email: formData.email.trim(),
        token: formData.token.trim(),
        matkhau: formData.matkhau,
        matkhau_confirmation: formData.matkhau_confirmation,
      });

      setSuccessMessage(
        res.message || 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay bây giờ.'
      );
    } catch (err) {
      console.error('Lỗi đặt lại mật khẩu:', err);
      setError(
        err.response?.data?.message ||
          'Không thể đặt lại mật khẩu. Vui lòng kiểm tra lại mã xác thực hoặc thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Đặt lại mật khẩu</h2>

      {error && <div className="login-error-alert">{error}</div>}

      {successMessage ? (
        <div style={{ textAlign: 'center', lineHeight: 1.6 }}>
          <div
            style={{
              padding: '16px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#065f46',
              fontSize: '14px',
              marginBottom: '24px',
            }}
          >
            {successMessage}
          </div>

          <button
            type="button"
            className="btn-submit-login"
            onClick={() => router.push('/login')}
          >
            Đăng nhập ngay ➔
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email tài khoản (*)</label>
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
            <label className="form-label">Mã xác thực (*)</label>
            <input
              type="text"
              name="token"
              value={formData.token}
              onChange={handleChange}
              placeholder="VD: A8F3K9"
              required
              maxLength={20}
              className="form-input"
              style={{ fontFamily: 'monospace', letterSpacing: '2px', fontWeight: 700 }}
            />
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              Mã xác thực gồm 6 ký tự đã được cung cấp khi bạn gửi yêu cầu quên mật khẩu.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Mật khẩu mới (*)</label>
            <input
              type="password"
              name="matkhau"
              value={formData.matkhau}
              onChange={handleChange}
              placeholder="Tối thiểu 6 ký tự"
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Xác nhận mật khẩu mới (*)</label>
            <input
              type="password"
              name="matkhau_confirmation"
              value={formData.matkhau_confirmation}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu mới"
              required
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit-login">
            {loading ? 'Đang cập nhật...' : 'Xác nhận đặt lại mật khẩu'}
          </button>

          <p className="login-register-prompt">
            <Link href="/login" className="register-link">
              ◀ Quay lại Đăng nhập
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="login-container" style={{ textAlign: 'center', padding: '50px 20px' }}>
          Đang tải biểu mẫu...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
