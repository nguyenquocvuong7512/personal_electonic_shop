import api from './api';

export const orderService = {
  getAll: async (params = {}) => {
    const response = await api.get('/admin/orders', { params });
    return response.data?.data;
  },

  getById: async (id) => {
    const response = await api.get(`/admin/orders/${id}`);
    return response.data?.data;
  },

  updateStatus: async (id, trangthai, ghichu) => {
    const response = await api.patch(`/admin/orders/${id}/status`, {
      trangthai,
      ghichu,
    });
    return response.data;
  },

  cancel: async (id, ghichu) => {
    const response = await api.patch(`/admin/orders/${id}/cancel`, {
      ghichu,
    });
    return response.data;
  },

  // Đặt hàng (Lưu đơn hàng vào Database qua API)
  checkout: async (data) => {
    const sessionId =
      typeof window !== 'undefined'
        ? localStorage.getItem('cart_session_id')
        : null;
    const config = sessionId
      ? { headers: { 'X-Session-ID': sessionId } }
      : {};
    const response = await api.post('/checkout', data, config);
    return response.data;
  },

  // Lấy danh sách đơn hàng người dùng trực tiếp từ Database
  getMyOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data?.data || [];
  },

  // Lấy chi tiết đơn hàng
  getMyOrderDetail: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data?.data;
  },

  // Khách hàng hủy đơn hàng (khi đang ở trạng thái Chờ xác nhận)
  cancelMyOrder: async (id, ghichu = '') => {
    const response = await api.patch(`/orders/${id}/cancel`, { ghichu });
    return response.data;
  },
};
