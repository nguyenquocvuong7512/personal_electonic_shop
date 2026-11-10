import api from './api';

export const postService = {
    // Lấy danh sách bài viết trong trang quản trị
    getAll: async (params = {}) => {
        const response = await api.get('/admin/bai-viet', { params });
        return response.data;
    },

    // Lấy chi tiết bài viết theo ID
    getById: async (id) => {
        const response = await api.get(`/admin/bai-viet/${id}`);
        return response.data;
    },

    // Thêm bài viết mới
    create: async (formData) => {
        const response = await api.post('/admin/bai-viet', formData);
        return response.data;
    },

    // Cập nhật bài viết bằng FormData và Method Spoofing
    update: async (id, formData) => {
        formData.set('_method', 'PUT');

        const response = await api.post(
            `/admin/bai-viet/${id}`,
            formData
        );

        return response.data;
    },

    // Đưa bài viết vào thùng rác (xóa mềm)
    delete: async (id) => {
        const response = await api.delete(`/admin/bai-viet/${id}`);
        return response.data;
    },

    // Lấy danh sách bài viết trong thùng rác
    getTrash: async (params = {}) => {
        const response = await api.get('/admin/bai-viet/thung-rac', {
            params,
        });

        return response.data;
    },

    // Khôi phục bài viết
    restore: async (id) => {
        const response = await api.patch(
            `/admin/bai-viet/${id}/restore`
        );

        return response.data;
    },

    // Xóa bài viết vĩnh viễn
    forceDelete: async (id) => {
        const response = await api.delete(
            `/admin/bai-viet/${id}/force-delete`
        );

        return response.data;
    },

    // Lấy danh sách chủ đề bài viết cho ô Select
    getFormOptions: async () => {
        const response = await api.get('/chu-de-bai-viet');

        const topics =
            response?.data?.data?.data ||
            response?.data?.data ||
            response?.data ||
            [];

        return { topics };
    },
};