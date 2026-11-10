'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';

import {
    getBrandById,
    updateBrand,
} from '@/services/brandService';

import '@/styles/admin/brands.css';

const createSlug = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

export default function EditBrandPage({ params }) {
    const router = useRouter();

    const resolvedParams = params instanceof Promise ? use(params) : params;
    const id = resolvedParams?.id;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [isCustomSlug, setIsCustomSlug] = useState(false);

    const [formData, setFormData] = useState({
        ten: '',
        slug: '',
        mota: '',
        hinhanh: '',
        trangthai: 'hienthi',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // State đánh dấu người dùng muốn xóa ảnh hiện tại
    const [deleteCurrentImage, setDeleteCurrentImage] = useState(false);

    useEffect(() => {
        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    // ==================== LẤY THƯƠNG HIỆU ====================

    useEffect(() => {
        if (!id) return;

        const fetchBrand = async () => {
            try {
                setLoading(true);
                setError('');

                const data = await getBrandById(id);

                setFormData({
                    ten: data.ten || '',
                    slug: data.slug || '',
                    mota: data.mota || '',
                    hinhanh: data.hinhanh || '',
                    trangthai: data.trangthai || 'hienthi',
                });
                setIsCustomSlug(true);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Không tìm thấy thương hiệu!'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchBrand();
    }, [id]);

    // ==================== INPUT HANDLER ====================

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'ten') {
            setFormData((prev) => ({
                ...prev,
                ten: value,
                slug: isCustomSlug ? prev.slug : createSlug(value),
            }));
        } else if (name === 'slug') {
            setIsCustomSlug(true);
            setFormData((prev) => ({
                ...prev,
                slug: createSlug(value),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // ==================== CHỌN ẢNH MỚI ====================

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedTypes.includes(file.type)) {
            setError('Ảnh phải có định dạng JPG, PNG hoặc WEBP!');
            e.target.value = '';
            setImageFile(null);
            setImagePreview('');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Ảnh không được vượt quá 5MB!');
            e.target.value = '';
            setImageFile(null);
            setImagePreview('');
            return;
        }

        setError('');
        setImageFile(file);

        // Nếu chọn ảnh mới, tự động hủy cờ đánh dấu xóa ảnh cũ
        setDeleteCurrentImage(false);

        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(URL.createObjectURL(file));
    };

    // Handler bấm nút Xóa ảnh hiện tại / Hoàn tác
    const handleToggleDeleteImage = () => {
        setDeleteCurrentImage((prev) => !prev);
    };

    // ==================== SUBMIT ====================

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.ten.trim()) {
            setError('Vui lòng nhập tên thương hiệu!');
            return;
        }

        if (!formData.slug.trim()) {
            setError('Vui lòng nhập slug!');
            return;
        }

        try {
            setSubmitting(true);

            const dataToSend = new FormData();
            dataToSend.append('_method', 'PUT');
            dataToSend.append('ten', formData.ten.trim());
            dataToSend.append('slug', formData.slug.trim());
            dataToSend.append('mota', formData.mota.trim());
            dataToSend.append('trangthai', formData.trangthai);

            // Gửi cờ xóa ảnh lên Backend nếu bấm nút xóa ảnh cũ
            if (deleteCurrentImage) {
                dataToSend.append('xoa_hinhanh', '1');
            }

            // Nếu người dùng chọn file mới
            if (imageFile) {
                dataToSend.append('hinhanh', imageFile);
            }

            await updateBrand(id, dataToSend);
            sessionStorage.setItem(
                'admin-brand-notice',
                'Cập nhật thương hiệu thành công!'
            );
            router.push('/admin/brands');
        } catch (err) {
            if (err.response?.status === 422) {
                const errors = err.response?.data?.errors;
                if (errors) {
                    const firstError = Object.values(errors)[0];
                    setError(
                        Array.isArray(firstError)
                            ? firstError[0]
                            : 'Dữ liệu không hợp lệ!'
                    );
                } else {
                    setError(
                        err.response?.data?.message || 'Dữ liệu không hợp lệ!'
                    );
                }
            } else {
                setError(
                    err.response?.data?.message ||
                    'Không thể cập nhật thương hiệu!'
                );
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-brands-page">
                <div className="admin-status-message">
                    Đang tải thông tin thương hiệu...
                </div>
            </div>
        );
    }

    if (error && !formData.ten) {
        return (
            <div className="admin-brands-page">
                <div className="admin-status-message error" role="alert" aria-live="assertive">{error}</div>
                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => router.push('/admin/brands')}
                    style={{ marginTop: '15px' }}
                >
                    ← Quay lại
                </button>
            </div>
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const currentImageUrl = formData.hinhanh
        ? formData.hinhanh.startsWith('http')
            ? formData.hinhanh
            : `${baseUrl}/storage/${formData.hinhanh}`
        : null;

    return (
        <div className="admin-brands-page">
            <div className="admin-header">
                <h1>Sửa thương hiệu</h1>
                <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => router.push('/admin/brands')}
                >
                    ← Quay lại
                </button>
            </div>

            <div className="brand-form-container">
                <div className="brand-form-header">
                    <h2>Chỉnh sửa thương hiệu #{id}</h2>
                </div>

                <form className="brand-form" noValidate onSubmit={handleSubmit}>
                    {error && (
                        <div className="brand-message error" role="alert" aria-live="assertive">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="ten">
                            Tên thương hiệu <span>*</span>
                        </label>
                        <input
                            id="ten"
                            name="ten"
                            type="text"
                            value={formData.ten}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: Nike"
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="slug">
                            Slug <span>*</span>
                        </label>
                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="Ví dụ: nike"
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="mota">Mô tả</label>
                        <textarea
                            id="mota"
                            name="mota"
                            value={formData.mota}
                            onChange={handleInputChange}
                            placeholder="Nhập mô tả thương hiệu..."
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="hinhanh">Hình ảnh</label>

                        {/* HIỂN THỊ ẢNH HIỆN TẠI VÀ NÚT XÓA ẢNH */}
                        {currentImageUrl && !imagePreview && (
                            <div style={{ marginBottom: '15px' }}>
                                <p><strong>Ảnh hiện tại:</strong></p>

                                {deleteCurrentImage ? (
                                    <div style={{
                                        padding: '10px',
                                        background: '#fff0f0',
                                        border: '1px solid #ffcccc',
                                        borderRadius: '6px',
                                        color: '#d32f2f',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        maxWidth: '350px'
                                    }}>
                                        <span>Ảnh sẽ bị xóa khi lưu thay đổi.</span>
                                        <button
                                            type="button"
                                            onClick={handleToggleDeleteImage}
                                            style={{
                                                border: 'none',
                                                background: 'transparent',
                                                color: '#1976d2',
                                                cursor: 'pointer',
                                                textDecoration: 'underline',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            Hoàn tác
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '15px' }}>
                                        <img
                                            src={currentImageUrl}
                                            alt={formData.ten}
                                            style={{
                                                width: '150px',
                                                height: '150px',
                                                objectFit: 'contain',
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                padding: '5px',
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleToggleDeleteImage}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#d32f2f',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '13px'
                                            }}
                                        >
                                            🗑️ Xóa ảnh này
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INPUT UPLOAD ẢNH MỚI */}
                        <input
                            id="hinhanh"
                            name="hinhanh"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                        />

                        <small style={{ display: 'block', marginTop: '5px' }}>
                            Chọn ảnh mới nếu muốn thay đổi. JPG, PNG hoặc WEBP, tối đa 5MB.
                        </small>

                        {/* PREVIEW ẢNH MỚI NẾU CÓ CHỌN FILE */}
                        {imagePreview && (
                            <div style={{ marginTop: '15px' }}>
                                <p><strong>Ảnh mới chọn:</strong></p>
                                <img
                                    src={imagePreview}
                                    alt="Ảnh mới"
                                    style={{
                                        width: '150px',
                                        height: '150px',
                                        objectFit: 'contain',
                                        border: '1px solid #ddd',
                                        borderRadius: '8px',
                                        padding: '5px',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="trangthai">Trạng thái</label>
                        <select
                            id="trangthai"
                            name="trangthai"
                            value={formData.trangthai}
                            onChange={handleInputChange}
                        >
                            <option value="hienthi">Hiển thị</option>
                            <option value="an">Ẩn</option>
                        </select>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={() => router.push('/admin/brands')}
                            disabled={submitting}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className="btn-save"
                            disabled={submitting}
                        >
                            {submitting ? 'Đang cập nhật...' : 'Cập nhật thương hiệu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}