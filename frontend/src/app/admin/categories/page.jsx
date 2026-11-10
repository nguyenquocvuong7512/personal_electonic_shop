'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import CategoryTable from '@/components/admin/CategoryTable';

import {
    getCategories,
    deleteCategory,
    restoreCategory,
    permanentlyDeleteCategory,
} from '@/services/categoryService';

import '@/styles/admin/categories.css';

export default function AdminCategoriesPage() {
    const router = useRouter();

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(null);

    const [message, setMessage] =
        useState('');

    const [messageType, setMessageType] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('');

    const [currentPage, setCurrentPage] =
        useState(1);

    const [lastPage, setLastPage] =
        useState(1);

    const [showTrash, setShowTrash] =
        useState(false);

    const [pendingPermanentDelete, setPendingPermanentDelete] =
        useState(null);

    const [deletingPermanently, setDeletingPermanently] =
        useState(false);

    // ==================== LẤY DANH SÁCH ====================

    const fetchCategories = async (
        page = currentPage,
        status = statusFilter
    ) => {
        try {
            const result =
                await getCategories({
                    trangthai:
                        showTrash
                            ? undefined
                            : status || undefined,
                    trashed: showTrash,
                    page,
                    per_page: 10,
                });

            setCategories(
                result.items
            );

            setCurrentPage(
                result.currentPage
            );

            setLastPage(
                result.lastPage
            );

        } catch {
            setError(
                'Không thể tải danh sách danh mục. Hãy kiểm tra kết nối với server Laravel!'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Fetch resolves asynchronously and updates page state.
        fetchCategories(
            currentPage,
            statusFilter
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps -- Fetch when pagination, status, or trash view changes.
    }, [currentPage, statusFilter, showTrash]);


    // ==================== THÔNG BÁO ====================

    const showMessage = (
        text,
        type = 'success'
    ) => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage('');
            setMessageType('');
        }, 3000);
    };

    useEffect(() => {
        const savedNotice = sessionStorage.getItem('admin-category-notice');
        if (!savedNotice) return;

        sessionStorage.removeItem('admin-category-notice');
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
        router.push(
            '/admin/categories/create'
        );
    };


    // ==================== SỬA ====================

    const handleEdit = (category) => {
        router.push(
            `/admin/categories/edit/${category.id}`
        );
    };


    // ==================== XÓA ====================

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);

            showMessage(
                'Đã chuyển danh mục vào thùng rác!'
            );

            await refreshAfterMutation();

        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể chuyển danh mục vào thùng rác!',
                'error'
            );
        }
    };

    const refreshAfterMutation = async () => {
        setError(null);

        if (categories.length === 1 && currentPage > 1) {
            setLoading(true);
            setCurrentPage((prev) => prev - 1);
            return;
        }

        setLoading(true);
        await fetchCategories(currentPage, statusFilter);
    };

    const handleRestore = async (id) => {
        try {
            await restoreCategory(id);
            showMessage('Khôi phục danh mục thành công!');
            await refreshAfterMutation();
        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể khôi phục danh mục!',
                'error'
            );
        }
    };

    const handlePermanentlyDelete = async (id) => {
        try {
            setDeletingPermanently(true);
            await permanentlyDeleteCategory(id);
            showMessage('Đã xóa vĩnh viễn danh mục!');
            await refreshAfterMutation();
            setPendingPermanentDelete(null);
        } catch (err) {
            showMessage(
                err.response?.data?.message ||
                'Không thể xóa vĩnh viễn danh mục!',
                'error'
            );
        } finally {
            setDeletingPermanently(false);
        }
    };


    // ==================== ĐỔI FILTER ====================

    const handleStatusChange = (e) => {
        setError(null);
        setLoading(true);
        setCurrentPage(1);
        setStatusFilter(
            e.target.value
        );
    };

    const handleTrashToggle = () => {
        setError(null);
        setLoading(true);
        setCurrentPage(1);
        setShowTrash((current) => !current);
    };

    const handlePageChange = (page) => {
        setError(null);
        setLoading(true);
        setCurrentPage(page);
    };


    return (
        <div className="admin-categories-page">

            {/* ==================== HEADER ==================== */}

            <div className="admin-header">

                <div>
                    <h1>
                        {showTrash ? 'Thùng rác danh mục' : 'Quản lý danh mục'}
                    </h1>

                    <p className="admin-page-subtitle">
                        {showTrash
                            ? 'Khôi phục danh mục hoặc xóa vĩnh viễn khỏi cơ sở dữ liệu'
                            : 'Quản lý danh mục sản phẩm và danh mục con'}
                    </p>
                </div>

                {!showTrash && (
                    <button
                        type="button"
                        className="btn-add-category"
                        onClick={handleAdd}
                    >
                        + Thêm danh mục
                    </button>
                )}

            </div>


            {/* ==================== FILTER ==================== */}

            <div className="category-toolbar">

                {!showTrash && (
                    <div className="category-filter">
                        <label htmlFor="statusFilter">
                            Trạng thái
                        </label>

                        <select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={handleStatusChange}
                        >
                            <option value="">
                                Hiển thị
                            </option>
                            <option value="an">
                                Ẩn
                            </option>
                        </select>
                    </div>
                )}

                <button
                    type="button"
                    className={`category-trash-toggle ${showTrash ? 'active' : ''}`}
                    onClick={handleTrashToggle}
                >
                    {showTrash ? '← Danh sách danh mục' : 'Thùng rác'}
                </button>

            </div>

            {pendingPermanentDelete && (
                <div className="category-confirmation" role="alertdialog" aria-label="Xác nhận xóa vĩnh viễn" aria-live="assertive">
                    <p>
                        Xóa vĩnh viễn danh mục “
                        {categories.find((item) => item.id === pendingPermanentDelete)?.ten || ''}
                        ”? Thao tác này không thể hoàn tác.
                    </p>
                    <div className="category-confirmation-actions">
                        <button
                            type="button"
                            className="category-confirm-cancel"
                            onClick={() => setPendingPermanentDelete(null)}
                            disabled={deletingPermanently}
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            className="category-confirm-delete"
                            onClick={() => handlePermanentlyDelete(pendingPermanentDelete)}
                            disabled={deletingPermanently}
                        >
                            {deletingPermanently ? 'Đang xóa...' : 'Xác nhận xóa'}
                        </button>
                    </div>
                </div>
            )}


            {/* ==================== THÔNG BÁO ==================== */}

            {message && (
                <div
                    className={`category-message ${messageType === 'error'
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

            <CategoryTable
                categories={categories}
                loading={loading}
                error={error}
                isTrash={showTrash}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onRequestPermanentDelete={setPendingPermanentDelete}
            />


            {/* ==================== PHÂN TRANG ==================== */}

            {!loading &&
                !error &&
                lastPage > 1 && (
                    <div className="category-pagination">

                        <button
                            type="button"
                            disabled={
                                currentPage <= 1
                            }
                            onClick={() =>
                                handlePageChange(currentPage - 1)
                            }
                        >
                            ← Trước
                        </button>

                        <span>
                            Trang{' '}
                            <strong>
                                {currentPage}
                            </strong>{' '}
                            / {lastPage}
                        </span>

                        <button
                            type="button"
                            disabled={
                                currentPage >=
                                lastPage
                            }
                            onClick={() =>
                                handlePageChange(currentPage + 1)
                            }
                        >
                            Sau →
                        </button>

                    </div>
                )}

        </div>
    );
}