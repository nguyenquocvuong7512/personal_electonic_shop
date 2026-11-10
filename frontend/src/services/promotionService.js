import api from '@/services/api';

/**
 * Lấy danh sách khuyến mãi kèm phân trang và bộ lọc
 */
export const getPromotions = async ({
    page = 1,
    per_page = 10,
    keyword = '',
    trangthai = '',
    loaigiam = '',
    hieuluc = '',
    sort_by = 'id',
    sort_order = 'desc',
} = {}) => {
    const params = {
        page,
        per_page,
        sort_by,
        sort_order,
        ...(keyword ? { keyword } : {}),
        ...(trangthai ? { trangthai } : {}),
        ...(loaigiam ? { loaigiam } : {}),
        ...(hieuluc ? { hieuluc } : {}),
    };

    const response = await api.get('/admin/khuyen-mai', { params });
    const result = response.data?.data || {};

    return {
        items: Array.isArray(result?.data)
            ? result.data
            : Array.isArray(result)
                ? result
                : [],
        currentPage: result?.current_page || 1,
        lastPage: result?.last_page || 1,
        perPage: result?.per_page || per_page,
        total: result?.total || 0,
        stats: response.data?.stats || {},
    };
};

/**
 * Lấy chi tiết khuyến mãi theo ID
 */
export const getPromotionById = async (id) => {
    const response = await api.get(`/admin/khuyen-mai/${id}`);
    return response.data?.data || response.data;
};

/**
 * Tạo mới khuyến mãi
 */
export const createPromotion = async (promotionData) => {
    const response = await api.post('/admin/khuyen-mai', promotionData);
    return response.data;
};

/**
 * Cập nhật thông tin khuyến mãi
 */
export const updatePromotion = async (id, promotionData) => {
    const response = await api.put(`/admin/khuyen-mai/${id}`, promotionData);
    return response.data;
};

/**
 * Xóa khuyến mãi
 */
export const deletePromotion = async (id) => {
    const response = await api.delete(`/admin/khuyen-mai/${id}`);
    return response.data;
};

/**
 * Kiểm tra tính hợp lệ của mã khuyến mãi
 */
export const checkPromotionCode = async (ma, tongtien = 0) => {
    const response = await api.post('/khuyen-mai/check', { ma, tongtien });
    return response.data;
};

/**
 * Lấy danh sách các mã khuyến mãi đang hoạt động (dành cho khách hàng)
 */
export const getActivePromotions = async () => {
    const response = await api.get('/khuyen-mai/active');
    return response.data?.data || [];
};

