<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GioHang;
use App\Models\DonHang;
use App\Models\ChiTietDonHang;
use App\Models\LichSuDonHang;
use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Mail\OrderPlacedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
class CheckoutController extends Controller
{
    /**
     * Lấy user nếu đang đăng nhập.
     *
     * Checkout vẫn cho phép khách chưa đăng nhập.
     */
    private function getUser()
    {
        return auth('sanctum')->user();
    }

    /**
     * Lấy giỏ hàng hiện tại.
     *
     * Thành viên:
     *     dùng nguoidung_id
     *
     * Khách:
     *     dùng X-Session-ID
     */
    private function getCart(Request $request)
    {
        $user = $this->getUser();

        // =========================
        // THÀNH VIÊN
        // =========================

        if ($user) {

            $cart = GioHang::where(
                'nguoidung_id',
                $user->id
            )->first();

            return [
                'cart' => $cart,
                'session_id' => null,
            ];
        }

        // =========================
        // KHÁCH
        // =========================

        $sessionId = $request->header('X-Session-ID');

        if (!$sessionId) {
            return [
                'cart' => null,
                'session_id' => null,
            ];
        }

        $cart = GioHang::where(
            'session_id',
            $sessionId
        )->first();

        return [
            'cart' => $cart,
            'session_id' => $sessionId,
        ];
    }

    /**
     * Tạo mã đơn hàng duy nhất.
     *
     * Ví dụ:
     * DH20261005A8F31C
     */
    private function generateOrderCode()
    {
        do {
            $madon = 'DH'
                . now()->format('Ymd')
                . strtoupper(Str::random(6));
        } while (
            DonHang::where('madon', $madon)->exists()
        );

        return $madon;
    }

    /**
     * POST /api/checkout
     *
     * Tạo đơn hàng từ Cart.
     */
    public function store(Request $request)
    {
        // ==========================================
        // VALIDATE THÔNG TIN CHECKOUT
        // ==========================================

        $validated = $request->validate([
            'hoten_nguoinhan' => [
                'required',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
            ],

            'diachigiaohang' => [
                'required',
                'string',
            ],

            'sodienthoai' => [
                'required',
                'string',
                'max:20',
            ],

            'phuongthucthanhtoan' => [
                'required',
                'in:tienmat,chuyenkhoan,vnpay',
            ],

            'ghichu' => [
                'nullable',
                'string',
                'max:1000',
            ],

            'ma_khuyenmai' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        // ==========================================
        // LẤY USER / CART
        // ==========================================

        $user = $this->getUser();

        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy giỏ hàng',
            ], 404);
        }

        // ==========================================
        // LẤY CÁC ITEM TRONG CART
        // ==========================================

        $cart->load([
            'chitiet.sanpham'
        ]);

        if ($cart->chitiet->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Giỏ hàng đang trống',
            ], 400);
        }

        // ==========================================
        // TRANSACTION
        // ==========================================

        $order = DB::transaction(function () use (
            $cart,
            $user,
            $validated
        ) {

            $tongTien = 0;

            $orderItems = [];

            // ==========================================
            // KIỂM TRA + KHÓA TỒN KHO
            // ==========================================

            foreach ($cart->chitiet as $cartItem) {

                $sanPham = DB::table('sanpham')
                    ->where('id', $cartItem->sanpham_id)
                    ->lockForUpdate()
                    ->first();

                // Sản phẩm đã bị xóa
                if (!$sanPham) {
                    throw new \Exception(
                        "Sản phẩm #{$cartItem->sanpham_id} không còn tồn tại"
                    );
                }

                // Sản phẩm bị ẩn
                if ($sanPham->trangthai !== 'hienthi') {
                    throw new \Exception(
                        "Sản phẩm \"{$sanPham->ten}\" hiện không khả dụng"
                    );
                }

                // Kiểm tra tồn kho
                if (
                    $sanPham->soluong < $cartItem->soluong
                ) {
                    throw new \Exception(
                        "Sản phẩm \"{$sanPham->ten}\" không đủ số lượng trong kho"
                    );
                }

                // ==========================================
                // XÁC ĐỊNH GIÁ
                // ==========================================

                $donGia = (
                    $sanPham->giakhuyenmai !== null
                    && $sanPham->giakhuyenmai < $sanPham->gia
                )
                    ? $sanPham->giakhuyenmai
                    : $sanPham->gia;

                $thanhTien =
                    $donGia * $cartItem->soluong;

                $tongTien += $thanhTien;

                // Lưu snapshot sản phẩm
                $orderItems[] = [
                    'sanpham_id' => $sanPham->id,
                    'ten_sanpham' => $sanPham->ten,
                    'soluong' => $cartItem->soluong,
                    'gia' => $donGia,
                    'thanhtien' => $thanhTien,
                ];
            }

            // ==========================================
            // XỬ LÝ MÃ KHUYẾN MÃI (NẾU CÓ)
            // ==========================================

            $khuyenMaiId = null;
            $tienGiam = 0;

            if (!empty($validated['ma_khuyenmai'])) {
                $code = strtoupper(trim($validated['ma_khuyenmai']));
                $km = KhuyenMai::where('ma', $code)->lockForUpdate()->first();

                if (!$km) {
                    throw new \Exception("Mã khuyến mãi \"{$code}\" không tồn tại");
                }

                if ($km->trangthai !== 'hoatdong') {
                    throw new \Exception("Mã khuyến mãi \"{$code}\" hiện đang tạm ngưng sử dụng");
                }

                $now = Carbon::now();
                if ($now->lt($km->ngaybatdau)) {
                    throw new \Exception("Mã khuyến mãi chưa đến thời điểm áp dụng");
                }

                if ($now->gt($km->ngayketthuc)) {
                    throw new \Exception("Mã khuyến mãi đã hết hạn sử dụng");
                }

                if ($km->soluong > 0 && $km->daluotdung >= $km->soluong) {
                    throw new \Exception("Mã khuyến mãi đã hết lượt sử dụng");
                }

                if ($km->giatritoithieu > 0 && $tongTien < $km->giatritoithieu) {
                    throw new \Exception(
                        "Đơn hàng chưa đạt giá trị tối thiểu " . number_format($km->giatritoithieu) . "đ để áp dụng mã này"
                    );
                }

                if ($km->loaigiam === 'phantram') {
                    $tienGiam = ($tongTien * $km->giatri) / 100;
                    if ($km->giamtoida && $km->giamtoida > 0 && $tienGiam > $km->giamtoida) {
                        $tienGiam = $km->giamtoida;
                    }
                } else {
                    $tienGiam = min($km->giatri, $tongTien);
                }

                $khuyenMaiId = $km->id;
                $km->increment('daluotdung');
            }

            $thanhTien = max(0, $tongTien - $tienGiam);

            // ==========================================
            // TẠO ĐƠN HÀNG
            // ==========================================

            $order = DonHang::create([
                'nguoidung_id' => $user
                    ? $user->id
                    : null,

                'khuyenmai_id' => $khuyenMaiId,

                'hoten_nguoinhan' =>
                $validated['hoten_nguoinhan'],

                'email' =>
                $validated['email'] ?? null,

                'madon' =>
                $this->generateOrderCode(),

                'tongtien' =>
                $tongTien,

                'tiengiam' =>
                0,

                'thanhtien' =>
                $tongTien,
                    $tienGiam,

                'thanhtien' =>
                    $thanhTien,

                'diachigiaohang' =>
                $validated['diachigiaohang'],

                'sodienthoai' =>
                $validated['sodienthoai'],

                'phuongthucthanhtoan' =>
                $validated['phuongthucthanhtoan'],

                'trangthai' =>
                'choxacnhan',

                'ghichu' =>
                $validated['ghichu'] ?? null,
            ]);

            // ==========================================
            // TẠO CHI TIẾT ĐƠN HÀNG
            // ==========================================

            foreach ($orderItems as $item) {

                ChiTietDonHang::create([
                    'donhang_id' =>
                    $order->id,

                    'sanpham_id' =>
                    $item['sanpham_id'],

                    'ten_sanpham' =>
                    $item['ten_sanpham'],

                    'soluong' =>
                    $item['soluong'],

                    'gia' =>
                    $item['gia'],

                    'thanhtien' =>
                    $item['thanhtien'],
                ]);

                // ==========================================
                // TRỪ TỒN KHO
                // ==========================================

                DB::table('sanpham')
                    ->where(
                        'id',
                        $item['sanpham_id']
                    )
                    ->decrement(
                        'soluong',
                        $item['soluong']
                    );
            }

            // ==========================================
            // TẠO LỊCH SỬ BAN ĐẦU
            // ==========================================

            LichSuDonHang::create([
                'donhang_id' =>
                $order->id,

                'nguoidung_id' =>
                $user
                    ? $user->id
                    : null,

                'trangthaicu' =>
                null,

                'trangthaimoi' =>
                'choxacnhan',

                'ghichu' =>
                'Đơn hàng được tạo',
            ]);

            // ==========================================
            // XÓA CART
            // ==========================================

            $cart->chitiet()->delete();

            return $order;
        });

        // ==========================================
        // LOAD DỮ LIỆU TRẢ VỀ
        // ==========================================

        $order->load([
            'chitiet',
            'lichsu',
        ]);
        // ==========================================
        // GỬI EMAIL XÁC NHẬN ĐẶT HÀNG
        // ==========================================

        if (!empty($order->email)) {
            try {
                Mail::to($order->email)
                    ->send(new OrderPlacedMail($order));
            } catch (\Throwable $e) {
                // Ghi lỗi nếu gửi email thất bại.
                // Không làm ảnh hưởng đến kết quả đặt hàng.
                Log::error('Gui email xac nhan don hang that bai', [
                    'donhang_id' => $order->id,
                    'email' => $order->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }
        $response = [
            'success' => true,

            'message' =>
            'Đặt hàng thành công',

            'data' => $order,
        ];

        // Guest cần giữ session_id
        if (!$user) {
            $response['session_id'] =
                $sessionId;
        }

        return response()->json(
            $response,
            201
        );
    }
}
