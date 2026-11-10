import api from '@/services/api';

// ==================== LẤY DANH SÁCH ====================

export const getCategories = async ({
    trangthai,
    trashed = false,
    page = 1,
    per_page = 10,
} = {}) => {
    const params = {
        page,
        per_page,
    };

    if (trangthai) {
        params.trangthai = trangthai;
    }

    if (trashed) {
        params.trashed = 1;
    }

    const response = await api.get('/danh-muc', {
        params,
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


// ==================== LẤY TẤT CẢ DANH MỤC ====================
// Dùng cho select "Danh mục cha"

export const getAllCategories = async () => {
    const [visibleResponse, hiddenResponse] = await Promise.all([
        api.get('/danh-muc', {
            params: {
                trangthai: 'hienthi',
                per_page: 100,
            },
        }),

        api.get('/danh-muc', {
            params: {
                trangthai: 'an',
                per_page: 100,
            },
        }),
    ]);

    const visible =
        visibleResponse.data?.data?.data || [];

    const hidden =
        hiddenResponse.data?.data?.data || [];

    // Tránh trùng ID nếu backend sau này thay đổi cách trả dữ liệu
    const map = new Map();

    [...visible, ...hidden].forEach((category) => {
        map.set(category.id, category);
    });

    return Array.from(map.values()).sort(
        (a, b) => b.id - a.id
    );
};


// ==================== LẤY CHI TIẾT ====================

export const getCategoryById = async (id) => {
    const response = await api.get(
        `/danh-muc/${id}`
    );

    return (
        response.data?.data ||
        response.data
    );
};


// ==================== THÊM ====================

export const createCategory = async (categoryData) => {
    const response = await api.post(
        '/danh-muc',
        categoryData
    );

    return response.data;
};


// ==================== CẬP NHẬT ====================

export const updateCategory = async (
    id,
    categoryData
) => {
    const response = await api.put(
        `/danh-muc/${id}`,
        categoryData
    );

    return response.data;
};


// ==================== XÓA ====================

export const deleteCategory = async (id) => {
    const response = await api.delete(
        `/danh-muc/${id}`
    );

    return response.data;
};

// ==================== THÙNG RÁC ====================

export const restoreCategory = async (id) => {
    const response = await api.patch(
        `/danh-muc/${id}/restore`
    );

    return response.data;
};

export const permanentlyDeleteCategory = async (id) => {
    const response = await api.delete(
        `/danh-muc/${id}/force`
    );

    return response.data;
};