'use client';

import React from 'react';

export default function CategoryTable({
    categories = [],
    loading = false,
    error = null,
    isTrash = false,
    onEdit,
    onDelete,
    onRestore,
    onRequestPermanentDelete,
}) {
    // ==================== LOADING ====================

    if (loading) {
        return (
            <div className="admin-status-message" role="status" aria-live="polite">
                Đang tải danh sách danh mục...
            </div>
        );
    }

    // ==================== ERROR ====================

    if (error) {
        return (
            <div className="admin-status-message error" role="alert" aria-live="assertive">
                {error}
            </div>
        );
    }

    // ==================== EMPTY ====================

    if (
        !Array.isArray(categories) ||
        categories.length === 0
    ) {
        return (
            <div className="admin-status-message">
                {isTrash
                    ? 'Thùng rác đang trống.'
                    : 'Chưa có danh mục nào trong hệ thống.'}
            </div>
        );
    }

    // ==================== TABLE ====================

    return (
        <div className="admin-category-table-container">
            <table className="admin-category-table">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Danh mục</th>
                        <th scope="col">Danh mục cha</th>
                        <th scope="col">Mô tả</th>
                        {!isTrash && (
                            <th scope="col">Trạng thái</th>
                        )}
                        <th scope="col">Thao tác</th>
                    </tr>
                </thead>

                <tbody>
                    {categories.map((category) => {
                        const categoryId =
                            category?.id;

                        const categoryName =
                            category?.ten ||
                            'Danh mục';

                        const parentName =
                            category?.parent?.ten ||
                            'Danh mục gốc';

                        return (
                            <tr key={categoryId}>

                                {/* ID */}
                                <td>
                                    <span className="category-id">
                                        #{categoryId}
                                    </span>
                                </td>

                                {/* TÊN */}
                                <td>
                                    <div className="category-name-cell">
                                        <span className="category-folder-icon">
                                            {category?.parent_id
                                                ? '↳'
                                                : '📁'}
                                        </span>

                                        <strong>
                                            {categoryName}
                                        </strong>
                                    </div>
                                </td>

                                {/* PARENT */}
                                <td>
                                    {category?.parent_id ? (
                                        <span className="category-parent">
                                            {parentName}
                                        </span>
                                    ) : (
                                        <span className="category-root">
                                            Danh mục gốc
                                        </span>
                                    )}
                                </td>

                                {/* MÔ TẢ */}
                                <td className="category-description">
                                    {category?.mota ? (
                                        <span
                                            title={
                                                category.mota
                                            }
                                        >
                                            {category.mota
                                                .length > 70
                                                ? `${category.mota.substring(
                                                    0,
                                                    70
                                                )}...`
                                                : category.mota}
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
                                            className={`category-status-badge ${category?.trangthai || ''
                                                }`}
                                        >
                                            {category?.trangthai ===
                                                'hienthi'
                                                ? 'Hiển thị'
                                                : 'Ẩn'}
                                        </span>
                                    </td>
                                )}

                                {/* THAO TÁC */}
                                <td>
                                    <div className="category-action-buttons">

                                        {isTrash ? (
                                            <>
                                                <button
                                                    type="button"
                                                    className="category-btn-restore"
                                                    onClick={() =>
                                                        onRestore?.(categoryId)
                                                    }
                                                >
                                                    Khôi phục
                                                </button>
                                                <button
                                                    type="button"
                                                    className="category-btn-delete"
                                                    onClick={() =>
                                                        onRequestPermanentDelete?.(
                                                            categoryId
                                                        )
                                                    }
                                                >
                                                    Xóa vĩnh viễn
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    type="button"
                                                    className="category-btn-edit"
                                                    onClick={() =>
                                                        onEdit?.(category)
                                                    }
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="category-btn-delete"
                                                    onClick={() =>
                                                        onDelete?.(categoryId)
                                                    }
                                                >
                                                    Chuyển vào thùng rác
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