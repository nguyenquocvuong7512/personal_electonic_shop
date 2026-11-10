'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { cartService } from '../../../services/cartService';

function formatPrice(amount) {
  return `${Number(amount || 0).toLocaleString('vi-VN')} đ`;
}

function getImageUrl(path) {
  if (!path) {
    return '/placeholder.png';
  }

  return path.startsWith('http')
    ? path
    : `http://localhost:8000/storage/${path}`;
}

export default function CartPage() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [quantities, setQuantities] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  //chuan hoa du lieu tu response
  const applyCartResponse = useCallback((response) => {
    const data = response?.data || response || { items: [], total: 0 };
    const items = Array.isArray(data.items) ? data.items : [];
    setError('');
    setCart({ ...data, items });
    setQuantities(
      Object.fromEntries(items.map((item) => [item.id, item.soluong]))
    );
  }, []);

  const loadCart = useCallback(async () => {
    try {
      const response = await cartService.get();
      applyCartResponse(response);
      return true;
    } catch (loadError) {
      setError(
        loadError.response?.data?.message ||
        'Không thể tải giỏ hàng. Vui lòng thử lại sau.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  }, [applyCartResponse]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Hàm cập nhật số lượng dùng chung
  const handleUpdateQuantity = async (item, newQuantity) => {
    const quantity = Number(newQuantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      setError('Số lượng phải là số nguyên lớn hơn 0.');
      return;
    }

    const stock = item.sanpham?.soluong;
    if (typeof stock === 'number' && stock > 0 && quantity > stock) {
      setError(
        `Số lượng sản phẩm "${item.sanpham?.ten || ''}" không được vượt quá tồn kho (${stock}).`
      );
      setQuantities((prev) => ({ ...prev, [item.id]: item.soluong }));
      return;
    }

    setBusyItemId(item.id);
    setError('');
    setMessage('');

    try {
      setQuantities((prev) => ({ ...prev, [item.id]: quantity }));
      await cartService.update(item.id, quantity);
      await loadCart();
      setMessage('Đã cập nhật số lượng sản phẩm.');
    } catch (updateError) {
      setError(
        updateError.response?.data?.message ||
        'Không thể cập nhật số lượng sản phẩm.'
      );
      setQuantities((prev) => ({ ...prev, [item.id]: item.soluong }));
    } finally {
      setBusyItemId(null);
    }
  };

  // Tăng số lượng sản phẩm (+1)
  const handleIncrease = (item) => {
    const currentQty = Number(quantities[item.id] ?? item.soluong) || 1;
    const stock = item.sanpham?.soluong;
    if (typeof stock === 'number' && stock > 0 && currentQty >= stock) {
      setError(`Sản phẩm đã đạt số lượng tối đa trong kho (${stock}).`);
      return;
    }
    handleUpdateQuantity(item, currentQty + 1);
  };

  // Giảm số lượng sản phẩm (-1), chặn không cho giảm dưới 1
  const handleDecrease = (item) => {
    const currentQty = Number(quantities[item.id] ?? item.soluong) || 1;
    if (currentQty <= 1) {
      return;
    }
    handleUpdateQuantity(item, currentQty - 1);
  };

  // Nhập số lượng trực tiếp trong ô input
  const handleInputChange = (item, value) => {
    setQuantities((prev) => ({
      ...prev,
      [item.id]: value,
    }));
  };

  // Xử lý khi rời khỏi ô input (onBlur)
  const handleInputBlur = (item) => {
    const rawVal = quantities[item.id];
    let parsedVal = parseInt(rawVal, 10);

    if (isNaN(parsedVal) || parsedVal < 1) {
      parsedVal = 1;
    }

    const stock = item.sanpham?.soluong;
    if (typeof stock === 'number' && stock > 0 && parsedVal > stock) {
      parsedVal = stock;
    }

    if (parsedVal !== item.soluong) {
      handleUpdateQuantity(item, parsedVal);
    } else {
      setQuantities((prev) => ({ ...prev, [item.id]: parsedVal }));
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
  const handleRemove = async (item) => {
    setBusyItemId(item.id);
    setError('');
    setMessage('');

    try {
      await cartService.remove(item.id);
      await loadCart();
      setMessage('Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (removeError) {
      setError(
        removeError.response?.data?.message ||
        'Không thể xóa sản phẩm khỏi giỏ hàng.'
      );
    } finally {
      setBusyItemId(null);
    }
  };

  // Tính tổng số lượng và tổng tiền tạm tính & tổng cộng
  const subtotal = useMemo(() => {
    if (!cart?.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((sum, item) => {
      const qty = Number(quantities[item.id] ?? item.soluong) || 0;
      const unitPrice = Number(
        item.don_gia || item.sanpham?.giakhuyenmai || item.sanpham?.gia || 0
      );
      return sum + qty * unitPrice;
    }, 0);
  }, [cart.items, quantities]);

  const total = subtotal;

  const totalItemsCount = useMemo(() => {
    if (!cart?.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((sum, item) => {
      return sum + (Number(quantities[item.id] ?? item.soluong) || 0);
    }, 0);
  }, [cart.items, quantities]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-gray-800">Đang tải giỏ hàng...</h2>
        <p className="text-sm text-gray-400 mt-1">Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Tiêu đề & Nút quay lại mua sắm */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Giỏ hàng
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {cart.items.length > 0
                ? `Bạn đang có ${cart.items.length} sản phẩm trong giỏ hàng`
                : 'Giỏ hàng của bạn đang trống'}
            </p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tiếp tục mua sắm
          </Link>
        </div>

        {/* Thông báo lỗi & thành công */}
        {error && (
          <div
            className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm shadow-xs"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="flex-1">{error}</span>
          </div>
        )}
        {message && (
          <div
            className="mb-6 flex items-center gap-3 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm shadow-xs"
            role="status"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-500" />
            <span className="flex-1">{message}</span>
          </div>
        )}

        {/* Giỏ hàng trống */}
        {cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bạn chưa chọn sản phẩm nào vào giỏ hàng. Hãy lướt xem các danh mục sản phẩm và ưu đãi ngay hôm nay!
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-sm transition-all duration-150"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          /* Bố cục giỏ hàng: Desktop 2 cột (70% và 30%), Mobile 1 cột */
          <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start gap-6">
            {/* Cột trái (70%): Danh sách sản phẩm */}
            <div className="w-full lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                {cart.items.map((item) => {
                  const currentQuantity =
                    Number(quantities[item.id] ?? item.soluong) || 1;
                  const unitPrice = Number(
                    item.don_gia ||
                    item.sanpham?.giakhuyenmai ||
                    item.sanpham?.gia ||
                    0
                  );
                  const itemTotal =
                    Number(item.thanh_tien) || currentQuantity * unitPrice;
                  const maxStock = item.sanpham?.soluong;
                  const isBusy = busyItemId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 ${isBusy ? 'opacity-60 pointer-events-none' : ''
                        }`}
                    >
                      {/* Ảnh sản phẩm (trái) và Thông tin sản phẩm (giữa) */}
                      <div className="flex items-center gap-4 min-w-0 flex-1 w-full sm:w-auto">
                        {/* Ảnh sản phẩm (có nền xám nhạt, bo góc rounded-md) */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-200/60">
                          <img
                            src={getImageUrl(
                              item.sanpham?.hinhanh ||
                              item.sanpham?.sanpham_hinhanh
                            )}
                            alt={item.sanpham?.ten || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        </div>

                        {/* Ở giữa: Tên sản phẩm (chữ đậm) và Đơn giá (màu đỏ) */}
                        <div className="min-w-0 flex-1">
                          <h2 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 hover:text-yellow-600 transition-colors">
                            {item.sanpham?.id ? (
                              <Link href={`/productdetail/${item.sanpham.id}`}>
                                {item.sanpham?.ten || 'Sản phẩm'}
                              </Link>
                            ) : (
                              <span>{item.sanpham?.ten || 'Sản phẩm'}</span>
                            )}
                          </h2>

                          <div className="mt-1 flex flex-wrap items-baseline gap-2">
                            <span className="text-red-600 font-bold text-base sm:text-lg">
                              {formatPrice(unitPrice)}
                            </span>
                            {item.sanpham?.gia &&
                              Number(item.sanpham.gia) > unitPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(item.sanpham.gia)}
                                </span>
                              )}
                          </div>

                          {typeof maxStock === 'number' && (
                            <p className="text-xs text-gray-500 mt-1">
                              Tồn kho:{' '}
                              <span className="font-medium text-gray-700">
                                {maxStock}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bên phải: Cụm điều chỉnh số lượng & Nút xóa & Thành tiền */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                        {/* Cụm điều chỉnh số lượng [ Minus ] Số lượng [ Plus ] bọc trong border liền khối */}
                        <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-xs">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            disabled={currentQuantity <= 1 || isBusy}
                            aria-label="Giảm số lượng"
                            className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <input
                            type="number"
                            min="1"
                            max={maxStock || 9999}
                            value={quantities[item.id] ?? item.soluong}
                            onChange={(e) =>
                              handleInputChange(item, e.target.value)
                            }
                            onBlur={() => handleInputBlur(item)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            disabled={isBusy}
                            className="w-12 text-center text-sm font-semibold text-gray-900 border-x border-gray-200 py-1.5 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />

                          <button
                            type="button"
                            onClick={() => handleIncrease(item)}
                            disabled={
                              (typeof maxStock === 'number' &&
                                maxStock > 0 &&
                                currentQuantity >= maxStock) ||
                              isBusy
                            }
                            aria-label="Tăng số lượng"
                            className="p-2 text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Thành tiền trên Desktop */}
                        <div className="text-right min-w-[90px] hidden sm:block">
                          <span className="block text-sm font-bold text-gray-900">
                            {formatPrice(itemTotal)}
                          </span>
                        </div>

                        {/* Nút Trash2 xóa sản phẩm (thiết kế tinh tế, màu xám hoặc đỏ nhạt, hover đỏ đậm) */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={isBusy}
                          title="Xóa sản phẩm khỏi giỏ hàng"
                          aria-label="Xóa sản phẩm"
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Cột phải (30%): Khung Tổng đơn hàng (Order Summary), đổ shadow nhẹ, sticky khi cuộn trang */}
            <div className="w-full lg:col-span-4 sticky top-24">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 pb-4 border-b border-gray-100">
                  Tổng đơn hàng
                </h2>

                <div className="py-4 space-y-3 text-sm text-gray-600 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span>Tổng số lượng</span>
                    <span className="font-semibold text-gray-900">
                      {totalItemsCount} sản phẩm
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Phí vận chuyển</span>
                    <span className="text-green-600 font-medium">Miễn phí</span>
                  </div>
                </div>

                <div className="pt-4 pb-6 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">
                      Tổng cộng
                    </span>
                    <span className="text-xs text-gray-400">
                      (Đã bao gồm VAT nếu có)
                    </span>
                  </div>
                  <span className="text-2xl font-black text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Nút "Tiến hành thanh toán" */}
                <Link
                  href="/checkout"
                  className={`w-full py-3.5 px-4 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-bold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 text-center ${cart.items.length === 0
                      ? 'pointer-events-none opacity-50'
                      : 'cursor-pointer'
                    }`}
                >
                  Tiến hành thanh toán
                </Link>

                {/* Cam kết bán hàng */}
                <div className="mt-6 pt-5 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span>100% Sản phẩm chính hãng & bảo hành uy tín</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span>Giao hàng tận nơi toàn quốc nhanh chóng</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <span>Hỗ trợ đổi trả trong vòng 7 ngày</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
