import api from './api';

export const chatbotService = {
  // Lấy chính sách cửa hàng từ backend
  getPolicies: async () => {
    try {
      const response = await api.get('/chatbot/policies');
      return response.data?.data;
    } catch (error) {
      console.warn('Không thể tải chính sách từ API chatbot, sử dụng dữ liệu mặc định.', error);
      return null;
    }
  },

  // So sánh sản phẩm dựa trên DB thật
  compareProducts: async (names = [], ids = []) => {
    try {
      const response = await api.post('/chatbot/compare', { names, ids });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể so sánh sản phẩm vào lúc này.',
        data: [],
      };
    }
  },

  // Kiểm tra tồn kho sản phẩm thật
  checkStock: async (keywordOrId) => {
    try {
      const isNum = !isNaN(Number(keywordOrId)) && Number(keywordOrId) > 0;
      const params = isNum ? { id: keywordOrId } : { keyword: keywordOrId };
      const response = await api.get('/chatbot/stock', { params });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Không thể kiểm tra tồn kho.',
      };
    }
  },

  // Tư vấn sản phẩm theo tiêu chí
  consult: async (params = {}) => {
    try {
      const response = await api.get('/chatbot/consult', { params });
      return response.data?.data || [];
    } catch (error) {
      console.warn('Lỗi gọi API tư vấn chatbot:', error);
      return [];
    }
  },

  // Tìm kiếm sản phẩm thông thường
  searchProducts: async (params = {}) => {
    try {
      const response = await api.get('/san-pham', {
        params: {
          per_page: params.per_page || 6,
          search: params.search || undefined,
          danhmuc_id: params.danhmuc_id || undefined,
          thuonghieu_id: params.thuonghieu_id || undefined,
          min_price: params.min_price || undefined,
          max_price: params.max_price || undefined,
          on_sale: params.on_sale ? 1 : undefined,
          in_stock: params.in_stock ? 1 : undefined,
          sort: params.sort || undefined,
          include_mota: 1,
        },
      });
      const resData = response.data?.data;
      return Array.isArray(resData?.data) ? resData.data : Array.isArray(resData) ? resData : [];
    } catch (error) {
      console.error('Lỗi tìm kiếm sản phẩm:', error);
      return [];
    }
  },

  // Lấy các mã khuyến mãi đang hoạt động
  getPromotions: async () => {
    try {
      const response = await api.get('/khuyen-mai/active');
      return response.data?.data || [];
    } catch (error) {
      console.warn('Lỗi lấy danh sách khuyến mãi:', error);
      return [];
    }
  },

  // Kiểm tra tính hợp lệ của một voucher
  checkPromotionCode: async (code) => {
    try {
      const response = await api.post('/khuyen-mai/check', { ma: code });
      return response.data;
    } catch (error) {
      return error.response?.data || { success: false, message: 'Mã không hợp lệ hoặc đã hết hạn.' };
    }
  },

  // Lấy danh sách đơn hàng của người dùng đang đăng nhập
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data?.data || [];
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết đơn hàng
  getUserOrderDetail: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data?.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh mục và thương hiệu để hỗ trợ nhận diện entity
  getMetadata: async () => {
    try {
      const [catRes, brandRes] = await Promise.allSettled([
        api.get('/danh-muc'),
        api.get('/thuong-hieu'),
      ]);
      const categories = catRes.status === 'fulfilled' ? (catRes.value.data?.data?.data || catRes.value.data?.data || catRes.value.data || []) : [];
      const brands = brandRes.status === 'fulfilled' ? (brandRes.value.data?.data?.data || brandRes.value.data?.data || brandRes.value.data || []) : [];
      return {
        categories: Array.isArray(categories) ? categories : [],
        brands: Array.isArray(brands) ? brands : [],
      };
    } catch {
      return { categories: [], brands: [] };
    }
  },
};

