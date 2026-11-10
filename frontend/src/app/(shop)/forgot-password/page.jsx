'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import '@/styles/shop/login.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultData, setResultData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email của bạn.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await authService.forgotPassword(email.trim());
      setResultData(data);
    } catch (err) {
      console.error('Lỗi yêu cầu khôi phục mật khẩu:', err);
      setError(
        err.response?.data?.message ||
          'Không thể xử lý yêu cầu. Vui lòng kiểm tra lại email hoặc thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Quên mật khẩu</h2>

      {error && <div className="login-error-alert">{error}</div>}

      {resultData ? (
        <div style={{ textAlign: 'center', lineHeight: 1.6 }}>
          <div
            style={{
              padding: '14px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              color: '#065f46',
              fontSize: '14px',
              marginBottom: '20px',
            }}
          >
            {resultData.message || 'Mã xác thực khôi phục mật khẩu đã được tạo.'}
          </div>

          <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 12px' }}>
            Mã xác thực của bạn dành cho tài khoản <strong>{resultData.email}</strong>:
          </p>

          <div
            style={{
              display: 'inline-block',
              padding: '10px 24px',
              background: '#eff6ff',
              border: '2px dashed #3b82f6',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '22px',
              fontWeight: 800,
              letterSpacing: '3px',
              color: '#1d4ed8',
              marginBottom: '24px',
            }}
          >
            {resultData.reset_token}
          </div>

          <button
            type="button"
            className="btn-submit-login"
            onClick={() =>
              router.push(
                `/reset-password?email=${encodeURIComponent(
                  resultData.email
                )}&token=${resultData.reset_token}`
              )
            }
          >
            Tiếp tục đặt lại mật khẩu ➔
          </button>

          <div style={{ marginTop: '20px' }}>
            <Link href="/login" className="register-link" style={{ fontSize: '13px' }}>
              ◀ Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p
            style={{
              fontSize: '13px',
              color: '#6b7280',
              textAlign: 'center',
              margin: '-12px 0 20px',
              lineHeight: 1.5,
            }}
          >
            Nhập email đã đăng ký để nhận mã xác thực đặt lại mật khẩu của bạn.
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email tài khoản (*)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="nhapemail@example.com"
                required
                className="form-input"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit-login">
              {loading ? 'Đang kiểm tra...' : 'Gửi mã xác thực'}
            </button>
          </form>

          <p className="login-register-prompt">
            Nhớ lại mật khẩu?{' '}
            <Link href="/login" className="register-link">
              Đăng nhập ngay
            </Link>
          </p>
        </>
      )}
    </div>
  );
}

