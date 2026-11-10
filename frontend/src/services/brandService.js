import api from '@/services/api';

// ==================== LẤY DANH SÁCH ====================

export const getBrands = async ({
    trashed = false,
    trangthai,
    page = 1,
    per_page = 10,
} = {}) => {
    const response = await api.get('/thuong-hieu', {
        params: {
            page,
            per_page,
            ...(trashed ? { trashed: 1 } : {}),
            ...(!trashed && trangthai ? { trangthai } : {}),
        },
    });

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
    };
};


// ==================== LẤY CHI TIẾT ====================

export const getBrandById = async (id) => {
    const response = await api.get(`/thuong-hieu/${id}`);

    return response.data?.data || response.data;
};


// ==================== THÊM ====================

export const createBrand = async (brandData) => {
    const response = await api.post(
        '/thuong-hieu',
        brandData
    );

    return response.data;
};


// ==================== CẬP NHẬT ====================

export const updateBrand = async (id, brandData) => {
    /*
     * Khi cập nhật có upload file:
     * dùng POST + _method=PUT để Laravel xử lý
     * multipart/form-data ổn định hơn PUT trực tiếp.
     */

    const response = await api.post(
        `/thuong-hieu/${id}`,
        brandData
    );

    return response.data;
};


// ==================== XÓA ====================

export const deleteBrand = async (id) => {
    const response = await api.delete(
        `/thuong-hieu/${id}`
    );

    return response.data;
};

// ==================== THÙNG RÁC ====================

export const restoreBrand = async (id) => {
    const response = await api.patch(
        `/thuong-hieu/${id}/restore`
    );

    return response.data;
};

export const permanentlyDeleteBrand = async (id) => {
    const response = await api.delete(
        `/thuong-hieu/${id}/force`
    );

    return response.data;
};