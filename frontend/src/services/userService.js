
import api from "./api";

export const userService = {
    // Lay danh sach nguoi dung
    getAll: async (params = {}) => {
        const response = await api.get("/nguoi-dung", { params });
        return response.data;
    },

    // Lay chi tiet nguoi dung
    getById: async (id) => {
        const response = await api.get(`/nguoi-dung/${id}`);
        return response.data;
    },

    // Them nguoi dung (se lam o buoc sau)
    create: async (data) => {
        const response = await api.post("/nguoi-dung", data);
        return response.data;
    },

    // Cap nhat nguoi dung
    update: async (id, data) => {
        const response = await api.put(`/nguoi-dung/${id}`, data);
        return response.data;
    },

    // Xoa mem nguoi dung
    delete: async (id) => {
        const response = await api.delete(`/nguoi-dung/${id}`);
        return response.data;
    },

    // Lay danh sach thung rac
    getTrash: async (params = {}) => {
        const response = await api.get("/nguoi-dung/trash", { params });
        return response.data;
    },
    // Khôi phục tài khoản đã xóa mềm.
    restore: async (id) => {
        const response = await api.patch(`/nguoi-dung/${id}/restore`);
        return response.data;
    },

    // Xóa vĩnh viễn tài khoản đã nằm trong thùng rác.
    forceDelete: async (id) => {
        const response = await api.delete(
            `/nguoi-dung/${id}/force-delete`
        );
        return response.data;
    },

};
