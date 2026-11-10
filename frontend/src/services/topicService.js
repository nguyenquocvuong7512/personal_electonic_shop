
import api from './api';

export const topicService = {
    // Lấy danh sách danh mục
    getAll: async (params = {}) => {
        const response = await api.get('/admin/chu-de-bai-viet', {
            params,
        });
        return response.data;
    },

    // Lấy chi tiết danh mục
    getById: async (id) => {
        const response = await api.get(`/admin/chu-de-bai-viet/${id}`);
        return response.data;
    },

    // Thêm danh mục
    create: async (data) => {
        const response = await api.post('/admin/chu-de-bai-viet', data);
        return response.data;
    },

    // Cập nhật danh mục
    update: async (id, data) => {
        const response = await api.put(`/admin/chu-de-bai-viet/${id}`, data);
        return response.data;
    },

    // Xóa danh mục
    delete: async (id) => {
        const response = await api.delete(`/admin/chu-de-bai-viet/${id}`);
        return response.data;
    },
     getTrash: async (params = {}) => {
        const response = await api.get('/admin/chu-de-bai-viet/thung-rac', { params });
        return response.data;
    },

    // Khôi phục danh mục
    restore: async (id) => {
        const response = await api.patch(`/admin/chu-de-bai-viet/${id}/restore`);
        return response.data;
    },

    // Xóa vĩnh viễn danh mục
    forceDelete: async (id) => {
        const response = await api.delete(`/admin/chu-de-bai-viet/${id}/force-delete`);
        return response.data;
    },
};
