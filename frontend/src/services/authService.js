import api from '@/services/api';

export const authService = {
  register: async (formData) => {
    const response = await api.post('/register', {
      ten: formData.ten,
      email: formData.email,
      matkhau: formData.matkhau,
      sodienthoai: formData.sodienthoai || null,
      diachi: formData.diachi || null,
    });

    return response.data;
  },

  login: async (email, matkhau) => {
    const response = await api.post('/login', {
      email,
      matkhau,
      password: matkhau,
    });

    const { token, user } = response.data;

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_info', JSON.stringify(user));
      // Báo hiệu cho Header biết trạng thái auth đã thay đổi
      window.dispatchEvent(new Event('authChange'));
    }

    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async ({ email, token, matkhau, matkhau_confirmation }) => {
    const response = await api.post('/reset-password', {
      email,
      token,
      matkhau,
      matkhau_confirmation,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },

  updateProfile: async (formData) => {
    // Laravel nhận POST kèm _method PUT để xử lý FormData
    formData.append('_method', 'PUT');

    const response = await api.post('/profile', formData);

    const updatedUser = response.data?.user;

    if (typeof window !== 'undefined' && updatedUser) {
      localStorage.setItem('user_info', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('authChange'));
    }

    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        // Báo hiệu cho Header biết trạng thái auth đã thay đổi
        window.dispatchEvent(new Event('authChange'));
        window.location.href = '/login';
      }
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user_info');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  isAdmin: () => {
    const user = authService.getUser();
    return user && user.vaitro === 'admin';
  },
};
