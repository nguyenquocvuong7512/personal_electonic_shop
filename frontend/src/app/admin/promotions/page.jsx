'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import PromotionTable from '@/components/admin/PromotionTable';
import { getPromotions, deletePromotion } from '@/services/promotionService';
import '@/styles/admin/promotions.css';

export default function AdminPromotionsPage() {
    const [promotions, setPromotions] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        hoatdong: 0,
        ngung: 0,
        conhan: 0,
        hethan: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);

    // Filters & Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [total, setTotal] = useState(0);

    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [validityFilter, setValidityFilter] = useState('');

    // Delete Modal
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const showNotice = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchPromotions = useCallback(async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const result = await getPromotions({
                page,
                per_page: 10,
                keyword,
                trangthai: statusFilter,
                loaigiam: typeFilter,
                hieuluc: validityFilter,
            });

            setPromotions(result.items);
            setCurrentPage(result.currentPage);
            setLastPage(result.lastPage);
            setTotal(result.total);
            if (result.stats) {
                setStats(result.stats);
            }
        } catch (err) {
            console.error('Fetch promotions error:', err);
            setError('Không thể tải danh sách khuyến mãi. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    }, [keyword, statusFilter, typeFilter, validityFilter]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch resolves asynchronously and updates page state.
        fetchPromotions(currentPage);
    }, [fetchPromotions, currentPage]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchPromotions(1);
    };

    const handleResetFilters = () => {
        setKeyword('');
        setStatusFilter('');
        setTypeFilter('');
        setValidityFilter('');
        setCurrentPage(1);
    };

    const handleDeleteClick = (promo) => {
        setDeleteTarget(promo);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        try {
            setDeleting(true);
            const res = await deletePromotion(deleteTarget.id);
            showNotice(res.message || 'Xóa khuyến mãi thành công.', 'success');
            setDeleteTarget(null);
            fetchPromotions(currentPage);
        } catch (err) {
            console.error('Delete promotion error:', err);
            const msg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa khuyến mãi.';
            showNotice(msg, 'error');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="admin-promotions-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>Quản lý Khuyến mãi & Mã giảm giá</h1>
                    <p className="admin-page-subtitle">
                        Thiết lập điều kiện áp dụng, thời hạn và quản lý các chương trình ưu đãi của cửa hàng
                    </p>
                </div>

                <Link href="/admin/promotions/create" className="btn-add-promotion">
                    <span>➕</span>
                    <span>Tạo khuyến mãi mới</span>
                </Link>
            </div>

            {/* Notification Alert */}
            {notification && (
                <div className={`admin-alert ${notification.type}`}>
                    <span>{notification.type === 'success' ? '✅' : '⚠️'}</span>
                    <span>{notification.message}</span>
                </div>
            )}

            {/* Summary Statistics Cards */}
            <div className="admin-promo-stats">
                <div className="promo-stat-card">
                    <div className="promo-stat-icon total">🎟️</div>
                    <div className="promo-stat-content">
                        <h3>{stats.total ?? total}</h3>
                        <p>Tổng số chương trình</p>
                    </div>
                </div>

                <div className="promo-stat-card">
                    <div className="promo-stat-icon active">⚡</div>
                    <div className="promo-stat-content">
                        <h3>{stats.hoatdong ?? 0}</h3>
                        <p>Đang kích hoạt</p>
                    </div>
                </div>

                <div className="promo-stat-card">
                    <div className="promo-stat-icon warning">⏳</div>
                    <div className="promo-stat-content">
                        <h3>{stats.conhan ?? 0}</h3>
                        <p>Còn hạn sử dụng</p>
                    </div>
                </div>

                <div className="promo-stat-card">
                    <div className="promo-stat-icon expired">🛑</div>
                    <div className="promo-stat-content">
                        <h3>{stats.hethan ?? 0}</h3>
                        <p>Đã hết hạn</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <form className="admin-promo-filters" onSubmit={handleSearch}>
                <div className="promo-search-box">
                    <span className="promo-search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Tìm theo mã hoặc tên khuyến mãi..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                    />
                </div>

                <select
                    className="promo-filter-select"
                    value={typeFilter}
                    onChange={(e) => {
                        setTypeFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Tất cả loại giảm</option>
                    <option value="phantram">Phần trăm (%)</option>
                    <option value="sotien">Số tiền (VNĐ)</option>
                </select>

                <select
                    className="promo-filter-select"
                    value={validityFilter}
                    onChange={(e) => {
                        setValidityFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Tất cả thời hạn</option>
                    <option value="conhan">Đang còn hạn</option>
                    <option value="hethan">Đã hết hạn</option>
                    <option value="chuabatdau">Chưa diễn ra</option>
                </select>

                <select
                    className="promo-filter-select"
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="hoatdong">Đang hoạt động</option>
                    <option value="ngung">Tạm ngưng</option>
                </select>

                <button
                    type="button"
                    className="btn-reset-filter"
                    onClick={handleResetFilters}
                    title="Đặt lại bộ lọc"
                >
                    Đặt lại
                </button>
            </form>

            {/* Table Card */}
            <div className="admin-table-card">
                <PromotionTable
                    promotions={promotions}
                    loading={loading}
                    error={error}
                    onDelete={handleDeleteClick}
                />

                {/* Pagination */}
                {!loading && promotions.length > 0 && (
                    <div className="admin-pagination-bar">
                        <div className="pagination-info">
                            Hiển thị <strong>{promotions.length}</strong> / <strong>{total}</strong> khuyến mãi
                        </div>

                        <div className="pagination-controls">
                            <button
                                type="button"
                                className="btn-page"
                                disabled={currentPage <= 1}
                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            >
                                ◀ Trước
                            </button>

                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((pageNum) => {
                                if (
                                    pageNum === 1 ||
                                    pageNum === lastPage ||
                                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                                ) {
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            className={`btn-page ${pageNum === currentPage ? 'active' : ''}`}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                }
                                if (
                                    (pageNum === 2 && currentPage > 3) ||
                                    (pageNum === lastPage - 1 && currentPage < lastPage - 2)
                                ) {
                                    return <span key={pageNum} style={{ padding: '0 4px', color: '#9ca3af' }}>...</span>;
                                }
                                return null;
                            })}

                            <button
                                type="button"
                                className="btn-page"
                                disabled={currentPage >= lastPage}
                                onClick={() => setCurrentPage((prev) => Math.min(lastPage, prev + 1))}
                            >
                                Sau ▶
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Xác nhận xóa khuyến mãi</h3>
                        <p>
                            Bạn có chắc chắn muốn xóa mã khuyến mãi <strong>{deleteTarget.ma}</strong> (
                            <em>{deleteTarget.ten}</em>) không?
                        </p>

                        {deleteTarget.donhangs_count > 0 && (
                            <div className="admin-alert error" style={{ fontSize: '13px' }}>
                                ⚠️ Mã này đã được sử dụng trong <strong>{deleteTarget.donhangs_count}</strong> đơn hàng.
                                Khi xóa, liên kết khuyến mãi trong các đơn hàng này sẽ được đặt về rỗng và lịch sử hóa đơn vẫn an toàn.
                            </div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn-cancel"
                                disabled={deleting}
                                onClick={() => setDeleteTarget(null)}
                            >
                                Hủy bỏ
                            </button>

                            <button
                                type="button"
                                className="btn-danger"
                                disabled={deleting}
                                onClick={handleConfirmDelete}
                            >
                                {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
