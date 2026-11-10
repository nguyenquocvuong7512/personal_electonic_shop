import api from './api';

export const productService = {
    // Lấy danh sách sản phẩm
    getAll: async () => {
        const response = await api.get('/san-pham');
        return response.data;
    },

    // Lấy chi tiết sản phẩm theo ID
    getById: async (id) => {
        const response = await api.get(`/san-pham/${id}`);
        return response.data;
    },

    // Thêm mới sản phẩm (nhận FormData chứa cả file ảnh)
    create: async (formData) => {
        // Để Axios tự đặt Content-Type cùng boundary chuẩn cho multipart/form-data
        const response = await api.post('/san-pham', formData);
        return response.data ;
    },

    // Cập nhật sản phẩm (Method Spoofing _method: PUT cho FormData)
    // services/productService.js
    update: async (id, formData) => {
        const response = await api.post(`/san-pham/${id}`, formData);
        return response.data ;
    },
    // Xóa sản phẩm
    delete: async (id) => {
        const response = await api.delete(`/san-pham/${id}`);
        return response.data;
    },

    // Lấy danh sách Danh mục & Thương hiệu dùng cho ô Chọn (Select)
    getFormOptions: async () => {
        const [resCategories, resBrands] = await Promise.all([
            api.get('/danh-muc').catch(() => null),
            api.get('/thuong-hieu').catch(() => null),
        ]);

        const categories =
            resCategories?.data?.data?.data ||
            resCategories?.data?.data ||
            resCategories?.data ||
            [];
        const brands =
            resBrands?.data?.data?.data ||
            resBrands?.data?.data ||
            resBrands?.data ||
            [];

        return { categories, brands };
    },
};