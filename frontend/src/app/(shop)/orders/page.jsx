'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import AccountSidebar from '@/components/shop/AccountSidebar';
import { authService } from '@/services/authService';
import { orderService } from '@/services/orderService';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  User,
  Phone,
  FileText,
  Eye,
  ShoppingBag,
  RotateCcw,
  X,
  Search,
  Ban,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

// Chuyển đổi đường dẫn ảnh lưu trữ Laravel sang URL hợp lệ
function getImageUrl(path) {
  if (!path) return '/placeholder.png';
  return path.startsWith('http')
    ? path
    : `http://localhost:8000/storage/${path}`;
}

// Chuyển đổi mã trạng thái từ database thành nhãn hiển thị và màu sắc
function mapOrderStatus(status) {
  switch (status?.toLowerCase()) {
    case 'choxacnhan':
    case 'daxacnhan':
    case 'pending':
      return {
        key: 'pending',
        label: 'Chờ xác nhận',
        color: 'amber',
      };
    case 'danggiao':
    case 'shipping':
      return {
        key: 'shipping',
        label: 'Đang giao hàng',
        color: 'blue',
      };
    case 'hoantat':
    case 'hoanthanh':
    case 'completed':
      return {
        key: 'completed',
        label: 'Hoàn thành',
        color: 'green',
      };
    case 'dahuy':
    case 'cancelled':
      return {
        key: 'cancelled',
        label: 'Đã hủy',
        color: 'red',
      };
    default:
      return {
        key: 'other',
        label: status || 'Đang xử lý',
        color: 'gray',
      };
  }
}

// Chuyển đổi phương thức thanh toán sang nhãn thân thiện
function mapPaymentMethod(method) {
  switch (method?.toLowerCase()) {
    case 'tienmat':
    case 'cod':
      return 'Thanh toán khi nhận hàng (COD)';
    case 'chuyenkhoan':
      return 'Chuyển khoản ngân hàng / Online';
    case 'vnpay':
      return 'Ví điện tử VNPay';
    case 'momo':
      return 'Ví điện tử MoMo';
    default:
      return method || 'Thanh toán trực tiếp';
  }
}

// Kiểm tra xem đơn hàng có thể hủy được hay không (khi đơn chưa giao: Chờ xác nhận / Đã xác nhận)
const CANCELABLE_STATUSES = ['choxacnhan', 'daxacnhan', 'pending'];
function isOrderCancelable(status) {
  if (!status) return false;
  return CANCELABLE_STATUSES.includes(String(status).toLowerCase().trim());
}

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [user, setUser] = useState(null);

  // Trạng thái cho tính năng Hủy đơn hàng phía khách hàng
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [cancelReason, setCancelReason] = useState('Tôi muốn thay đổi địa chỉ nhận hàng');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Khóa cuộn trang khi mở modal chi tiết hoặc modal xác nhận hủy
  useEffect(() => {
    if (selectedOrder || orderToCancel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedOrder, orderToCancel]);

  // Định nghĩa các tab lọc trạng thái
  const filterTabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'shipping', label: 'Đang giao' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
  ];

  // Tải danh sách đơn hàng thực tế từ Database thông qua API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải đơn hàng từ database:', err);
      setError('Không thể tải danh sách đơn hàng từ máy chủ. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(authService.getUser());
    fetchOrders();
  }, [fetchOrders]);

  // Mở modal xác nhận hủy đơn
  const handleOpenCancelModal = (order) => {
    setOrderToCancel(order);
    setCancelReason('Tôi muốn thay đổi địa chỉ nhận hàng');
    setCustomReason('');
    setCancelError('');
  };

  // Xác nhận gửi yêu cầu hủy đơn
  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    const finalReason =
      cancelReason === 'Lý do khác'
        ? (customReason.trim() || 'Khách hàng hủy với lý do khác')
        : cancelReason;

    try {
      setCancelling(true);
      setCancelError('');
      await orderService.cancelMyOrder(orderToCancel.id, finalReason);

      // Hiển thị thông báo thành công
      setSuccessToast(`Đơn hàng #${orderToCancel.madon || orderToCancel.id} đã được hủy thành công.`);
      setTimeout(() => setSuccessToast(''), 4500);

      // Cập nhật selectedOrder nếu modal chi tiết đang mở
      if (selectedOrder && selectedOrder.id === orderToCancel.id) {
        setSelectedOrder((prev) => ({
          ...prev,
          trangthai: 'dahuy',
        }));
      }

      setOrderToCancel(null);

      // Tải lại danh sách đơn hàng
      fetchOrders();
    } catch (err) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      setCancelError(
        err.response?.data?.message || 'Không thể hủy đơn hàng vào lúc này. Vui lòng thử lại sau.'
      );
    } finally {
      setCancelling(false);
    }
  };

  // Đếm số lượng đơn hàng theo từng nhóm trạng thái
  const counts = useMemo(() => {
    const res = {
      all: orders.length,
      pending: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0,
    };

    orders.forEach((o) => {
      const mapped = mapOrderStatus(o.trangthai);
      if (res[mapped.key] !== undefined) {
        res[mapped.key] += 1;
      }
    });

    return res;
  }, [orders]);

  // Lọc đơn hàng theo Tab và từ khóa tìm kiếm
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const mapped = mapOrderStatus(order.trangthai);
      const matchTab = activeTab === 'all' || mapped.key === activeTab;

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        q === '' ||
        order.madon?.toLowerCase().includes(q) ||
        order.hoten_nguoinhan?.toLowerCase().includes(q) ||
        (Array.isArray(order.chitiet) &&
          order.chitiet.some((item) =>
            item.ten_sanpham?.toLowerCase().includes(q)
          ));

      return matchTab && matchSearch;
    });
  }, [orders, activeTab, searchQuery]);

  // Render Badge trạng thái theo chuẩn thiết kế
  const renderStatusBadge = (statusStr) => {
    const { key, label } = mapOrderStatus(statusStr);
    switch (key) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {label}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            {label}
          </span>
        );
      case 'shipping':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            {label}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            {label}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {label}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 text-gray-800">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb điều hướng */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-yellow-600 transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-gray-400">Tài khoản</span>
          <span>/</span>
          <span className="font-semibold text-gray-900">Danh sách đơn hàng</span>
        </nav>

        {/* Bố cục 2 cột (Sidebar 25% | Nội dung 75%) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cột trái: Sidebar điều hướng (Truyền orderCount đồng bộ chính xác với số đơn) */}
          <div className="lg:col-span-1">
            <AccountSidebar activeTab="orders" user={user} orderCount={counts.all} />
          </div>

          {/* Cột phải: Danh sách đơn hàng từ Database */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header & Tabs Container */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6">
              <div className="pb-4 mb-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Danh sách đơn hàng
                    <span className="inline-block w-2 h-2 rounded-full bg-yellow-400"></span>
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Toàn bộ đơn hàng được đồng bộ trực tiếp từ cơ sở dữ liệu hệ thống
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchOrders}
                  disabled={loading}
                  className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-yellow-400 text-gray-800 hover:text-gray-950 rounded-xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Tải lại dữ liệu từ database"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới
                </button>
              </div>

              {/* 1. Thanh Tabs Bộ lọc với điểm nhấn Vàng Golden */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-gray-100">
                {filterTabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const count = counts[tab.key] || 0;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      type="button"
                      className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-yellow-400 text-gray-950 shadow-sm font-bold'
                          : 'text-gray-600 hover:text-gray-950 hover:bg-gray-100'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                          isActive
                            ? 'bg-gray-950 text-yellow-400'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* 2. Thanh tìm kiếm đơn hàng */}
              <div className="mt-4 relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm theo Mã đơn hàng (VD: DH202610...) hoặc Tên sản phẩm..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Thông báo thao tác thành công */}
            {successToast && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-sm text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successToast}</span>
              </div>
            )}

            {/* Thông báo lỗi nếu có */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700 flex items-center justify-between">
                <span>{error}</span>
                <button
                  onClick={fetchOrders}
                  className="underline font-semibold hover:text-red-900 ml-3"
                >
                  Thử lại
                </button>
              </div>
            )}

            {/* 3. Danh sách Đơn hàng (Hiển thị đơn giản, tinh gọn) */}
            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center shadow-sm">
                <div className="w-8 h-8 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm text-gray-500">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const items = Array.isArray(order.chitiet) ? order.chitiet : [];
                  const totalQuantity = items.reduce(
                    (sum, item) => sum + (Number(item.soluong) || 1),
                    0
                  );
                  const orderDate = order.created_at
                    ? new Date(order.created_at).toLocaleString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })
                    : 'Mới đặt gần đây';

                  // Tóm tắt tên sản phẩm
                  const firstItemName =
                    items[0]?.ten_sanpham ||
                    items[0]?.sanpham?.ten ||
                    'Sản phẩm công nghệ';
                  const summaryText =
                    items.length > 1
                      ? `${firstItemName} và ${items.length - 1} sản phẩm khác`
                      : firstItemName;

                  return (
                    <article
                      key={order.id}
                      className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md hover:border-yellow-400 transition-all overflow-hidden"
                    >
                      {/* Header đơn hàng: Mã đơn, Ngày đặt & Badge trạng thái */}
                      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-gray-900 text-sm sm:text-base">
                            #{order.madon || `DH${order.id}`}
                          </span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            {orderDate}
                          </span>
                        </div>
                        <div>{renderStatusBadge(order.trangthai)}</div>
                      </div>

                      {/* Body đơn hàng: Hiển thị tóm tắt đơn giản, tinh gọn */}
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                            <Package className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                            <span className="truncate">{summaryText}</span>
                            <span className="text-xs text-gray-500 font-normal bg-gray-100 px-2 py-0.5 rounded-md flex-shrink-0">
                              {totalQuantity} món
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span>{order.hoten_nguoinhan || 'Khách hàng'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                              <span>{mapPaymentMethod(order.phuongthucthanhtoan)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tổng tiền & Nút Xem chi tiết */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 flex-shrink-0">
                          <div className="text-left sm:text-right mr-1">
                            <span className="text-xs text-gray-500 block">Tổng tiền:</span>
                            <strong className="text-base sm:text-lg font-bold text-red-600">
                              {Number(
                                order.thanhtien || order.tongtien || 0
                              ).toLocaleString('vi-VN')}{' '}
                              đ
                            </strong>
                          </div>

                          {isOrderCancelable(order.trangthai) && (
                            <button
                              type="button"
                              onClick={() => handleOpenCancelModal(order)}
                              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-xs sm:text-sm rounded-xl border border-red-200 hover:border-red-300 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Hủy đơn hàng này"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Hủy đơn</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Xem chi tiết</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* Trạng thái trống */
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-yellow-50 border-2 border-yellow-200 text-yellow-500 mx-auto flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                  {searchQuery
                    ? `Không tìm thấy đơn hàng phù hợp với từ khóa "${searchQuery}".`
                    : 'Hiện tại bạn chưa có đơn hàng nào trong trạng thái này.'}
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-sm shadow-sm transition"
                >
                  <span>Khám phá sản phẩm ngay</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Xem Chi Tiết Đơn Hàng (z-[9999] vượt lên trên Header z-index 1000, căn giữa hoàn hảo) */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedOrder(null);
          }}
        >
          <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 my-auto flex flex-col max-h-[88vh] overflow-hidden">
            {/* Header Modal - Cố định ở đầu (Sticky Header) */}
            <div className="px-5 py-4 sm:px-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-10">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 font-mono">
                    #{selectedOrder.madon || `DH${selectedOrder.id}`}
                  </h3>
                  {renderStatusBadge(selectedOrder.trangthai)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Thời gian đặt:{' '}
                  {selectedOrder.created_at
                    ? new Date(selectedOrder.created_at).toLocaleString('vi-VN')
                    : 'Gần đây'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung Modal - Cuộn mượt mà bên trong (Scrollable Content) */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
              {/* 1. Thông tin giao nhận */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/70 text-sm space-y-2.5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                  Thông tin người nhận
                </h4>
                <div className="flex items-start gap-2 text-gray-800">
                  <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="font-semibold">{selectedOrder.hoten_nguoinhan}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{selectedOrder.sodienthoai}</span>
                </div>
                <div className="flex items-start gap-2 text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>{selectedOrder.diachigiaohang}</span>
                </div>
                {selectedOrder.ghichu && (
                  <div className="flex items-start gap-2 text-gray-600 pt-1 border-t border-gray-200/60 text-xs">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Ghi chú: {selectedOrder.ghichu}</span>
                  </div>
                )}
              </div>

              {/* 2. Danh sách sản phẩm đầy đủ (Ảnh, Tên, Số lượng, Đơn giá, Thành tiền) */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Danh sách sản phẩm ({selectedOrder.chitiet?.length || 0})
                </h4>

                <div className="divide-y divide-gray-100 border border-gray-200/70 rounded-xl overflow-hidden bg-white">
                  {Array.isArray(selectedOrder.chitiet) && selectedOrder.chitiet.length > 0 ? (
                    selectedOrder.chitiet.map((item, idx) => {
                      const sanPham = item.sanpham || {};
                      const imgUrl = getImageUrl(sanPham.hinhanh);
                      const unitPrice = Number(item.gia || item.thanhtien || 0);
                      const qty = Number(item.soluong || 1);
                      const itemTotal = Number(item.thanhtien) || unitPrice * qty;

                      return (
                        <div
                          key={item.id || idx}
                          className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors"
                        >
                          {/* Hình ảnh sản phẩm */}
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                            <img
                              src={imgUrl}
                              alt={item.ten_sanpham || sanPham.ten || 'Sản phẩm'}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/placeholder.png';
                              }}
                            />
                          </div>

                          {/* Tên sản phẩm & Chi tiết */}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-sm sm:text-base text-gray-900 line-clamp-2">
                              {item.ten_sanpham || sanPham.ten || 'Sản phẩm công nghệ'}
                            </h5>
                            {item.sanpham_id && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                Mã SP: #{item.sanpham_id}
                              </p>
                            )}
                            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                              <span>
                                Đơn giá:{' '}
                                <strong className="text-gray-900">
                                  {unitPrice.toLocaleString('vi-VN')} đ
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Số lượng:{' '}
                                <strong className="text-gray-900">x{qty}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Thành tiền */}
                          <div className="text-right flex-shrink-0">
                            <span className="block text-sm sm:text-base font-bold text-red-600">
                              {itemTotal.toLocaleString('vi-VN')} đ
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-sm text-gray-500 italic text-center">
                      Không có chi tiết sản phẩm
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Tóm tắt Chi phí & Phương thức thanh toán */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200/70 space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Phương thức thanh toán:</span>
                  <span className="font-semibold text-gray-900">
                    {mapPaymentMethod(selectedOrder.phuongthucthanhtoan)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tạm tính tiền hàng:</span>
                  <span>
                    {Number(
                      selectedOrder.tongtien || selectedOrder.thanhtien || 0
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>
                {Number(selectedOrder.tiengiam) > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>Voucher giảm giá:</span>
                    <span>
                      -{Number(selectedOrder.tiengiam).toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-gray-600">
                  <span>Phí vận chuyển:</span>
                  <span className="font-medium text-emerald-600">Miễn phí</span>
                </div>
                <div className="flex justify-between items-baseline pt-3 border-t border-gray-200 text-base">
                  <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                  <span className="text-xl sm:text-2xl font-black text-red-600">
                    {Number(
                      selectedOrder.thanhtien || selectedOrder.tongtien || 0
                    ).toLocaleString('vi-VN')}{' '}
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* Footer Modal - Cố định ở cuối (Sticky Footer) */}
            <div className="px-5 py-3.5 sm:px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 flex-shrink-0 z-10">
              <div>
                {isOrderCancelable(selectedOrder.trangthai) && (
                  <button
                    type="button"
                    onClick={() => handleOpenCancelModal(selectedOrder)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-bold text-xs sm:text-sm rounded-xl border border-red-200 hover:border-red-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-4 h-4" />
                    <span>Hủy đơn hàng</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/products"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold text-xs sm:text-sm transition text-center"
                >
                  Mua thêm sản phẩm
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận hủy đơn hàng phía khách hàng */}
      {orderToCancel && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancelling) setOrderToCancel(null);
          }}
        >
          <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 p-6 my-auto overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <h3 className="text-lg font-bold text-gray-900">
                  Xác nhận hủy đơn hàng
                </h3>
              </div>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setOrderToCancel(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-sm text-gray-600">
                Bạn có chắc chắn muốn hủy đơn hàng{' '}
                <strong className="text-gray-900 font-mono">
                  #{orderToCancel.madon || orderToCancel.id}
                </strong>
                ? Sau khi hủy, đơn hàng sẽ không thể khôi phục lại.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Vui lòng chọn lý do hủy đơn:
                </label>
                <div className="space-y-2">
                  {[
                    'Tôi muốn thay đổi địa chỉ nhận hàng',
                    'Tôi muốn thay đổi sản phẩm hoặc số lượng',
                    'Tôi tìm thấy giá tốt hơn ở nơi khác',
                    'Tôi đổi ý, không có nhu cầu mua nữa',
                    'Lý do khác',
                  ].map((reasonOption) => (
                    <label
                      key={reasonOption}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-sm cursor-pointer transition-all ${
                        cancelReason === reasonOption
                          ? 'border-yellow-400 bg-yellow-50/50 text-gray-950 font-medium'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancelReason"
                        value={reasonOption}
                        checked={cancelReason === reasonOption}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="text-yellow-500 focus:ring-yellow-400"
                      />
                      <span>{reasonOption}</span>
                    </label>
                  ))}
                </div>
              </div>

              {cancelReason === 'Lý do khác' && (
                <div>
                  <textarea
                    rows="3"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Nhập lý do cụ thể của bạn..."
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20"
                  />
                </div>
              )}

              {cancelError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {cancelError}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setOrderToCancel(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition cursor-pointer"
              >
                Quay lại
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleConfirmCancel}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-xs transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {cancelling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang hủy...</span>
                  </>
                ) : (
                  <span>Xác nhận hủy đơn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
