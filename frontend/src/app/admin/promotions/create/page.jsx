'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createPromotion } from '@/services/promotionService';
import '@/styles/admin/promotions.css';

export default function CreatePromotionPage() {
    const router = useRouter();

    const [submitting, setSubmitting] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    // Defaults: start now, end in 30 days
    const now = new Date();
    const in30Days = new Date();
    in30Days.setDate(now.getDate() + 30);

    const formatDateTimeLocal = (date) => {
        const pad = (n) => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${y}-${m}-${d}T${h}:${min}`;
    };

    const [formData, setFormData] = useState({
        ma: '',
        ten: '',
        mota: '',
        loaigiam: 'phantram',
        giatri: '',
        giatritoithieu: '0',
        giamtoida: '',
        soluong: '100',
        ngaybatdau: formatDateTimeLocal(now),
        ngayketthuc: formatDateTimeLocal(in30Days),
        trangthai: 'hoatdong',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'ma' ? value.toUpperCase().replace(/\s+/g, '') : value,
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const generateRandomCode = () => {
        const prefixes = ['KM', 'SALE', 'DISCOUNT', 'VOUCHER', 'VIP', 'FLASHSALE'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const newCode = `${prefix}${randomNum}`;

        setFormData((prev) => ({
            ...prev,
            ma: newCode,
        }));

        if (fieldErrors.ma) {
            setFieldErrors((prev) => ({ ...prev, ma: null }));
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.ma.trim()) {
            errors.ma = 'Vui lòng nhập mã khuyến mãi';
        }
        if (!formData.ten.trim()) {
            errors.ten = 'Vui lòng nhập tên khuyến mãi';
        }
        if (!formData.giatri || Number(formData.giatri) <= 0) {
            errors.giatri = 'Giá trị giảm phải lớn hơn 0';
        }
        if (formData.loaigiam === 'phantram' && Number(formData.giatri) > 100) {
            errors.giatri = 'Giảm theo phần trăm không được vượt quá 100%';
        }
        if (!formData.soluong || Number(formData.soluong) < 0) {
            errors.soluong = 'Số lượng không được âm';
        }
        if (!formData.ngaybatdau) {
            errors.ngaybatdau = 'Vui lòng chọn ngày bắt đầu';
        }
        if (!formData.ngayketthuc) {
            errors.ngayketthuc = 'Vui lòng chọn ngày kết thúc';
        }
        if (formData.ngaybatdau && formData.ngayketthuc && new Date(formData.ngayketthuc) < new Date(formData.ngaybatdau)) {
            errors.ngayketthuc = 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setGeneralError('');

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            await createPromotion({
                ma: formData.ma.trim(),
                ten: formData.ten.trim(),
                mota: formData.mota.trim() || null,
                loaigiam: formData.loaigiam,
                giatri: Number(formData.giatri),
                giatritoithieu: Number(formData.giatritoithieu || 0),
                giamtoida: formData.giamtoida !== '' ? Number(formData.giamtoida) : null,
                soluong: Number(formData.soluong),
                ngaybatdau: formData.ngaybatdau,
                ngayketthuc: formData.ngayketthuc,
                trangthai: formData.trangthai,
            });

            router.push('/admin/promotions');
        } catch (err) {
            console.error('Create promotion error:', err);
            if (err.response?.status === 422 && err.response?.data?.errors) {
                const apiErrors = {};
                const resErrors = err.response.data.errors;
                for (const key in resErrors) {
                    apiErrors[key] = resErrors[key][0];
                }
                setFieldErrors(apiErrors);
                setGeneralError('Vui lòng kiểm tra lại các trường thông tin bên dưới.');
            } else {
                setGeneralError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo khuyến mãi.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val || 0);
    };

    return (
        <div className="admin-promotions-page">
            {/* Header */}
            <div className="admin-header">
                <div>
                    <h1>Thêm mới Khuyến mãi</h1>
                    <p className="admin-page-subtitle">
                        Tạo mã ưu đãi mới với thời hạn sử dụng và điều kiện áp dụng cho khách mua hàng
                    </p>
                </div>

                <Link href="/admin/promotions" className="btn-cancel">
                    ◀ Quay lại danh sách
                </Link>
            </div>

            {/* General Error Alert */}
            {generalError && (
                <div className="admin-alert error">
                    <span>⚠️</span>
                    <span>{generalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="promo-form-layout">
                    {/* Left Column: Form Fields */}
                    <div>
                        {/* 1. Basic Info */}
                        <div className="promo-form-card">
                            <h2>1. Thông tin chung</h2>

                            <div className="form-group">
                                <label>
                                    Mã khuyến mãi <span className="required">*</span>
                                </label>
                                <div className="input-with-button">
                                    <input
                                        type="text"
                                        name="ma"
                                        className={`form-input ${fieldErrors.ma ? 'has-error' : ''}`}
                                        placeholder="Ví dụ: SALE50K, FREESHIP, TET2026..."
                                        value={formData.ma}
                                        onChange={handleChange}
                                        style={{ fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase' }}
                                    />
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={generateRandomCode}
                                    >
                                        🎲 Tạo ngẫu nhiên
                                    </button>
                                </div>
                                {fieldErrors.ma && <div className="form-error-text">{fieldErrors.ma}</div>}
                                <div className="form-help-text">
                                    Khách hàng sẽ nhập mã này tại bước thanh toán. Chỉ gồm chữ cái và số viết hoa.
                                </div>
                            </div>

                            <div className="form-group">
                                <label>
                                    Tên chương trình khuyến mãi <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="ten"
                                    className={`form-input ${fieldErrors.ten ? 'has-error' : ''}`}
                                    placeholder="Ví dụ: Giảm 20% cho đơn hàng đầu tiên, Ưu đãi mùa hè..."
                                    value={formData.ten}
                                    onChange={handleChange}
                                />
                                {fieldErrors.ten && <div className="form-error-text">{fieldErrors.ten}</div>}
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Mô tả chi tiết</label>
                                <textarea
                                    name="mota"
                                    className="form-textarea"
                                    rows="3"
                                    placeholder="Ghi chú về thể lệ chương trình hoặc đối tượng khách hàng áp dụng..."
                                    value={formData.mota}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* 2. Discount Settings */}
                        <div className="promo-form-card">
                            <h2>2. Mức độ giảm giá</h2>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>
                                        Hình thức giảm <span className="required">*</span>
                                    </label>
                                    <select
                                        name="loaigiam"
                                        className="form-select"
                                        value={formData.loaigiam}
                                        onChange={handleChange}
                                    >
                                        <option value="phantram">Giảm theo phần trăm (%)</option>
                                        <option value="sotien">Giảm số tiền cố định (VNĐ)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Mức giảm cụ thể <span className="required">*</span>
                                    </label>
                                    <div className="input-with-button">
                                        <input
                                            type="number"
                                            name="giatri"
                                            min="0.01"
                                            step={formData.loaigiam === 'phantram' ? '1' : '1000'}
                                            className={`form-input ${fieldErrors.giatri ? 'has-error' : ''}`}
                                            placeholder={formData.loaigiam === 'phantram' ? 'Ví dụ: 15' : 'Ví dụ: 50000'}
                                            value={formData.giatri}
                                            onChange={handleChange}
                                        />
                                        <span style={{
                                            padding: '10px 14px',
                                            background: '#f3f4f6',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            color: '#4b5563',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            {formData.loaigiam === 'phantram' ? '%' : 'VNĐ'}
                                        </span>
                                    </div>
                                    {fieldErrors.giatri && <div className="form-error-text">{fieldErrors.giatri}</div>}
                                </div>
                            </div>

                            {formData.loaigiam === 'phantram' && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label>Số tiền giảm tối đa (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="giamtoida"
                                        min="0"
                                        step="1000"
                                        className="form-input"
                                        placeholder="Để trống nếu không giới hạn mức giảm tối đa"
                                        value={formData.giamtoida}
                                        onChange={handleChange}
                                    />
                                    <div className="form-help-text">
                                        Ví dụ: Giảm 20% nhưng tối đa chỉ giảm 100,000 VNĐ cho mỗi đơn hàng.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Conditions & Limits */}
                        <div className="promo-form-card">
                            <h2>3. Điều kiện áp dụng & Số lượng</h2>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>Giá trị đơn hàng tối thiểu (VNĐ)</label>
                                    <input
                                        type="number"
                                        name="giatritoithieu"
                                        min="0"
                                        step="1000"
                                        className="form-input"
                                        placeholder="0"
                                        value={formData.giatritoithieu}
                                        onChange={handleChange}
                                    />
                                    <div className="form-help-text">
                                        Đơn hàng phải đạt từ mức này trở lên mới áp dụng được mã (0 là áp dụng cho mọi đơn).
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>
                                        Số lượng mã phát hành <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="soluong"
                                        min="0"
                                        className={`form-input ${fieldErrors.soluong ? 'has-error' : ''}`}
                                        placeholder="Ví dụ: 100"
                                        value={formData.soluong}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.soluong && <div className="form-error-text">{fieldErrors.soluong}</div>}
                                    <div className="form-help-text">
                                        Tổng số lượt khách hàng có thể sử dụng mã này.
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Validity Period & Status */}
                        <div className="promo-form-card">
                            <h2>4. Thời hạn & Trạng thái kích hoạt</h2>

                            <div className="form-row-2">
                                <div className="form-group">
                                    <label>
                                        Ngày & giờ bắt đầu <span className="required">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="ngaybatdau"
                                        className={`form-input ${fieldErrors.ngaybatdau ? 'has-error' : ''}`}
                                        value={formData.ngaybatdau}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.ngaybatdau && <div className="form-error-text">{fieldErrors.ngaybatdau}</div>}
                                </div>

                                <div className="form-group">
                                    <label>
                                        Ngày & giờ kết thúc <span className="required">*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="ngayketthuc"
                                        className={`form-input ${fieldErrors.ngayketthuc ? 'has-error' : ''}`}
                                        value={formData.ngayketthuc}
                                        onChange={handleChange}
                                    />
                                    {fieldErrors.ngayketthuc && <div className="form-error-text">{fieldErrors.ngayketthuc}</div>}
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label>Trạng thái</label>
                                <select
                                    name="trangthai"
                                    className="form-select"
                                    value={formData.trangthai}
                                    onChange={handleChange}
                                >
                                    <option value="hoatdong">Kích hoạt (Khách hàng có thể sử dụng)</option>
                                    <option value="ngung">Tạm ngưng (Vô hiệu hóa tạm thời)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Live Voucher Card Preview */}
                    <div>
                        <div className="promo-form-card" style={{ position: 'sticky', top: '24px' }}>
                            <h2>Xem trước Phiếu giảm giá</h2>

                            <div className="voucher-preview-card">
                                <div className="voucher-preview-top">
                                    <span className="voucher-tag-pill">
                                        {formData.loaigiam === 'phantram' ? 'Ưu đãi %' : 'Giảm tiền mặt'}
                                    </span>
                                    <span style={{ fontSize: '12px', opacity: 0.9 }}>
                                        {formData.trangthai === 'hoatdong' ? '🟢 Hoạt động' : '🔴 Tạm khóa'}
                                    </span>
                                </div>

                                <div className="voucher-preview-value">
                                    {formData.giatri
                                        ? formData.loaigiam === 'phantram'
                                            ? `GIẢM ${formData.giatri}%`
                                            : `GIẢM ${formatCurrency(formData.giatri)}`
                                        : 'GIẢM GIÁ'}
                                </div>

                                <div className="voucher-preview-name">
                                    {formData.ten || 'Tên chương trình khuyến mãi'}
                                </div>

                                <div className="voucher-preview-code-box">
                                    {formData.ma || 'MÃ_KHUYẾN_MÃI'}
                                </div>

                                <div className="voucher-preview-details">
                                    <div>
                                        • Đơn tối thiểu: <strong>{Number(formData.giatritoithieu) > 0 ? formatCurrency(formData.giatritoithieu) : 'Không giới hạn'}</strong>
                                    </div>
                                    {formData.loaigiam === 'phantram' && Number(formData.giamtoida) > 0 && (
                                        <div>
                                            • Giảm tối đa: <strong>{formatCurrency(formData.giamtoida)}</strong>
                                        </div>
                                    )}
                                    <div>
                                        • Số lượng: <strong>{formData.soluong || 0} lượt</strong>
                                    </div>
                                    <div>
                                        • Hạn dùng: <strong>{formData.ngayketthuc ? new Date(formData.ngayketthuc).toLocaleDateString('vi-VN') : '—'}</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions-bar">
                                <Link href="/admin/promotions" className="btn-cancel">
                                    Hủy
                                </Link>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu khuyến mãi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

