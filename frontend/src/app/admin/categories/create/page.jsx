'use client';

import React, {
    useEffect,
    useState,
} from 'react';

import { useRouter } from 'next/navigation';

import {
    createCategory,
    getAllCategories,
} from '@/services/categoryService';

import '@/styles/admin/categories.css';

export default function CreateCategoryPage() {
    const router = useRouter();

    const [categories, setCategories] =
        useState([]);

    const [loadingCategories, setLoadingCategories] =
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


    // ==================== LẤY DANH MỤC CHA ====================

    useEffect(() => {
        const fetchCategories =
            async () => {
                try {
                    const data =
                        await getAllCategories();

                    setCategories(data);
                } catch {
                    setError(
                        'Không thể tải danh sách danh mục cha!'
                    );
                } finally {
                    setLoadingCategories(
                        false
                    );
                }
            };

        fetchCategories();
    }, []);


    // ==================== INPUT ====================

    const handleInputChange = (e) => {
        const {
            name,
            value,
        } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]:
                name === 'parent_id'
                    ? value
                    : value,
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

            await createCategory({
                parent_id:
                    formData.parent_id
                        ? Number(
                            formData.parent_id
                        )
                        : null,

                ten: formData.ten.trim(),

                mota:
                    formData.mota.trim() ||
                    null,

                trangthai:
                    formData.trangthai,
            });

            sessionStorage.setItem(
                'admin-category-notice',
                'Thêm danh mục thành công!'
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
                        ? 'Không thể thêm danh mục do lỗi hệ thống. Vui lòng thử lại.'
                        : err.response?.data?.message ||
                        'Không thể thêm danh mục!'
                );
            }

        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="admin-categories-page">

            <div className="admin-header">

                <div>
                    <h1>
                        Thêm danh mục
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
                        Thông tin danh mục
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
                            disabled={
                                loadingCategories
                            }
                        >
                            <option value="">
                                Không có - Danh mục gốc
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {category.ten}
                                        {category.trangthai ===
                                            'an'
                                            ? ' (Ẩn)'
                                            : ''}
                                    </option>
                                )
                            )}
                        </select>

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
                                ? 'Đang thêm...'
                                : 'Thêm danh mục'}
                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}