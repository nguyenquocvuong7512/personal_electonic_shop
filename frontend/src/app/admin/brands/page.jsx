'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import BrandTable from '@/components/admin/BrandTable';

import {
    getBrands,
    deleteBrand,
    restoreBrand,
    permanentlyDeleteBrand,
} from '@/services/brandService';

import '@/styles/admin/brands.css';

export default function AdminBrandsPage() {
    const router = useRouter();

    const [brands, setBrands] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);

    const [lastPage, setLastPage] = useState(1);

    const [statusFilter, setStatusFilter] = useState('');

    const [message, setMessage] = useState('');

    const [messageType, setMessageType] = useState('');

    const [showTrash, setShowTrash] = useState(false);

    const [pendingPermanentDelete, setPendingPermanentDelete] = useState(null);

    const [deletingPermanently, setDeletingPermanently] = useState(false);


    // ==================== LẤY DANH SÁCH ====================

    const fetchBrands = async (
        page = currentPage,
        trashed = showTrash,
        status = statusFilter
    ) => {
        try {
            setLoading(true);
            setError(null);

            const result = await getBrands({
                trashed,
                trangthai: trashed ? undefined : status || undefined,
                page,
                per_page: 10,
            });

            setBrands(result.items);
            setCurrentPage(result.currentPage);
            setLastPage(result.lastPage);
        } catch {
            setError(
                'Không thể tải danh sách thương hiệu. Hãy kiểm tra kết nối với server Laravel!'
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch resolves asynchronously and updates page state.
        fetchBrands(currentPage, showTrash, statusFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Fetch when pagination, status, or trash view changes.
    }, [currentPage, statusFilter, showTrash]);


    // ==================== THÔNG BÁO ====================

    const showMessage = (text, type = 'success') => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    useEffect(() => {
        const savedNotice = sessionStorage.getItem('admin-brand-notice');
        if (!savedNotice) return;

        sessionStorage.removeItem('admin-brand-notice');
        let dismissTimer;
        const timeoutId = window.setTimeout(() => {
            setMessage(savedNotice);
            setMessageType('success');
            dismissTimer = window.setTimeout(() => {
                setMessage('');
                setMessageType('');
            }, 3000);
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearTimeout(dismissTimer);
        };
    }, []);


    // ==================== THÊM ====================

    const handleAdd = () => {
        router.push('/admin/brands/create');
    };


    // ==================== SỬA ====================

    const handleEdit = (brand) => {
        router.push(`/admin/brands/edit/${brand.id}`);
    };


    // ==================== XÓA ====================

    const handleDelete = async (id) => {
        try {
            await deleteBrand(id);

            showMessage(
                'Đã chuyển thương hiệu vào thùng rác!'
            );

            await refreshAfterMutation();

        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể chuyển thương hiệu vào thùng rác!',
                'error'
            );
        }
    };

    const refreshAfterMutation = async () => {
        setError(null);

        if (brands.length === 1 && currentPage > 1) {
            setLoading(true);
            setCurrentPage((page) => page - 1);
            return;
        }

        await fetchBrands(currentPage, showTrash, statusFilter);
    };

    const handleRestore = async (id) => {
        try {
            await restoreBrand(id);
            showMessage('Khôi phục thương hiệu thành công!');
            await refreshAfterMutation();
        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể khôi phục thương hiệu!',
                'error'
            );
        }
    };

    const handlePermanentlyDelete = async (id) => {
        try {
            setDeletingPermanently(true);
            await permanentlyDeleteBrand(id);
            showMessage('Đã xóa vĩnh viễn thương hiệu!');
            await refreshAfterMutation();
            setPendingPermanentDelete(null);
        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể xóa vĩnh viễn thương hiệu!',
                'error'
            );
        } finally {
            setDeletingPermanently(false);
        }
    };

    const handleTrashToggle = () => {
        setError(null);
        setLoading(true);
        setCurrentPage(1);
        setShowTrash((current) => !current);
    };

    const handleStatusChange = (event) => {
        setError(null);
        setLoading(true);
        setCurrentPage(1);
        setStatusFilter(event.target.value);
    };

    const handlePageChange = (page) => {
        setError(null);
        setLoading(true);
        setCurrentPage(page);
    };


    return (
        <div className="admin-brands-page">

            {/* ==================== HEADER ==================== */}

            <div className="admin-header">

                <h1>
                    {showTrash ? 'Thùng rác thương hiệu' : 'Quản lý thương hiệu'}
                </h1>

                {!showTrash && (
                    <button
                        type="button"
                        className="btn-add-brand"
                        onClick={handleAdd}
                    >
                        + Thêm thương hiệu
                    </button>
                )}

            </div>

            {pendingPermanentDelete && (
                <div className="brand-confirmation" role="alertdialog" aria-label="Xác nhận xóa vĩnh viễn" aria-live="assertive">
                    <p>
                        Xóa vĩnh viễn thương hiệu “
                        {brands.find((item) => item.id === pendingPermanentDelete)?.ten || ''}
                        ”? Thao tác này không thể hoàn tác.
                    </p>
                    <div className="brand-confirmation-actions">
                        <button
                            type="button"
                            className="brand-confirm-cancel"
                            onClick={() => setPendingPermanentDelete(null)}
                            disabled={deletingPermanently}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="brand-confirm-delete"
                            onClick={() => handlePermanentlyDelete(pendingPermanentDelete)}
                            disabled={deletingPermanently}
                        >
                            {deletingPermanently ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </button>
                    </div>
                </div>
            )}

            <div className="brand-toolbar">
                {!showTrash && (
                    <div className="brand-filter">
                        <label htmlFor="brandStatusFilter">
                            Trạng thái
                        </label>
                        <select
                            id="brandStatusFilter"
                            value={statusFilter}
                            onChange={handleStatusChange}
                        >
                            <option value="">Hiển thị</option>
                            <option value="an">Ẩn</option>
                        </select>
                    </div>
                )}

                <button
                    type="button"
                    className={`brand-trash-toggle ${showTrash ? 'active' : ''}`}
                    onClick={handleTrashToggle}
                >
                    {showTrash ? '← Danh sách thương hiệu' : 'Thùng rác'}
                </button>
            </div>


            {/* ==================== THÔNG BÁO ==================== */}

            {message && (
                <div
                    className={`brand-message ${messageType === 'error'
                        ? 'error'
                        : 'success'
                        }`}
                    role={messageType === 'error' ? 'alert' : 'status'}
                    aria-live={messageType === 'error' ? 'assertive' : 'polite'}
                >
                    {message}
                </div>
            )}


            {/* ==================== DANH SÁCH ==================== */}

            <BrandTable
                brands={brands}
                loading={loading}
                error={error}
                isTrash={showTrash}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onRequestPermanentDelete={setPendingPermanentDelete}
            />

            {!loading && !error && lastPage > 1 && (
                <div className="brand-pagination">
                    <button
                        type="button"
                        disabled={currentPage <= 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    >
                        ← Trước
                    </button>

                    <span>
                        Trang <strong>{currentPage}</strong> / {lastPage}
                    </span>

                    <button
                        type="button"
                        disabled={currentPage >= lastPage}
                        onClick={() => handlePageChange(currentPage + 1)}
                    >
                        Sau →
                    </button>
                </div>
            )}

        </div>
    );
}