'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  CreditCard,
  Truck,
  Wallet,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building2,
  Calendar,
  Lock,
  User,
  Phone,
  Mail,
  FileText,
  ShoppingBag,
  Check,
  X,
  Tag,
  Ticket,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cartService } from '../../../services/cartService';
import { authService } from '../../../services/authService';
import { orderService } from '../../../services/orderService';
import {
  checkPromotionCode,
  getActivePromotions,
} from '@/services/promotionService';

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

export default function CheckoutPage() {
  const router = useRouter();

  // 1. Trạng thái Giỏ hàng & Tải dữ liệu
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // 2. Trạng thái Form Thông tin giao hàng
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // 3. Trạng thái Phương thức thanh toán
  // 'COD' | 'TRANSFER'
  const [paymentMethod, setPaymentMethod] = useState('COD');
  // 'MOMO' | 'PAYPAL' | 'BANK'
  const [paymentSubMethod, setPaymentSubMethod] = useState('MOMO');

  // 4. Trạng thái Popup QR MoMo
  const [showMomoQR, setShowMomoQR] = useState(false);

  // 5. Trạng thái Thẻ ngân hàng giả lập (Mockup NCB)
  const [cardData, setCardData] = useState({
    cardNumber: '9704 1985 2145 6789',
    cardHolder: 'NGUYEN VAN A',
    expiryDate: '12/28',
    cvv: '888',
  });
  const [cardErrors, setCardErrors] = useState({});

  // 6. Trạng thái Đặt hàng thành công (Modal / View)
  const [orderSuccessData, setOrderSuccessData] = useState(null);

  // 7. Trạng thái Khuyến mãi / Voucher
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [availablePromotions, setAvailablePromotions] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);

  // Khóa cuộn trang khi mở Popup MoMo QR
  useEffect(() => {
    if (showMomoQR) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showMomoQR]);

  // Tải thông tin người dùng (pre-fill) & Giỏ hàng & Khuyến mãi khi mở trang
  useEffect(() => {
    // Điền trước thông tin từ tài khoản nếu đã đăng nhập
    try {
      const user = authService.getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          name: user.ten || user.name || prev.name,
          phone: user.sodienthoai || user.phone || prev.phone,
          email: user.email || prev.email,
          address: user.diachi || user.address || prev.address,
        }));
      }
    } catch {
      // Bỏ qua lỗi đọc localStorage nếu có
    }

    // Tải dữ liệu giỏ hàng từ server
    const fetchCart = async () => {
      try {
        const response = await cartService.get();
        const data = response?.data || response || { items: [], total: 0 };
        const items = Array.isArray(data.items) ? data.items : [];
        setCart({ ...data, items });
      } catch (err) {
        console.error('Lỗi khi tải giỏ hàng cho thanh toán:', err);
      } finally {
        setLoading(false);
      }
    };

    // Tải danh sách mã khuyến mãi đang có hiệu lực
    const fetchPromos = async () => {
      try {
        const promos = await getActivePromotions();
        setAvailablePromotions(Array.isArray(promos) ? promos : []);
      } catch (err) {
        console.error('Lỗi khi tải danh sách khuyến mãi:', err);
      }
    };

    fetchCart();
    fetchPromos();
  }, []);

  // Tính toán Tạm tính
  const subtotal = useMemo(() => {
    if (!cart?.items || !Array.isArray(cart.items)) return 0;
    return cart.items.reduce((sum, item) => {
      const qty = Number(item.soluong || 1);
      const unitPrice = Number(
        item.don_gia || item.sanpham?.giakhuyenmai || item.sanpham?.gia || 0
      );
      return sum + qty * unitPrice;
    }, 0);
  }, [cart.items]);

  // Phí ship: Mặc định theo chính sách
  const shippingFee = 0;

  // Tính số tiền được giảm từ khuyến mãi
  const discountAmount = useMemo(() => {
    if (!appliedPromotion || subtotal <= 0) return 0;
    if (appliedPromotion.loaigiam === 'phantram') {
      let giam = (subtotal * Number(appliedPromotion.giatri)) / 100;
      if (
        appliedPromotion.giamtoida &&
        Number(appliedPromotion.giamtoida) > 0 &&
        giam > Number(appliedPromotion.giamtoida)
      ) {
        giam = Number(appliedPromotion.giamtoida);
      }
      return Math.min(giam, subtotal);
    }
    return Math.min(Number(appliedPromotion.giatri || 0), subtotal);
  }, [appliedPromotion, subtotal]);

  // Tổng cộng cuối cùng sau khi trừ khuyến mãi
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  // Tự động kiểm tra nếu giá trị giỏ hàng giảm xuống dưới mức tối thiểu
  useEffect(() => {
    if (
      appliedPromotion &&
      subtotal > 0 &&
      Number(appliedPromotion.giatritoithieu) > subtotal
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Auto detach coupon if minimum total drops.
      setAppliedPromotion(null);
      setPromoSuccess('');
      setPromoError(
        `Mã ${appliedPromotion.ma} đã được gỡ do đơn hàng chưa đạt giá trị tối thiểu ${formatPrice(
          appliedPromotion.giatritoithieu
        )}`
      );
    }
  }, [subtotal, appliedPromotion]);

  // Hàm áp dụng mã khuyến mãi
  const handleApplyPromo = async (codeOverride) => {
    const code = (codeOverride || promoCode).trim().toUpperCase();
    if (!code) {
      setPromoError('Vui lòng nhập mã khuyến mãi');
      setPromoSuccess('');
      return;
    }
    if (subtotal <= 0) {
      setPromoError('Giỏ hàng chưa có sản phẩm để áp dụng mã');
      setPromoSuccess('');
      return;
    }

    setCheckingPromo(true);
    setPromoError('');
    setPromoSuccess('');

    try {
      const res = await checkPromotionCode(code, subtotal);
      if (res.success && res.data) {
        setAppliedPromotion(res.data);
        setPromoCode(code);
        setPromoSuccess(`Áp dụng mã ${code} thành công!`);
        setShowVoucherList(false);
      } else {
        setPromoError(res.message || 'Mã khuyến mãi không hợp lệ');
      }
    } catch (err) {
      console.error('Lỗi kiểm tra khuyến mãi:', err);
      setPromoError(
        err.response?.data?.message ||
          'Mã khuyến mãi không tồn tại, đã hết hạn hoặc không đủ điều kiện'
      );
    } finally {
      setCheckingPromo(false);
    }
  };

  // Hàm gỡ bỏ mã khuyến mãi
  const handleRemovePromo = () => {
    setAppliedPromotion(null);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  // Xử lý thay đổi dữ liệu Form giao hàng
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  // Format số thẻ ngân hàng cách 4 số một lần
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 16);
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardData((prev) => ({ ...prev, cardNumber: value }));
    if (cardErrors.cardNumber) {
      setCardErrors((prev) => ({ ...prev, cardNumber: '' }));
    }
  };

  // Format ngày hết hạn thẻ MM/YY
  const handleExpiryDateChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 3) {
      value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
    }
    setCardData((prev) => ({ ...prev, expiryDate: value }));
    if (cardErrors.expiryDate) {
      setCardErrors((prev) => ({ ...prev, expiryDate: '' }));
    }
  };

  // Xử lý Validate Form
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ và tên người nhận';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Vui lòng nhập số điện thoại liên hệ';
    } else if (!/^[0-9+]{9,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Số điện thoại không đúng định dạng';
    }

    if (formData.email?.trim() && !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.address.trim()) {
      errors.address = 'Vui lòng nhập địa chỉ giao hàng cụ thể';
    }

    setFormErrors(errors);

    // Validate thẻ nếu chọn phương thức thẻ NCB
    const cErrors = {};
    if (paymentMethod === 'TRANSFER' && paymentSubMethod === 'BANK') {
      if (!cardData.cardNumber.trim() || cardData.cardNumber.replace(/\s/g, '').length < 12) {
        cErrors.cardNumber = 'Vui lòng nhập đúng số thẻ (tối thiểu 12 số)';
      }
      if (!cardData.cardHolder.trim()) {
        cErrors.cardHolder = 'Vui lòng nhập tên in trên thẻ';
      }
      if (!cardData.expiryDate.trim() || cardData.expiryDate.length < 5) {
        cErrors.expiryDate = 'Vui lòng nhập ngày hết hạn (MM/YY)';
      }
      if (!cardData.cvv.trim() || cardData.cvv.length < 3) {
        cErrors.cvv = 'CVV gồm 3 hoặc 4 chữ số';
      }
      setCardErrors(cErrors);
    }

    return Object.keys(errors).length === 0 && Object.keys(cErrors).length === 0;
  };

  // Hàm tạo đơn hàng thực tế vào Database qua API
  const executeCheckout = async () => {
    setSubmitting(true);
    setApiError('');

    try {
      // 1. Xác định nhãn thanh toán cho ghi chú đơn hàng
      const subMethodNames = {
        MOMO: 'Ví MoMo',
        PAYPAL: 'PayPal',
        BANK: 'Thẻ NCB (Mockup)',
      };

      const paymentTag =
        paymentMethod === 'TRANSFER'
          ? `[Thanh toán Online: ${subMethodNames[paymentSubMethod] || 'Chuyển khoản'}]`
          : '[Thanh toán tiền mặt: COD]';

      const fullNote = formData.note?.trim()
        ? `${paymentTag} ${formData.note.trim()}`
        : paymentTag;

      // 2. Chuẩn bị payload chuẩn theo yêu cầu của Backend POST /api/checkout
      const checkoutPayload = {
        hoten_nguoinhan: formData.name.trim(),
        sodienthoai: formData.phone.trim(),
        email: formData.email?.trim() || null,
        diachigiaohang: formData.address.trim(),
        // Backend quy định in:tienmat,chuyenkhoan,vnpay
        phuongthucthanhtoan: paymentMethod === 'COD' ? 'tienmat' : 'chuyenkhoan',
        ghichu: fullNote,
        ma_khuyenmai: appliedPromotion?.ma || null,
      };

      console.log('Gửi dữ liệu đặt hàng lên API:', checkoutPayload);

      // 3. Gọi API checkout lưu đơn hàng thực tế vào Database
      const response = await orderService.checkout(checkoutPayload);
      console.log('Kết quả từ Server:', response);

      const createdOrder = response?.data || response;

      // 4. Phát sự kiện cập nhật giỏ hàng để Header cập nhật lại số lượng (về 0)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('cartChange'));
      }

      // Đóng Popup MoMo nếu đang mở & xóa state giỏ hàng cục bộ
      setShowMomoQR(false);
      setCart({ items: [], total: 0 });

      // 5. Lưu trạng thái thành công với mã đơn thực tế từ Database
      setOrderSuccessData({
        orderCode: createdOrder?.madon || `DH-${Date.now()}`,
        customer: {
          name: createdOrder?.hoten_nguoinhan || formData.name,
          phone: createdOrder?.sodienthoai || formData.phone,
          address: createdOrder?.diachigiaohang || formData.address,
        },
        payment: {
          method: paymentMethod,
          subMethod: paymentMethod === 'TRANSFER' ? paymentSubMethod : null,
        },
        pricing: {
          subtotal,
          discount: Number(createdOrder?.tiengiam ?? discountAmount),
          promotionCode: appliedPromotion?.ma || null,
          total: Number(
            createdOrder?.thanhtien || createdOrder?.tongtien || total
          ),
        },
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Lỗi khi gửi yêu cầu đặt hàng:', err);
      const serverMessage =
        err.response?.data?.message ||
        (typeof err.response?.data?.errors === 'object'
          ? Object.values(err.response.data.errors).flat().join(', ')
          : null) ||
        'Không thể xử lý đặt hàng. Vui lòng thử lại sau!';
      setApiError(serverMessage);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  // Xử lý khi nhấn nút "Xác nhận đặt hàng"
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setApiError('');

    if (!cart?.items || cart.items.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm trước khi thanh toán.');
      return;
    }

    if (!validateForm()) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Nếu chọn phương thức ví MoMo: hiển thị Popup mã QR MoMo
    if (paymentMethod === 'TRANSFER' && paymentSubMethod === 'MOMO') {
      setShowMomoQR(true);
      return;
    }

    // Nếu chọn COD, PayPal hoặc Thẻ NCB: Tiếp tục chạy logic tạo đơn hàng ngay
    executeCheckout();
  };

  // Xử lý khi khách bấm "Tôi đã thanh toán" trong Popup MoMo
  const handleConfirmMomoPayment = async () => {
    console.log('Thanh toán MOMO thành công');
    await executeCheckout();
  };

  // Màn hình Loading
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-gray-800">
          Đang chuẩn bị trang thanh toán...
        </h2>
        <p className="text-sm text-gray-400 mt-1">Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  // Màn hình Thông báo Đặt hàng Thành công
  if (orderSuccessData) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-md p-6 sm:p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            Đặt hàng thành công!
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed">
            Đơn hàng của bạn đã được lưu vào hệ thống và đang trong trạng thái chờ xác nhận.
          </p>

          {/* Hộp chi tiết đơn hàng tóm tắt */}
          <div className="bg-gray-50 rounded-xl p-5 mb-8 text-left border border-gray-200/70 text-sm space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-500">Mã đơn hàng:</span>
              <span className="font-bold text-gray-900 font-mono text-base text-yellow-600">
                {orderSuccessData.orderCode}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Người nhận:</span>
              <span className="font-semibold text-gray-800">
                {orderSuccessData.customer.name} ({orderSuccessData.customer.phone})
              </span>
            </div>
            <div className="flex justify-between items-start gap-4">
              <span className="text-gray-500 flex-shrink-0">Địa chỉ giao:</span>
              <span className="font-medium text-gray-800 text-right">
                {orderSuccessData.customer.address}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Phương thức thanh toán:</span>
              <span className="font-semibold text-indigo-700">
                {orderSuccessData.payment.method === 'COD'
                  ? 'Thanh toán khi nhận hàng (COD)'
                  : orderSuccessData.payment.subMethod === 'MOMO'
                  ? 'Ví MoMo'
                  : orderSuccessData.payment.subMethod === 'PAYPAL'
                  ? 'PayPal'
                  : 'Thẻ ngân hàng (NCB)'}
              </span>
            </div>
            {orderSuccessData.pricing.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 font-medium">
                <span>Khuyến mãi ({orderSuccessData.pricing.promotionCode}):</span>
                <span className="font-bold">
                  -{formatPrice(orderSuccessData.pricing.discount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200 text-base">
              <span className="font-bold text-gray-900">Tổng thanh toán:</span>
              <span className="font-extrabold text-red-600 text-lg">
                {formatPrice(orderSuccessData.pricing.total)}
              </span>
            </div>
          </div>

          {/* Nhóm nút điều hướng */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/orders"
              className="w-full sm:w-auto px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-sm transition text-center"
            >
              Xem danh sách đơn hàng
            </Link>
            <Link
              href="/products"
              className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition text-center"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Thanh Điều hướng & Tiêu đề */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/" className="hover:text-gray-800 transition">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/cart" className="hover:text-gray-800 transition">
                Giỏ hàng
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-semibold">Thanh toán</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Thanh toán đơn hàng
            </h1>
          </div>

          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors bg-white px-3.5 py-2 rounded-lg border border-gray-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại giỏ hàng
          </Link>
        </div>

        {/* Cảnh báo lỗi từ Server nếu có */}
        {apiError && (
          <div
            className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm shadow-xs"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
            <span className="flex-1 font-medium">{apiError}</span>
          </div>
        )}

        {/* Cảnh báo giỏ hàng trống */}
        {cart.items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 sm:p-14 text-center max-w-lg mx-auto my-8">
            <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Giỏ hàng của bạn đang trống
            </h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Bạn chưa có sản phẩm nào để tiến hành thanh toán. Vui lòng chọn sản phẩm vào giỏ hàng trước.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-lg shadow-sm transition"
            >
              Khám phá sản phẩm ngay
            </Link>
          </div>
        ) : (
          /* Bố cục 2 cột Desktop (65% / 35%) và 1 cột Mobile (flex-col) */
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* CỘT TRÁI (65%): Form thông tin giao hàng & Chọn phương thức thanh toán */}
            <div className="w-full lg:w-[65%] space-y-8">
              {/* PHẦN 1: THÔNG TIN GIAO HÀNG */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      1. Thông tin giao hàng
                    </h2>
                    <p className="text-xs text-gray-500">
                      Vui lòng nhập địa chỉ nhận hàng chính xác để bưu tá giao tận nơi
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Họ và tên */}
                  <div>
                    <label
                      htmlFor="customer-name"
                      className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                      Họ và tên người nhận <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="customer-name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                          formErrors.name
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-200 focus:border-yellow-400'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-gray-900 transition`}
                      />
                    </div>
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Nhóm Số điện thoại và Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Số điện thoại */}
                    <div>
                      <label
                        htmlFor="customer-phone"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        Số điện thoại liên hệ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          id="customer-phone"
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Ví dụ: 0912345678"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                            formErrors.phone
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-gray-200 focus:border-yellow-400'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-gray-900 transition`}
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formErrors.phone}
                        </p>
                      )}
                    </div>

                    {/* Email (nhận thông báo đơn) */}
                    <div>
                      <label
                        htmlFor="customer-email"
                        className="block text-sm font-semibold text-gray-700 mb-1.5"
                      >
                        Email (Nhận thông báo đơn hàng)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="customer-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="name@example.com"
                          className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                            formErrors.email
                              ? 'border-red-400 focus:ring-red-400'
                              : 'border-gray-200 focus:border-yellow-400'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-gray-900 transition`}
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {formErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Địa chỉ nhận hàng */}
                  <div>
                    <label
                      htmlFor="customer-address"
                      className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                      Địa chỉ nhận hàng (Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành){' '}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <textarea
                        id="customer-address"
                        name="address"
                        rows={2}
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Số 123 đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm bg-white border ${
                          formErrors.address
                            ? 'border-red-400 focus:ring-red-400'
                            : 'border-gray-200 focus:border-yellow-400'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20 text-gray-900 transition resize-none`}
                      />
                    </div>
                    {formErrors.address && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {formErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Ghi chú đơn hàng */}
                  <div>
                    <label
                      htmlFor="customer-note"
                      className="block text-sm font-semibold text-gray-700 mb-1.5"
                    >
                      Ghi chú đơn hàng (Tùy chọn)
                    </label>
                    <div className="relative">
                      <div className="absolute top-3 left-3.5 pointer-events-none text-gray-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <textarea
                        id="customer-note"
                        name="note"
                        rows={2}
                        value={formData.note}
                        onChange={handleInputChange}
                        placeholder="Ghi chú thêm về giờ giao hàng hoặc hướng dẫn cho shipper..."
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 text-gray-900 transition resize-none"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* PHẦN 2: CHỌN PHƯƠNG THỨC THANH TOÁN */}
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 pb-5 mb-6 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      2. Chọn phương thức thanh toán
                    </h2>
                    <p className="text-xs text-gray-500">
                      Lựa chọn hình thức thanh toán thuận tiện nhất với bạn
                    </p>
                  </div>
                </div>

                {/* Danh sách 2 lựa chọn chính (COD và TRANSFER) */}
                <div className="space-y-4">
                  {/* LỰA CHỌN 1: COD */}
                  <label
                    className={`block relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'COD'
                        ? 'border-yellow-400 bg-yellow-50/30 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="COD"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">
                            Thanh toán khi nhận hàng (COD)
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Thanh toán bằng tiền mặt trực tiếp cho shipper khi nhận hàng
                          </p>
                        </div>
                      </div>

                      {paymentMethod === 'COD' && (
                        <div className="w-6 h-6 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* LỰA CHỌN 2: TRANSFER */}
                  <label
                    className={`block relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'TRANSFER'
                        ? 'border-yellow-400 bg-yellow-50/30 shadow-xs'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="TRANSFER"
                          checked={paymentMethod === 'TRANSFER'}
                          onChange={() => setPaymentMethod('TRANSFER')}
                          className="w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm sm:text-base">
                            Chuyển khoản / Thanh toán Online (TRANSFER)
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Hỗ trợ qua Ví MoMo, PayPal hoặc Thẻ Ngân Hàng NCB
                          </p>
                        </div>
                      </div>

                      {paymentMethod === 'TRANSFER' && (
                        <div className="w-6 h-6 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </label>

                  {/* SUB-OPTIONS FADE-IN KHI CHỌN TRANSFER */}
                  {paymentMethod === 'TRANSFER' && (
                    <div className="mt-4 pt-5 border-t border-gray-100 animate-fadeIn space-y-4 pl-1 sm:pl-3">
                      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        Chọn kênh thanh toán trực tuyến:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. VÍ MOMO */}
                        <div
                          onClick={() => setPaymentSubMethod('MOMO')}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                            paymentSubMethod === 'MOMO'
                              ? 'border-[#A50064] bg-pink-50/50 shadow-xs ring-1 ring-[#A50064]/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#A50064] text-white font-black text-xs flex items-center justify-center shadow-xs mb-2">
                            MoMo
                          </div>
                          <span className="font-bold text-sm text-gray-900">Ví MoMo</span>
                          <span className="text-[11px] text-[#A50064] font-medium mt-0.5">
                            Quét mã QR tiện lợi
                          </span>
                        </div>

                        {/* 2. PAYPAL */}
                        <div
                          onClick={() => setPaymentSubMethod('PAYPAL')}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                            paymentSubMethod === 'PAYPAL'
                              ? 'border-[#003087] bg-blue-50/50 shadow-xs ring-1 ring-[#003087]/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-[#003087] text-white font-bold text-xs flex items-center justify-center shadow-xs mb-2 italic">
                            PayPal
                          </div>
                          <span className="font-bold text-sm text-gray-900">PayPal</span>
                          <span className="text-[11px] text-blue-700 font-medium mt-0.5">
                            Quốc tế an toàn
                          </span>
                        </div>

                        {/* 3. THẺ NGÂN HÀNG (NCB) */}
                        <div
                          onClick={() => setPaymentSubMethod('BANK')}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                            paymentSubMethod === 'BANK'
                              ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600/20'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-900 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs mb-2">
                            NCB
                          </div>
                          <span className="font-bold text-sm text-gray-900">
                            Thẻ NCB
                          </span>
                          <span className="text-[11px] text-indigo-700 font-medium mt-0.5">
                            ATM & Thẻ Quốc tế
                          </span>
                        </div>
                      </div>

                      {/* Chi tiết cho ví MoMo */}
                      {paymentSubMethod === 'MOMO' && (
                        <div className="p-4 bg-pink-50/60 border border-pink-200 rounded-xl text-xs text-gray-700 flex items-start gap-3 mt-3">
                          <div className="w-7 h-7 rounded-full bg-[#A50064] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            M
                          </div>
                          <div className="leading-relaxed">
                            <p className="font-bold text-[#A50064] text-sm">
                              Thanh toán qua Ví điện tử MoMo
                            </p>
                            <p className="mt-0.5">
                              Khi nhấn &quot;Xác nhận đặt hàng&quot;, hệ thống sẽ hiển thị mã QR MoMo của tài khoản nhận tiền để bạn quét và hoàn tất thanh toán.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Chi tiết cho PayPal */}
                      {paymentSubMethod === 'PAYPAL' && (
                        <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-xs text-gray-700 flex items-start gap-3 mt-3">
                          <div className="w-7 h-7 rounded-full bg-[#003087] text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            P
                          </div>
                          <div className="leading-relaxed">
                            <p className="font-bold text-[#003087] text-sm">
                              Thanh toán qua cổng PayPal
                            </p>
                            <p className="mt-0.5">
                              Chấp nhận thanh toán bằng tài khoản PayPal, thẻ Visa, MasterCard toàn cầu với tiêu chuẩn bảo mật quốc tế.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* FORM MOCKUP THẺ NGÂN HÀNG (NCB) */}
                      {paymentSubMethod === 'BANK' && (
                        <div className="mt-4 p-5 sm:p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-indigo-600" />
                              <span className="font-bold text-sm text-gray-900">
                                Cổng thanh toán thẻ Quốc Dân (NCB Bank Mockup)
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              Bảo mật PCI-DSS
                            </span>
                          </div>

                          {/* THIẾT KẾ MOCKUP CARD TRỰC QUAN */}
                          <div className="max-w-sm mx-auto bg-gradient-to-r from-blue-900 via-indigo-800 to-slate-900 text-white rounded-xl p-5 shadow-md relative overflow-hidden select-none">
                            <div className="flex justify-between items-start mb-6">
                              <div className="font-black text-lg tracking-wider text-yellow-400">
                                NCB
                              </div>
                              <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
                                DEBIT / CREDIT
                              </span>
                            </div>

                            {/* Chip thẻ */}
                            <div className="w-10 h-7 rounded bg-amber-300 border border-amber-400 flex items-center justify-center mb-4 shadow-inner opacity-90">
                              <div className="w-6 h-4 border-t border-b border-amber-600 opacity-60"></div>
                            </div>

                            {/* Số thẻ */}
                            <div className="font-mono text-base sm:text-lg tracking-widest text-slate-100 font-semibold mb-4 drop-shadow">
                              {cardData.cardNumber || '•••• •••• •••• ••••'}
                            </div>

                            <div className="flex justify-between items-end text-xs font-mono">
                              <div>
                                <span className="text-[9px] text-slate-300 block">CARD HOLDER</span>
                                <span className="font-bold uppercase tracking-wider text-slate-100">
                                  {cardData.cardHolder || 'NGUYEN VAN A'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] text-slate-300 block">EXPIRES</span>
                                <span className="font-bold text-slate-100">
                                  {cardData.expiryDate || 'MM/YY'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* CÁC TRƯỜNG NHẬP LIỆU MOCKUP */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            {/* Số thẻ */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Số thẻ in trên mặt thẻ <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <CreditCard className="w-4 h-4" />
                                </div>
                                <input
                                  type="text"
                                  value={cardData.cardNumber}
                                  onChange={handleCardNumberChange}
                                  placeholder="9704 1985 2145 6789"
                                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                                    cardErrors.cardNumber ? 'border-red-400' : 'border-gray-300'
                                  } rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 font-mono`}
                                />
                              </div>
                              {cardErrors.cardNumber && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {cardErrors.cardNumber}
                                </p>
                              )}
                            </div>

                            {/* Tên chủ thẻ */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Tên in trên thẻ (không dấu) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <User className="w-4 h-4" />
                                </div>
                                <input
                                  type="text"
                                  value={cardData.cardHolder}
                                  onChange={(e) =>
                                    setCardData((prev) => ({
                                      ...prev,
                                      cardHolder: e.target.value.toUpperCase(),
                                    }))
                                  }
                                  placeholder="NGUYEN VAN A"
                                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                                    cardErrors.cardHolder ? 'border-red-400' : 'border-gray-300'
                                  } rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 font-mono uppercase`}
                                />
                              </div>
                              {cardErrors.cardHolder && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {cardErrors.cardHolder}
                                </p>
                              )}
                            </div>

                            {/* Ngày hết hạn */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Ngày hết hạn (MM/YY) <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                </div>
                                <input
                                  type="text"
                                  value={cardData.expiryDate}
                                  onChange={handleExpiryDateChange}
                                  placeholder="MM/YY"
                                  maxLength={5}
                                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                                    cardErrors.expiryDate ? 'border-red-400' : 'border-gray-300'
                                  } rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 font-mono`}
                                />
                              </div>
                              {cardErrors.expiryDate && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {cardErrors.expiryDate}
                                </p>
                              )}
                            </div>

                            {/* CVV / CVC */}
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Mã bảo mật CVV <span className="text-red-500">*</span>
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                  <Lock className="w-4 h-4" />
                                </div>
                                <input
                                  type="password"
                                  value={cardData.cvv}
                                  onChange={(e) =>
                                    setCardData((prev) => ({
                                      ...prev,
                                      cvv: e.target.value.replace(/\D/g, '').substring(0, 4),
                                    }))
                                  }
                                  placeholder="***"
                                  maxLength={4}
                                  className={`w-full pl-9 pr-3 py-2 text-sm bg-white border ${
                                    cardErrors.cvv ? 'border-red-400' : 'border-gray-300'
                                  } rounded-lg focus:outline-none focus:border-indigo-500 text-gray-900 font-mono`}
                                />
                              </div>
                              {cardErrors.cvv && (
                                <p className="text-[11px] text-red-500 mt-1">
                                  {cardErrors.cvv}
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-[11px] text-gray-400 italic">
                            * Lưu ý: Form thẻ chỉ mô phỏng kiểm thử giao diện thanh toán bảo mật. Đơn hàng sẽ được tạo và cập nhật vào hệ thống.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* CỘT PHẢI (35%): Khung Tóm tắt đơn hàng (Order Summary) - Sticky & Shadow */}
            <div className="w-full lg:w-[35%] sticky top-24 space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-7">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900">
                    Tóm tắt đơn hàng
                  </h2>
                  <span className="text-xs bg-gray-100 font-semibold px-2.5 py-1 rounded-full text-gray-700">
                    {cart.items.length} sản phẩm
                  </span>
                </div>

                {/* Danh sách sản phẩm thu gọn từ giỏ hàng */}
                <div className="py-4 divide-y divide-gray-100 max-h-[300px] overflow-y-auto pr-1">
                  {cart.items.map((item) => {
                    const qty = Number(item.soluong || 1);
                    const unitPrice = Number(
                      item.don_gia ||
                        item.sanpham?.giakhuyenmai ||
                        item.sanpham?.gia ||
                        0
                    );
                    const itemTotal = Number(item.thanh_tien) || qty * unitPrice;

                    return (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center gap-3"
                      >
                        {/* Ảnh thu nhỏ */}
                        <div className="w-14 h-14 rounded-md bg-gray-100 border border-gray-200/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <img
                            src={getImageUrl(
                              item.sanpham?.hinhanh ||
                                item.sanpham?.sanpham_hinhanh
                            )}
                            alt={item.sanpham?.ten || 'Sản phẩm'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/placeholder.png';
                            }}
                          />
                        </div>

                        {/* Tên & Số lượng x Đơn giá */}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-xs font-semibold text-gray-900 line-clamp-1">
                            {item.sanpham?.ten || 'Sản phẩm'}
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Số lượng: <span className="font-medium text-gray-800">{qty}</span>
                          </p>
                          <p className="text-xs font-bold text-red-600 mt-0.5">
                            {formatPrice(itemTotal)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Phần Mã Khuyến Mãi / Voucher */}
                <div className="py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Ticket className="w-4 h-4 text-amber-500" />
                      Mã khuyến mãi
                    </span>
                    {availablePromotions.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowVoucherList(!showVoucherList)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <span>{showVoucherList ? 'Ẩn mã có sẵn' : `Xem mã có sẵn (${availablePromotions.length})`}</span>
                        {showVoucherList ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Input nhập mã */}
                  {!appliedPromotion ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Nhập mã ưu đãi..."
                          value={promoCode}
                          onChange={(e) => {
                            setPromoCode(e.target.value.toUpperCase().replace(/\s+/g, ''));
                            if (promoError) setPromoError('');
                          }}
                          className="w-full px-3 py-2 text-xs uppercase font-mono tracking-wider border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyPromo()}
                        disabled={checkingPromo || !promoCode.trim()}
                        className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {checkingPromo ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          'Áp dụng'
                        )}
                      </button>
                    </div>
                  ) : (
                    /* Thẻ mã đã áp dụng */
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs text-emerald-800 bg-emerald-200/60 px-1.5 py-0.5 rounded">
                              {appliedPromotion.ma}
                            </span>
                            <span className="text-xs font-semibold text-emerald-700">
                              -{formatPrice(discountAmount)}
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-600 line-clamp-1 mt-0.5">
                            {appliedPromotion.ten}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePromo}
                        title="Bỏ mã khuyến mãi"
                        className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Thông báo lỗi mã */}
                  {promoError && (
                    <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{promoError}</span>
                    </p>
                  )}

                  {/* Thông báo thành công */}
                  {promoSuccess && !promoError && (
                    <p className="text-xs text-emerald-600 mt-2 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{promoSuccess}</span>
                    </p>
                  )}

                  {/* Danh sách mã có sẵn (Expandable) */}
                  {showVoucherList && availablePromotions.length > 0 && (
                    <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                      {availablePromotions.map((item) => {
                        const isSelected = appliedPromotion?.ma === item.ma;
                        const isEligible = subtotal >= Number(item.giatritoithieu || 0);

                        return (
                          <div
                            key={item.id}
                            className={`p-2.5 rounded-lg border text-xs transition-all ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : isEligible
                                ? 'border-gray-200 bg-gray-50 hover:border-gray-300'
                                : 'border-dashed border-gray-200 bg-gray-50/50 opacity-60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono font-bold text-blue-700 bg-blue-100/60 px-1.5 py-0.5 rounded">
                                {item.ma}
                              </span>
                              <span className="font-bold text-red-600">
                                {item.loaigiam === 'phantram'
                                  ? `Giảm ${item.giatri}%`
                                  : `Giảm ${formatPrice(item.giatri)}`}
                              </span>
                            </div>
                            <p className="font-medium text-gray-700 mb-1 line-clamp-1">
                              {item.ten}
                            </p>
                            <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                              <span>
                                {Number(item.giatritoithieu) > 0
                                  ? `Đơn từ ${formatPrice(item.giatritoithieu)}`
                                  : 'Mọi đơn hàng'}
                              </span>
                              {isSelected ? (
                                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Đang dùng
                                </span>
                              ) : isEligible ? (
                                <button
                                  type="button"
                                  onClick={() => handleApplyPromo(item.ma)}
                                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                                >
                                  Dùng ngay
                                </button>
                              ) : (
                                <span className="text-gray-400">
                                  Chưa đủ điều kiện
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Các khoản tính tiền */}
                <div className="py-4 space-y-3 text-sm text-gray-600 border-t border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-emerald-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Tag className="w-3.5 h-3.5" />
                        Giảm giá ({appliedPromotion?.ma})
                      </span>
                      <span className="font-bold">
                        -{formatPrice(discountAmount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-green-600">
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Phương thức đã chọn</span>
                    <span className="font-semibold text-gray-800">
                      {paymentMethod === 'COD'
                        ? 'COD'
                        : `Online (${paymentSubMethod})`}
                    </span>
                  </div>
                </div>

                {/* Tổng tiền thanh toán */}
                <div className="pt-4 pb-6 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-gray-900 block">
                      Tổng thanh toán
                    </span>
                    <span className="text-[11px] text-gray-400">
                      (Đã bao gồm thuế GTGT nếu có)
                    </span>
                  </div>
                  <span className="text-2xl font-black text-red-600">
                    {formatPrice(total)}
                  </span>
                </div>

                {/* Nút "Xác nhận đặt hàng" */}
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={submitting || cart.items.length === 0}
                  className="w-full py-4 px-6 bg-[#FFCC00] hover:bg-yellow-500 active:bg-yellow-600 text-gray-900 font-bold text-base rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang tạo đơn hàng...</span>
                    </>
                  ) : (
                    <span>Xác nhận đặt hàng</span>
                  )}
                </button>

                {/* Cam kết & An tâm mua sắm */}
                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Bảo mật thông tin khách hàng tuyệt đối</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Kiểm tra hàng trước khi thanh toán (COD)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL POPUP QR MOMO (Hiển thị khi showMomoQR === true) */}
      {showMomoQR && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget && !submitting) {
              setShowMomoQR(false);
            }
          }}
        >
          {/* Card Modal chính: Nền hồng nhạt #FCE4EC, bo góc rounded-3xl, đổ bóng shadow-2xl */}
          <div className="relative bg-[#FCE4EC] border border-pink-200 rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 text-center shadow-2xl my-auto animate-fadeIn select-none">
            {/* Nút đóng góc phải */}
            <button
              type="button"
              onClick={() => setShowMomoQR(false)}
              disabled={submitting}
              className="absolute top-4 right-4 p-2 rounded-full text-pink-700/70 hover:text-pink-900 hover:bg-pink-200/50 transition cursor-pointer disabled:opacity-40"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 1. Phần Logo MoMo ở trên cùng */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#AE2070] text-white flex flex-col items-center justify-center shadow-md select-none font-black leading-none py-1">
                <span className="text-sm tracking-tighter">mo</span>
                <span className="text-sm tracking-tighter">mo</span>
              </div>
              <h3 className="text-[#AE2070] font-black text-xl tracking-tight mt-2">
                Ví MoMo
              </h3>
              <p className="text-xs text-pink-700/80 font-medium mt-0.5">
                Quét mã QR để thanh toán đơn hàng
              </p>
            </div>

            {/* 2. Khu vực QR Code: Thẻ div nền trắng bg-white, rounded-xl, viền hồng nhạt */}
            <div className="bg-white rounded-xl border-2 border-pink-200 p-3 shadow-xs inline-block mx-auto mb-4">
              <img
                src="/momo.jpg"
                alt="Momo QR"
                className="w-64 h-64 object-contain mx-auto rounded-lg"
              />
            </div>

            {/* 3. Thông tin tài khoản thụ hưởng */}
            <div className="space-y-1">
              <h4 className="font-bold text-gray-800 text-xl tracking-wide uppercase">
                NGUYEN QUOC VUONG
              </h4>
              <p className="text-sm text-gray-600 font-mono tracking-wider">
                *******898
              </p>
              <div className="pt-2 text-sm text-pink-900">
                <span>Số tiền thanh toán: </span>
                <strong className="text-lg font-extrabold text-[#AE2070]">
                  {formatPrice(total)}
                </strong>
              </div>
            </div>

            {/* 4. Cụm nút thao tác */}
            <div className="mt-6 flex items-center gap-3">
              {/* Nút Hủy / Đóng */}
              <button
                type="button"
                onClick={() => setShowMomoQR(false)}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl border border-pink-300 hover:bg-pink-100/60 text-pink-800 font-semibold text-sm transition cursor-pointer disabled:opacity-50"
              >
                Hủy / Đóng
              </button>

              {/* Nút Tôi đã thanh toán */}
              <button
                type="button"
                onClick={handleConfirmMomoPayment}
                disabled={submitting}
                className="flex-1 py-3 px-4 rounded-xl bg-[#AE2070] hover:bg-[#92185c] active:scale-[0.98] text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <span>Tôi đã thanh toán</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
