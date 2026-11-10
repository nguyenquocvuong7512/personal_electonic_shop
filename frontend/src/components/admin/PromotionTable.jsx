'use client';

import React from 'react';
import Link from 'next/link';

export default function PromotionTable({
    promotions = [],
    loading = false,
    error = null,
    onDelete,
}) {
    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Đang tải danh sách khuyến mãi...
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-alert error" style={{ margin: '20px' }}>
                {error}
            </div>
        );
    }

    if (!Array.isArray(promotions) || promotions.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Không tìm thấy khuyến mãi nào phù hợp.
            </div>
        );
    }

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(val || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="admin-promo-table-wrap">
            <table className="admin-promo-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Mã khuyến mãi</th>
                        <th>Tên & Mô tả</th>
                        <th>Mức giảm</th>
                        <th>Điều kiện áp dụng</th>
                        <th>Thời hạn áp dụng</th>
                        <th>Trạng thái</th>
                        <th>Đơn áp dụng</th>
                        <th style={{ textAlign: 'right' }}>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {promotions.map((promo) => {
                        const isPercent = promo.loaigiam === 'phantram';
                        const validity = promo.trangthai_hieuluc || 'conhan';

                        return (
                            <tr key={promo.id}>
                                <td>#{promo.id}</td>

                                <td>
                                    <span className="badge-code">{promo.ma}</span>
                                </td>

                                <td>
                                    <div className="promo-name-cell">{promo.ten}</div>
                                    {promo.mota && (
                                        <div className="promo-desc-sub" title={promo.mota}>
                                            {promo.mota}
                                        </div>
                                    )}
                                </td>

                                <td>
                                    <span className={`badge-discount-type ${isPercent ? 'percent' : 'cash'}`}>
                                        {isPercent ? 'Phần trăm' : 'Tiền mặt'}
                                    </span>
                                    <div className="discount-val-text">
                                        {isPercent ? `${promo.giatri}%` : formatCurrency(promo.giatri)}
                                    </div>
                                </td>

                                <td>
                                    <div className="condition-tag-list">
                                        <div className="condition-tag">
                                            <span>Đơn tối thiểu:</span>
                                            <strong>{Number(promo.giatritoithieu) > 0 ? formatCurrency(promo.giatritoithieu) : '0đ'}</strong>
                                        </div>

                                        {isPercent && Number(promo.giamtoida) > 0 && (
                                            <div className="condition-tag">
                                                <span>Giảm tối đa:</span>
                                                <strong>{formatCurrency(promo.giamtoida)}</strong>
                                            </div>
                                        )}

                                        <div className="condition-tag">
                                            <span>Đã dùng:</span>
                                            <strong>{promo.daluotdung || 0} / {promo.soluong > 0 ? promo.soluong : '∞'}</strong>
                                            <span style={{ color: '#059669', fontSize: '11px' }}>
                                                (Còn {promo.soluong_conlai ?? (promo.soluong - (promo.daluotdung || 0))})
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                <td>
                                    <div className="time-range-text">
                                        <div><strong>Từ:</strong> {formatDate(promo.ngaybatdau)}</div>
                                        <div><strong>Đến:</strong> {formatDate(promo.ngayketthuc)}</div>
                                    </div>
                                    <div>
                                        {validity === 'conhan' && (
                                            <span className="validity-pill conhan">● Còn hiệu lực</span>
                                        )}
                                        {validity === 'hethan' && (
                                            <span className="validity-pill hethan">● Hết hạn</span>
                                        )}
                                        {validity === 'chuabatdau' && (
                                            <span className="validity-pill chuabatdau">● Chưa bắt đầu</span>
                                        )}
                                    </div>
                                </td>

                                <td>
                                    <span className={`status-pill ${promo.trangthai === 'hoatdong' ? 'active' : 'inactive'}`}>
                                        {promo.trangthai === 'hoatdong' ? 'Hoạt động' : 'Tạm ngưng'}
                                    </span>
                                </td>

                                <td>
                                    <span style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        background: '#f3f4f6',
                                        fontWeight: 600,
                                        fontSize: '13px'
                                    }}>
                                        🛒 {promo.donhangs_count || 0}
                                    </span>
                                </td>

                                <td>
                                    <div className="promo-actions-cell" style={{ justifyContent: 'flex-end' }}>
                                        <Link
                                            href={`/admin/promotions/edit/${promo.id}`}
                                            className="btn-icon-action edit"
                                            title="Chỉnh sửa khuyến mãi"
                                        >
                                            ✏️
                                        </Link>

                                        <button
                                            type="button"
                                            className="btn-icon-action delete"
                                            onClick={() => onDelete(promo)}
                                            title="Xóa khuyến mãi"
                                        >
                                            🗑️
                                        </button>
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

