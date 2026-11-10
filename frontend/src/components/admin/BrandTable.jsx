'use client';

import React from 'react';

// Hàm helper xử lý đường dẫn ảnh từ API/Backend
const getImageUrl = (imagePath) => {
    if (!imagePath) {
        return '/placeholder.png';
    }

    // Nếu API đã trả URL đầy đủ
    if (
        imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')
    ) {
        return imagePath;
    }

    const backendBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        'http://localhost:8000';

    const cleanPath = imagePath.startsWith('/')
        ? imagePath.substring(1)
        : imagePath;

    return `${backendBaseUrl}/storage/${cleanPath}`;
};

export default function BrandTable({
    brands = [],
    loading = false,
    error = null,
    isTrash = false,
    onEdit,
    onDelete,
    onRestore,
    onRequestPermanentDelete,
}) {
    // ==================== LOADING STATE ====================
    if (loading) {
        return (
            <div className="admin-status-message" role="status" aria-live="polite">
                Đang tải danh sách thương hiệu...
            </div>
        );
    }

    // ==================== ERROR STATE ====================
    if (error) {
        return (
            <div className="admin-status-message error" role="alert" aria-live="assertive">
                {error}
            </div>
        );
    }

    // ==================== EMPTY STATE ====================
    if (!Array.isArray(brands) || brands.length === 0) {
        return (
            <div className="admin-status-message">
                {isTrash
                    ? 'Thùng rác thương hiệu đang trống.'
                    : 'Chưa có thương hiệu nào trong hệ thống.'}
            </div>
        );
    }

    // ==================== TABLE RENDER ====================
    return (
        <div className="admin-table-container">
            <table className="admin-brand-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên thương hiệu</th>
                        <th>Slug</th>
                        <th>Mô tả</th>
                        {!isTrash && <th>Trạng thái</th>}
                        <th>Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {brands.map((brand) => {
                        const brandId = brand?.id;
                        const brandName = brand?.ten || 'Thương hiệu';

                        return (
                            <tr key={brandId}>
                                {/* ID */}
                                <td>#{brandId}</td>

                                {/* Hình ảnh */}
                                <td>
                                    {brand?.hinhanh ? (
                                        <img
                                            key={`${brandId}-${brand.hinhanh}`}
                                            src={getImageUrl(brand.hinhanh)}
                                            alt={brandName}
                                            className="admin-brand-img"
                                            onError={(e) => {
                                                // Ngăn lặp vô tận nếu placeholder.png cũng bị 404
                                                e.currentTarget.onerror = null;
                                                e.currentTarget.src =
                                                    '/placeholder.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="brand-no-image">
                                            Không có
                                        </div>
                                    )}
                                </td>

                                {/* Tên */}
                                <td className="brand-name">
                                    <strong>{brandName}</strong>
                                </td>

                                {/* Slug */}
                                <td className="brand-slug">
                                    {brand?.slug || '-'}
                                </td>

                                {/* Mô tả */}
                                <td className="brand-description">
                                    {brand?.mota ? (
                                        <span title={brand.mota}>
                                            {brand.mota.length > 60
                                                ? `${brand.mota.substring(0, 60)}...`
                                                : brand.mota}
                                        </span>
                                    ) : (
                                        <span className="no-description">
                                            -
                                        </span>
                                    )}
                                </td>

                                {!isTrash && (
                                    <td>
                                        <span
                                            className={`status-badge ${brand?.trangthai || ''
                                                }`}
                                        >
                                            {brand?.trangthai === 'hienthi'
                                                ? 'Hiển thị'
                                                : 'Ẩn'}
                                        </span>
                                    </td>
                                )}

                                {/* Thao tác */}
                                <td>
                                    <div className="action-buttons">
                                        {isTrash ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-restore"
                                                    title="Khôi phục thương hiệu"
                                                    onClick={() => onRestore?.(brandId)}
                                                >
                                                    Khôi phục
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-delete"
                                                    title="Xóa vĩnh viễn thương hiệu"
                                                    onClick={() =>
                                                        onRequestPermanentDelete?.(brandId)
                                                    }
                                                >
                                                    Xóa vĩnh viễn
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="btn-edit"
                                                    title="Chỉnh sửa thương hiệu"
                                                    onClick={() => onEdit?.(brand)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn-delete"
                                                    title="Chuyển thương hiệu vào thùng rác"
                                                    onClick={() => onDelete?.(brandId)}
                                                >
                                                    Thùng rác
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}