'use client';

import React, {
    use,
    useEffect,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
    getCategoryById,
    getAllCategories,
    updateCategory,
} from '@/services/categoryService';

import '@/styles/admin/categories.css';

export default function EditCategoryPage({
    params,
}) {
    const router = useRouter();

    const resolvedParams =
        params instanceof Promise
            ? use(params)
            : params;

    const id =
        resolvedParams?.id;

    const [categories, setCategories] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState('');

    const [formData, setFormData] =
        useState({
            parent_id: '',
            ten: '',
            mota: '',
            trangthai: 'hienthi',
        });


    // ==================== LOAD DATA ====================

    useEffect(() => {
        if (!id) return;

        const fetchData =
            async () => {
                try {
                    setLoading(true);
                    setError('');

                    const [
                        category,
                        allCategories,
                    ] =
                        await Promise.all([
                            getCategoryById(
                                id
                            ),
                            getAllCategories(),
                        ]);

                    setCategories(
                        allCategories
                    );

                    setFormData({
                        parent_id:
                            category.parent_id
                                ? String(
                                    category.parent_id
                                )
                                : '',

                        ten:
                            category.ten ||
                            '',

                        mota:
                            category.mota ||
                            '',

                        trangthai:
                            category.trangthai ||
                            'hienthi',
                    });

                } catch (err) {
                    setError(
                        err.response?.data
                            ?.message ||
                        'Không tìm thấy danh mục!'
                    );
                } finally {
                    setLoading(false);
                }
            };

        fetchData();
    }, [id]);


    // ==================== INPUT ====================

    const handleInputChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    // ==================== SUBMIT ====================

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!formData.ten.trim()) {
            setError(
                'Vui lòng nhập tên danh mục!'
            );
            return;
        }

        try {
            setSubmitting(true);

            await updateCategory(id, {
                parent_id:
                    formData.parent_id
                        ? Number(
                            formData.parent_id
                        )
                        : null,

                ten:
                    formData.ten.trim(),

                mota:
                    formData.mota.trim() ||
                    null,

                trangthai:
                    formData.trangthai,
            });

            sessionStorage.setItem(
                'admin-category-notice',
                'Cập nhật danh mục thành công!'
            );
            router.push(
                '/admin/categories'
            );

        } catch (err) {
            if (
                err.response?.status ===
                422
            ) {
                const errors =
                    err.response?.data
                        ?.errors;

                if (errors) {
                    const firstError =
                        Object.values(
                            errors
                        )[0];

                    setError(
                        Array.isArray(
                            firstError
                        )
                            ? firstError[0]
                            : 'Dữ liệu không hợp lệ!'
                    );
                } else {
                    setError(
                        err.response?.data
                            ?.message ||
                        'Dữ liệu không hợp lệ!'
                    );
                }
            } else {
                setError(
                    err.response?.status >= 500
                        ? 'Không thể cập nhật danh mục do lỗi hệ thống. Vui lòng thử lại.'
                        : err.response?.data?.message ||
                        'Không thể cập nhật danh mục!'
                );
            }

        } finally {
            setSubmitting(false);
        }
    };


    // ==================== LOADING ====================

    if (loading) {
        return (
            <div className="admin-categories-page">

                <div className="admin-status-message">
                    Đang tải thông tin danh mục...
                </div>

            </div>
        );
    }


    // ==================== ERROR ====================

    if (error && !formData.ten) {
        return (
            <div className="admin-categories-page">

                <div className="admin-status-message error">
                    <span role="alert" aria-live="assertive">
                        {error}
                    </span>
                </div>

                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() =>
                        router.push(
                            '/admin/categories'
                        )
                    }
                >
                    ← Quay lại
                </button>

            </div>
        );
    }


    return (
        <div className="admin-categories-page">

            <div className="admin-header">

                <div>
                    <h1>
                        Sửa danh mục
                    </h1>
                </div>

                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() =>
                        router.push(
                            '/admin/categories'
                        )
                    }
                >
                    ← Quay lại
                </button>

            </div>


            <div className="category-form-container">

                <div className="category-form-header">
                    <h2>
                        Chỉnh sửa danh mục #{id}
                    </h2>
                </div>


                <form
                    className="category-form"
                    noValidate
                    onSubmit={
                        handleSubmit
                    }
                >

                    {error && (
                        <div className="category-message error">
                            <span role="alert" aria-live="assertive">
                            {error}
                            </span>
                        </div>
                    )}


                    {/* TÊN */}

                    <div className="form-group">

                        <label htmlFor="ten">
                            Tên danh mục{' '}
                            <span>*</span>
                        </label>

                        <input
                            id="ten"
                            name="ten"
                            type="text"
                            value={
                                formData.ten
                            }
                            onChange={
                                handleInputChange
                            }
                            placeholder="Ví dụ: Điện thoại"
                            maxLength={255}
                            required
                        />

                    </div>


                    {/* DANH MỤC CHA */}

                    <div className="form-group">

                        <label htmlFor="parent_id">
                            Danh mục cha
                        </label>

                        <select
                            id="parent_id"
                            name="parent_id"
                            value={
                                formData.parent_id
                            }
                            onChange={
                                handleInputChange
                            }
                        >
                            <option value="">
                                Không có - Danh mục gốc
                            </option>

                            {categories
                                .filter(
                                    (category) =>
                                        Number(
                                            category.id
                                        ) !==
                                        Number(id)
                                )
                                .map(
                                    (
                                        category
                                    ) => (
                                        <option
                                            key={
                                                category.id
                                            }
                                            value={
                                                category.id
                                            }
                                        >
                                            {
                                                category.ten
                                            }

                                            {category.trangthai ===
                                                'an'
                                                ? ' (Ẩn)'
                                                : ''}
                                        </option>
                                    )
                                )}
                        </select>

                        <small>
                            Không thể chọn chính
                            danh mục này làm
                            danh mục cha.
                        </small>

                    </div>


                    {/* MÔ TẢ */}

                    <div className="form-group">

                        <label htmlFor="mota">
                            Mô tả
                        </label>

                        <textarea
                            id="mota"
                            name="mota"
                            value={
                                formData.mota
                            }
                            onChange={
                                handleInputChange
                            }
                            placeholder="Nhập mô tả danh mục..."
                            rows="5"
                        />

                    </div>



                    {/* TRẠNG THÁI */}

                    <div className="form-group">

                        <label htmlFor="trangthai">
                            Trạng thái
                        </label>

                        <select
                            id="trangthai"
                            name="trangthai"
                            value={
                                formData.trangthai
                            }
                            onChange={
                                handleInputChange
                            }
                        >
                            <option value="hienthi">
                                Hiển thị
                            </option>

                            <option value="an">
                                Ẩn
                            </option>
                        </select>

                    </div>


                    {/* BUTTON */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() =>
                                router.push(
                                    '/admin/categories'
                                )
                            }
                            disabled={
                                submitting
                            }
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={
                                submitting
                            }
                        >
                            {submitting
                                ? 'Đang cập nhật...'
                                : 'Cập nhật danh mục'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}