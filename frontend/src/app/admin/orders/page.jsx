'use client';

import React, { useEffect, useState } from 'react';
import { orderService } from '@/services/orderService';
import '@/styles/admin/orders.css';

const STATUS_LABELS = {
  choxacnhan: 'Chờ xác nhận',
  daxacnhan: 'Đã xác nhận',
  danggiao: 'Đang giao',
  hoantat: 'Hoàn tất',
  dahuy: 'Đã hủy',
};

const CANCELABLE_STATUSES = ['choxacnhan', 'daxacnhan'];

const formatCurrency = (value) =>
  `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const formatPaymentMethod = (value) => ({
  tienmat: 'Tiền mặt',
  chuyenkhoan: 'Chuyển khoản',
  vnpay: 'VNPay',
}[value] || value || '—');

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('vi-VN');
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancelOrder, setCancelOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [busyOrderId, setBusyOrderId] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      setLoading(true);
      setError('');

      try {
        const result = await orderService.getAll({
          ...filters,
          page: currentPage,
          per_page: 10,
        });

        if (!result || !Array.isArray(result.data)) {
          throw new Error('Dữ liệu danh sách đơn hàng không hợp lệ.');
        }

        if (active) {
          setOrders(result.data);
          setCurrentPage(result.current_page || 1);
          setLastPage(result.last_page || 1);
          setTotal(result.total || 0);
        }
      } catch (fetchError) {
        if (active) {
          setError(getErrorMessage(fetchError, 'Không thể tải danh sách đơn hàng.'));
          setOrders([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOrders();
    return () => {
      active = false;
    };
  }, [currentPage, filters, refreshKey]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    window.setTimeout(() => setMessage(''), 3500);
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    if (fromDateInput && toDateInput && fromDateInput > toDateInput) {
      setError('Ngày bắt đầu không được sau ngày kết thúc.');
      return;
    }

    setError('');
    setCurrentPage(1);
    setFilters({
      ...(statusFilter ? { trangthai: statusFilter } : {}),
      ...(searchInput.trim() ? { search: searchInput.trim() } : {}),
      ...(fromDateInput ? { from_date: fromDateInput } : {}),
      ...(toDateInput ? { to_date: toDateInput } : {}),
    });
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setSearchInput('');
    setFromDateInput('');
    setToDateInput('');
    setCurrentPage(1);
    setFilters({});
    setError('');
  };

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    setLoadingDetail(true);
    try {
      const detail = await orderService.getById(order.id);
      setSelectedOrder(detail);
    } catch (detailError) {
      showMessage(getErrorMessage(detailError, 'Không thể tải chi tiết đơn hàng.'), 'error');
    } finally {
      setLoadingDetail(false);
    }
  };

  const refreshAfterMutation = async (id) => {
    setRefreshKey((key) => key + 1);
    if (selectedOrder?.id === id) {
      try {
        const detail = await orderService.getById(id);
        setSelectedOrder(detail);
      } catch (detailError) {
        showMessage(getErrorMessage(detailError, 'Đã cập nhật đơn nhưng không tải lại được chi tiết.'), 'error');
      }
    }
  };

  const handleUpdateStatus = async (order, nextStatus) => {
    setBusyOrderId(order.id);
    try {
      const response = await orderService.updateStatus(order.id, nextStatus);
      showMessage(response.message || 'Cập nhật trạng thái đơn hàng thành công.');
      await refreshAfterMutation(order.id);
    } catch (updateError) {
      showMessage(getErrorMessage(updateError, 'Không thể cập nhật trạng thái đơn hàng.'), 'error');
    } finally {
      setBusyOrderId(null);
    }
  };

  const handleCancelOrder = async (event) => {
    event.preventDefault();
    if (!cancelOrder) return;

    setBusyOrderId(cancelOrder.id);
    try {
      const response = await orderService.cancel(cancelOrder.id, cancelReason.trim() || undefined);
      showMessage(response.message || 'Hủy đơn hàng thành công.');
      await refreshAfterMutation(cancelOrder.id);
      setCancelOrder(null);
      setCancelReason('');
    } catch (cancelError) {
      showMessage(getErrorMessage(cancelError, 'Không thể hủy đơn hàng.'), 'error');
    } finally {
      setBusyOrderId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      <header className="orders-header">
        <div>
          <h1>Quản lý đơn hàng</h1>
          <p>Theo dõi, tra cứu và xử lý các đơn hàng của khách hàng.</p>
        </div>
        <div className="orders-total">
          <span>Tổng số đơn</span>
          <strong>{total.toLocaleString('vi-VN')}</strong>
        </div>
      </header>

      <form className="orders-filters" onSubmit={handleFilterSubmit}>
        <label>
          Tìm kiếm
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Mã đơn hoặc tên khách hàng"
          />
        </label>
        <label>
          Trạng thái
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          Từ ngày
          <input type="date" value={fromDateInput} onChange={(event) => setFromDateInput(event.target.value)} />
        </label>
        <label>
          Đến ngày
          <input type="date" value={toDateInput} onChange={(event) => setToDateInput(event.target.value)} />
        </label>
        <div className="orders-filter-actions">
          <button className="orders-button orders-button-primary" type="submit">Lọc đơn hàng</button>
          <button className="orders-button orders-button-secondary" type="button" onClick={handleResetFilters}>Đặt lại</button>
        </div>
      </form>

      {message && (
        <div className={`orders-notice ${messageType}`} role={messageType === 'error' ? 'alert' : 'status'}>
          {message}
        </div>
      )}
      {error && <div className="orders-error" role="alert">{error}</div>}

      <div className="orders-table-wrap">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>Ngày đặt</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th className="orders-amount-heading">Thành tiền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="orders-empty">Đang tải danh sách đơn hàng...</td></tr>
            ) : error ? (
              <tr><td colSpan="7" className="orders-empty">Không thể hiển thị dữ liệu.</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="7" className="orders-empty">Không tìm thấy đơn hàng phù hợp.</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id}>
                <td>
                  <button className="orders-code-button" type="button" onClick={() => openOrderDetails(order)}>
                    {order.madon || `#${order.id}`}
                  </button>
                </td>
                <td>
                  <strong>{order.hoten_nguoinhan || order.nguoidung?.ten || 'Khách hàng'}</strong>
                  <span className="orders-secondary-text">{order.email || order.nguoidung?.email || '—'}</span>
                </td>
                <td>{formatDate(order.created_at)}</td>
                <td>{formatPaymentMethod(order.phuongthucthanhtoan)}</td>
                <td><span className={`order-status status-${order.trangthai}`}>{STATUS_LABELS[order.trangthai] || order.trangthai}</span></td>
                <td className="orders-amount">{formatCurrency(order.thanhtien)}</td>
                <td>
                  <div className="orders-row-actions">
                    <button type="button" className="orders-button orders-button-view" onClick={() => openOrderDetails(order)}>Chi tiết</button>
                    <select
                      className="orders-status-select"
                      aria-label={`Cập nhật trạng thái đơn ${order.madon || order.id}`}
                      value={order.trangthai}
                      disabled={busyOrderId === order.id}
                      onChange={(event) => handleUpdateStatus(order, event.target.value)}
                    >
                      {Object.entries(STATUS_LABELS).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                    {CANCELABLE_STATUSES.includes(order.trangthai) && (
                      <button
                        type="button"
                        className="orders-button orders-button-cancel"
                        disabled={busyOrderId === order.id}
                        onClick={() => { setCancelOrder(order); setCancelReason(''); }}
                      >
                        Hủy đơn
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && !error && lastPage > 1 && (
        <nav className="orders-pagination" aria-label="Phân trang đơn hàng">
          <button type="button" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => page - 1)}>← Trước</button>
          <span>Trang <strong>{currentPage}</strong> / {lastPage}</span>
          <button type="button" disabled={currentPage >= lastPage} onClick={() => setCurrentPage((page) => page + 1)}>Sau →</button>
        </nav>
      )}

      {selectedOrder && (
        <div className="orders-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedOrder(null);
        }}>
          <section className="orders-modal orders-detail-modal" role="dialog" aria-modal="true" aria-labelledby="order-detail-title">
            <header className="orders-modal-header">
              <div>
                <h2 id="order-detail-title">Chi tiết đơn hàng</h2>
                <p>{selectedOrder.madon || `#${selectedOrder.id}`}</p>
              </div>
              <button type="button" className="orders-modal-close" onClick={() => setSelectedOrder(null)} aria-label="Đóng">×</button>
            </header>

            {loadingDetail ? <p className="orders-modal-loading">Đang tải chi tiết...</p> : (
              <>
                <div className="orders-detail-grid">
                  <div className="orders-detail-card">
                    <h3>Thông tin khách hàng</h3>
                    <p><strong>Người nhận:</strong> {selectedOrder.hoten_nguoinhan || selectedOrder.nguoidung?.ten || '—'}</p>
                    <p><strong>Email:</strong> {selectedOrder.email || selectedOrder.nguoidung?.email || '—'}</p>
                    <p><strong>Điện thoại:</strong> {selectedOrder.sodienthoai || selectedOrder.nguoidung?.sodienthoai || '—'}</p>
                    <p><strong>Địa chỉ giao:</strong> {selectedOrder.diachigiaohang || '—'}</p>
                  </div>
                  <div className="orders-detail-card">
                    <h3>Thông tin đơn hàng</h3>
                    <p><strong>Ngày đặt:</strong> {formatDate(selectedOrder.created_at)}</p>
                    <p><strong>Thanh toán:</strong> {formatPaymentMethod(selectedOrder.phuongthucthanhtoan)}</p>
                    <p><strong>Trạng thái:</strong> <span className={`order-status status-${selectedOrder.trangthai}`}>{STATUS_LABELS[selectedOrder.trangthai] || selectedOrder.trangthai}</span></p>
                    <p><strong>Ghi chú:</strong> {selectedOrder.ghichu || 'Không có'}</p>
                  </div>
                </div>

                <h3 className="orders-section-title">Sản phẩm trong đơn</h3>
                <div className="orders-detail-table-wrap">
                  <table className="orders-detail-table">
                    <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr></thead>
                    <tbody>
                      {(selectedOrder.chitiet || []).map((item) => (
                        <tr key={item.id}>
                          <td>{item.ten_sanpham || item.sanpham?.ten || 'Sản phẩm đã ngừng kinh doanh'}</td>
                          <td>{formatCurrency(item.gia)}</td>
                          <td>{item.soluong}</td>
                          <td>{formatCurrency(item.thanhtien)}</td>
                        </tr>
                      ))}
                      {(selectedOrder.chitiet || []).length === 0 && <tr><td colSpan="4">Không có thông tin sản phẩm.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="orders-totals">
                  <p>Tạm tính <span>{formatCurrency(selectedOrder.tongtien)}</span></p>
                  <p>Giảm giá <span>− {formatCurrency(selectedOrder.tiengiam)}</span></p>
                  <p className="orders-grand-total">Thành tiền <strong>{formatCurrency(selectedOrder.thanhtien)}</strong></p>
                </div>

                <h3 className="orders-section-title">Lịch sử trạng thái</h3>
                <ol className="orders-history">
                  {(selectedOrder.lichsu || []).map((item) => (
                    <li key={`${item.donhang_id}-${item.created_at}-${item.trangthaimoi}`}>
                      <span className="orders-history-dot" />
                      <div>
                        <strong>{STATUS_LABELS[item.trangthaimoi] || item.trangthaimoi}</strong>
                        <p>{item.trangthaicu ? `${STATUS_LABELS[item.trangthaicu] || item.trangthaicu} → ` : ''}{STATUS_LABELS[item.trangthaimoi] || item.trangthaimoi}</p>
                        <span>{formatDate(item.created_at)} · {item.nguoidung?.ten || 'Hệ thống'}</span>
                        {item.ghichu && <p>{item.ghichu}</p>}
                      </div>
                    </li>
                  ))}
                  {(selectedOrder.lichsu || []).length === 0 && <li>Chưa có lịch sử trạng thái.</li>}
                </ol>
              </>
            )}
          </section>
        </div>
      )}

      {cancelOrder && (
        <div className="orders-modal-backdrop" role="presentation">
          <form className="orders-modal orders-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" onSubmit={handleCancelOrder}>
            <h2 id="cancel-order-title">Xác nhận hủy đơn hàng</h2>
            <p>Hủy đơn <strong>{cancelOrder.madon || `#${cancelOrder.id}`}</strong>? Hành động này sẽ được ghi vào lịch sử trạng thái.</p>
            <label>
              Lý do hủy
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Nhập lý do hủy (không bắt buộc)"
              />
            </label>
            <div className="orders-modal-actions">
              <button type="button" className="orders-button orders-button-secondary" onClick={() => setCancelOrder(null)} disabled={busyOrderId === cancelOrder.id}>Đóng</button>
              <button type="submit" className="orders-button orders-button-cancel" disabled={busyOrderId === cancelOrder.id}>
                {busyOrderId === cancelOrder.id ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
