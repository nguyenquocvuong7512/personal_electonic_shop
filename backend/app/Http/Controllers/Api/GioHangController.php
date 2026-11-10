<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GioHang;
use App\Models\ChiTietGioHang;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class GioHangController extends Controller
{
    /**
     * Lấy user đang đăng nhập nếu có.
     *
     * Nếu chưa đăng nhập thì trả về null.
     */
    private function getUser()
    {
        return auth('sanctum')->user();
    }

    /**
     * Lấy hoặc tạo giỏ hàng.
     *
     * Thành viên:
     *     dùng nguoidung_id
     *
     * Khách:
     *     dùng session_id
     */
    private function getCart(Request $request)
    {
        $user = $this->getUser();

        // =========================
        // THÀNH VIÊN ĐÃ ĐĂNG NHẬP
        // =========================
        if ($user) {

            $cart = GioHang::firstOrCreate(
                [
                    'nguoidung_id' => $user->id,
                ],
                [
                    'session_id' => null,
                ]
            );

            return [
                'cart' => $cart,
                'session_id' => null,
            ];
        }

        // =========================
        // KHÁCH CHƯA ĐĂNG NHẬP
        // =========================

        $sessionId = $request->header('X-Session-ID');

        // Nếu khách chưa có session_id
        // thì backend tự tạo
        if (!$sessionId) {
            $sessionId = (string) Str::uuid();
        }

        $cart = GioHang::firstOrCreate(
            [
                'session_id' => $sessionId,
            ],
            [
                'nguoidung_id' => null,
            ]
        );

        return [
            'cart' => $cart,
            'session_id' => $sessionId,
        ];
    }

    /**
     * GET /api/cart
     *
     * Lấy giỏ hàng hiện tại.
     */
    public function index(Request $request)
    {
        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        $cart->load([
            'chitiet.sanpham'
        ]);

        $items = [];
        $total = 0;

        foreach ($cart->chitiet as $item) {

            $sanPham = $item->sanpham;

            if (!$sanPham) {
                continue;
            }

            // Nếu có giá khuyến mãi thì dùng giá khuyến mãi
            $donGia = $sanPham->giakhuyenmai !== null
                ? $sanPham->giakhuyenmai
                : $sanPham->gia;

            $thanhTien = $donGia * $item->soluong;

            $total += $thanhTien;

            $items[] = [
                'id' => $item->id,

                'sanpham' => [
                    'id' => $sanPham->id,
                    'ten' => $sanPham->ten,
                    'slug' => $sanPham->slug,
                    'gia' => $sanPham->gia,
                    'giakhuyenmai' => $sanPham->giakhuyenmai,
                    'hinhanh' => $sanPham->hinhanh,
                    'soluong' => $sanPham->soluong,
                ],

                'soluong' => $item->soluong,
                'don_gia' => $donGia,
                'thanh_tien' => $thanhTien,
            ];
        }

        $response = [
            'success' => true,
            'data' => [
                'id' => $cart->id,
                'items' => $items,
                'total' => $total,
            ],
        ];

        // Chỉ trả session_id cho khách
        if (!$this->getUser()) {
            $response['session_id'] = $sessionId;
        }

        return response()->json($response);
    }

    /**
     * POST /api/cart
     *
     * Thêm sản phẩm vào giỏ hàng.
     */
    public function store(Request $request)
    {
        $request->validate([
            'sanpham_id' => 'required|integer|exists:sanpham,id',
            'soluong' => 'nullable|integer|min:1',
        ]);

        $soLuongThem = $request->input('soluong', 1);

        $sanPham = SanPham::find($request->sanpham_id);

        // Kiểm tra sản phẩm có đang hiển thị
        if ($sanPham->trangthai !== 'hienthi') {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm hiện không khả dụng',
            ], 400);
        }

        // Kiểm tra tồn kho
        if ($sanPham->soluong <= 0) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm đã hết hàng',
            ], 400);
        }

        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        // Tìm sản phẩm đã tồn tại trong giỏ
        $item = ChiTietGioHang::where('giohang_id', $cart->id)
            ->where('sanpham_id', $sanPham->id)
            ->first();

        if ($item) {

            $soLuongMoi = $item->soluong + $soLuongThem;

            if ($soLuongMoi > $sanPham->soluong) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số lượng sản phẩm trong giỏ vượt quá tồn kho',
                    'ton_kho' => $sanPham->soluong,
                    'so_luong_hien_tai' => $item->soluong,
                ], 400);
            }

            $item->update([
                'soluong' => $soLuongMoi,
            ]);

        } else {

            if ($soLuongThem > $sanPham->soluong) {
                return response()->json([
                    'success' => false,
                    'message' => 'Số lượng vượt quá tồn kho',
                    'ton_kho' => $sanPham->soluong,
                ], 400);
            }

            $item = ChiTietGioHang::create([
                'giohang_id' => $cart->id,
                'sanpham_id' => $sanPham->id,
                'soluong' => $soLuongThem,
            ]);
        }

        $item->load('sanpham');

        $response = [
            'success' => true,
            'message' => 'Thêm sản phẩm vào giỏ hàng thành công',
            'data' => $item,
        ];

        // Khách thì trả session_id
        if (!$this->getUser()) {
            $response['session_id'] = $sessionId;
        }

        return response()->json($response, 201);
    }

    /**
     * PUT /api/cart/{id}
     *
     * Cập nhật số lượng một sản phẩm trong giỏ.
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'soluong' => 'required|integer|min:1',
        ]);

        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        $item = ChiTietGioHang::where('id', $id)
            ->where('giohang_id', $cart->id)
            ->with('sanpham')
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng',
            ], 404);
        }

        $sanPham = $item->sanpham;

        if (!$sanPham || $sanPham->trangthai !== 'hienthi') {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm hiện không khả dụng',
            ], 400);
        }

        if ($request->soluong > $sanPham->soluong) {
            return response()->json([
                'success' => false,
                'message' => 'Số lượng vượt quá tồn kho',
                'ton_kho' => $sanPham->soluong,
            ], 400);
        }

        $item->update([
            'soluong' => $request->soluong,
        ]);

        $item->refresh();
        $item->load('sanpham');

        $response = [
            'success' => true,
            'message' => 'Cập nhật giỏ hàng thành công',
            'data' => $item,
        ];

        if (!$this->getUser()) {
            $response['session_id'] = $sessionId;
        }

        return response()->json($response);
    }

    /**
     * DELETE /api/cart/{id}
     *
     * Xóa một sản phẩm khỏi giỏ.
     */
    public function destroy(Request $request, $id)
    {
        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        $item = ChiTietGioHang::where('id', $id)
            ->where('giohang_id', $cart->id)
            ->first();

        if (!$item) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong giỏ hàng',
            ], 404);
        }

        $item->delete();

        $response = [
            'success' => true,
            'message' => 'Xóa sản phẩm khỏi giỏ hàng thành công',
        ];

        if (!$this->getUser()) {
            $response['session_id'] = $sessionId;
        }

        return response()->json($response);
    }

    /**
     * DELETE /api/cart
     *
     * Xóa toàn bộ giỏ hàng.
     */
    public function clear(Request $request)
    {
        $result = $this->getCart($request);

        $cart = $result['cart'];
        $sessionId = $result['session_id'];

        ChiTietGioHang::where('giohang_id', $cart->id)->delete();

        $response = [
            'success' => true,
            'message' => 'Đã xóa toàn bộ giỏ hàng',
        ];

        if (!$this->getUser()) {
            $response['session_id'] = $sessionId;
        }

        return response()->json($response);
    }
}