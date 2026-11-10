
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';

export default function AdminGuard({ children }) {
  const router = useRouter();

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const checkAdminPermission = async () => {
      const token = localStorage.getItem('auth_token');

      // Chưa đăng nhập: chuyển đến trang đăng nhập.
      if (!token) {
        if (isMounted) {
          setErrorMessage('Bạn chưa đăng nhập.');
          setLoading(false);
        }

        router.replace('/login');
        return;
      }

      try {
        // Backend phải xác minh token và quyền Admin.
        await api.get('/admin/test');

        if (isMounted) {
          setIsAuthorized(true);
        }
      } catch (err) {
        if (!isMounted) return;

        console.error('Xác thực Admin thất bại:', err);

        const status = err?.response?.status;

        if (status === 403) {
          // Không có quyền Admin nhưng không tự xóa phiên đăng nhập.
          setErrorMessage(
            'Bạn không có quyền truy cập trang quản trị.'
          );
          router.replace('/');
        } else if (status === 401) {
          setErrorMessage(
            'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
          );

          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_info');

          router.replace('/login');
        } else {
          setErrorMessage(
            'Không thể xác minh quyền truy cập. Vui lòng thử lại.'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAdminPermission();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="admin-status-screen">
        <div className="admin-status-card">
          <div className="spinner"></div>
          <p>Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="admin-status-screen">
        <div className="admin-status-card error">
          <div className="error-icon">🚫</div>
          <h2>Truy cập bị từ chối</h2>
          <p className="error-text">
            {errorMessage || 'Bạn không có quyền truy cập.'}
          </p>

          <button
            onClick={() => router.replace('/')}
            className="btn-redirect-now"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
