<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\SanPhamController;
use App\Http\Controllers\Api\DanhMucController;
use App\Http\Controllers\Api\ThuongHieuController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GioHangController;
use App\Http\Controllers\Api\NguoiDungController;
use App\Http\Controllers\Api\DonHangController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\BaiVietController;
use App\Http\Controllers\Api\KhuyenMaiController;
use App\Http\Controllers\api\ChuDeBaiVietController;
use App\Http\Controllers\Api\ChatbotController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/users', function () {
    return response()->json([
        'message' => 'API hoạt động',
    ]);
});

// ==================== login & password reset ====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
// Route bảo vệ (BẮT BUỘC có Bearer Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
// ==================== ADMIN LOGIN ====================

Route::post('/admin/login', [AuthController::class, 'adminLogin']);

// ==================== ADMIN ROUTE ====================

Route::middleware(['auth:sanctum', 'is.admin'])->group(function () {

    // Test admin
    Route::get('/admin/test', function () {
        return response()->json([
            'message' => 'Admin truy cập thành công',
        ]);
    });


    // ==================== QUẢN LÝ ĐƠN HÀNG ====================

    // FUNC-ADM-ORDER-01
    // Danh sách đơn hàng
    Route::get(
        '/admin/orders',
        [DonHangController::class, 'index']
    );


    // FUNC-ADM-ORDER-02
    // Chi tiết đơn hàng
    Route::get(
        '/admin/orders/{id}',
        [DonHangController::class, 'show']
    );


    // FUNC-ADM-ORDER-03
    // Cập nhật trạng thái
    Route::patch(
        '/admin/orders/{id}/status',
        [DonHangController::class, 'updateStatus']
    );


    // FUNC-ADM-ORDER-04
    // Hủy đơn
    Route::patch(
        '/admin/orders/{id}/cancel',
        [DonHangController::class, 'cancel']
    );

    // ==================== QUẢN LÝ KHUYẾN MÃI ====================
    Route::prefix('admin/khuyen-mai')->group(function () {
        Route::get('/', [KhuyenMaiController::class, 'index']);
        Route::post('/', [KhuyenMaiController::class, 'store']);
        Route::get('/{id}', [KhuyenMaiController::class, 'show']);
        Route::put('/{id}', [KhuyenMaiController::class, 'update']);
        Route::delete('/{id}', [KhuyenMaiController::class, 'destroy']);
    });
});

// Khách hàng tra cứu và kiểm tra mã khuyến mãi
Route::get('/khuyen-mai/active', [KhuyenMaiController::class, 'getActivePromotions']);
Route::post('/khuyen-mai/check', [KhuyenMaiController::class, 'check']);

// ==================== SAN PHAM ====================
// API quản trị: chỉ Admin đã đăng nhập được thao tác

Route::middleware(['auth:sanctum', 'is.admin'])
    ->prefix('san-pham')
    ->group(function () {
        // Thêm, sửa và xóa tạm sản phẩm
        Route::post('/', [SanPhamController::class, 'store']);
        Route::put('/{id}', [SanPhamController::class, 'update']);
        Route::patch('/{id}', [SanPhamController::class, 'update']);
        Route::delete('/{id}', [SanPhamController::class, 'destroy']);
        // Quản lý thùng rác: đặt route tĩnh trước route có {id}
        Route::get('/thung-rac', [SanPhamController::class, 'trashed']);
        Route::patch('/{id}/restore', [SanPhamController::class, 'restore']);
        Route::delete('/{id}/force-delete', [SanPhamController::class, 'forceDelete']);
    });
// API công khai: khách hàng được xem sản phẩm
Route::prefix('san-pham')->group(function () {
    Route::get('/', [SanPhamController::class, 'index']);
    Route::get('/slug/{slug}', [SanPhamController::class, 'showBySlug']);
    Route::get('/{id}', [SanPhamController::class, 'show']);
    Route::get('/{id}/lien-quan', [SanPhamController::class, 'related']);
});




// ==================== DANH MUC ====================
Route::prefix('danh-muc')->group(function () {
    Route::get('/', [DanhMucController::class, 'index']);
    Route::patch('/{id}/restore', [DanhMucController::class, 'restore']);
    Route::delete('/{id}/force', [DanhMucController::class, 'forceDestroy']);
    Route::get('/{id}', [DanhMucController::class, 'show']);

    Route::post('/', [DanhMucController::class, 'store']);
    Route::put('/{id}', [DanhMucController::class, 'update']);
    Route::patch('/{id}', [DanhMucController::class, 'update']);
    Route::delete('/{id}', [DanhMucController::class, 'destroy']);
});
// ==================== THUONG HIEU ====================
Route::prefix('thuong-hieu')->group(function () {
    Route::get('/', [ThuongHieuController::class, 'index']);
    Route::get('/slug/{slug}', [ThuongHieuController::class, 'showBySlug']);
    Route::patch('/{id}/restore', [ThuongHieuController::class, 'restore']);
    Route::delete('/{id}/force', [ThuongHieuController::class, 'forceDestroy']);
    Route::get('/{id}', [ThuongHieuController::class, 'show']);

    Route::post('/', [ThuongHieuController::class, 'store']);
    Route::put('/{id}', [ThuongHieuController::class, 'update']);
    Route::patch('/{id}', [ThuongHieuController::class, 'update']);
    Route::delete('/{id}', [ThuongHieuController::class, 'destroy']);
});
// ==================== GIỎ HÀNG ====================

Route::prefix('cart')->group(function () {

    // Xem giỏ hàng
    Route::get('/', [GioHangController::class, 'index']);

    // Thêm sản phẩm
    Route::post('/', [GioHangController::class, 'store']);

    // Cập nhật số lượng
    Route::put('/{id}', [GioHangController::class, 'update']);

    // Xóa một sản phẩm
    Route::delete('/{id}', [GioHangController::class, 'destroy']);

    // Xóa toàn bộ giỏ
    Route::delete('/', [GioHangController::class, 'clear']);
});

Route::middleware(['auth:sanctum', 'is.admin'])->group(function () {
    // ==================== QUAN LY NGUOI DUNG ====================

    Route::prefix('nguoi-dung')->group(function () {

        // Danh sach nguoi dung
        Route::get('/', [NguoiDungController::class, 'index']);
        Route::post('/', [NguoiDungController::class, 'store']);
        Route::get('/trash', [NguoiDungController::class, 'trash']);
        Route::patch('/{id}/restore', [NguoiDungController::class, 'restore']);
        Route::get('/{id}', [NguoiDungController::class, 'show']);
        Route::put('/{id}', [NguoiDungController::class, 'update']);
        Route::delete('/{id}/force-delete', [NguoiDungController::class, 'forceDelete']);
        Route::delete('/{id}', [NguoiDungController::class, 'destroy']);
    });
});

// ==================== CHECKOUT ====================

Route::post(
    '/checkout',
    [CheckoutController::class, 'store']
);

// ==================== ĐƠN HÀNG KHÁCH HÀNG / SHOP ====================
Route::get('/orders', [DonHangController::class, 'userOrders']);
Route::get('/orders/{id}', [DonHangController::class, 'userOrderDetail']);
Route::patch('/orders/{id}/cancel', [DonHangController::class, 'userCancel']);

// ==================== BAI VIET ====================

// FUNC-POST-U-01: Danh sách bài viết và lọc theo chủ đề
Route::get('/bai-viet', [BaiVietController::class, 'index']);
// Lấy danh sách chủ đề bài viết
Route::get('/chu-de-bai-viet', [BaiVietController::class, 'topics']);
// FUNC-POST-U-02: Chi tiết bài viết theo slug
Route::get('/bai-viet/slug/{slug}', [BaiVietController::class, 'showBySlug']);
// ==========================================
// API QUẢN LÝ BÀI VIẾT - ADMIN
// ==========================================

Route::middleware(['auth:sanctum', 'is.admin'])
    ->prefix('admin/bai-viet')
    ->group(function () {

        // Danh sách bài viết
        Route::get('/', [BaiVietController::class, 'adminIndex']);

        // Thùng rác - đặt trước route {id}
        Route::get('/thung-rac', [BaiVietController::class, 'trashed']);

        // Thêm bài viết
        Route::post('/', [BaiVietController::class, 'store']);

        // Xem chi tiết bài viết
        Route::get('/{id}', [BaiVietController::class, 'adminShow']);

        // Cập nhật bài viết
        Route::put('/{id}', [BaiVietController::class, 'update']);
        Route::patch('/{id}', [BaiVietController::class, 'update']);

        // Xóa mềm bài viết
        Route::delete('/{id}', [BaiVietController::class, 'destroy']);

        // Khôi phục bài viết
        Route::patch('/{id}/restore', [BaiVietController::class, 'restore']);

        // Xóa vĩnh viễn
        Route::delete('/{id}/force-delete', [BaiVietController::class, 'forceDelete']);
    });
// ==================== QUAN LY CHU DE BAI VIET ====================

Route::middleware(['auth:sanctum', 'is.admin'])
    ->prefix('admin/chu-de-bai-viet')
    ->group(function () {
        Route::get('/', [ChuDeBaiVietController::class, 'index']);
        Route::post('/', [ChuDeBaiVietController::class, 'store']);

        // Thùng rác phải đặt trước route {id}
        Route::get('/thung-rac', [ChuDeBaiVietController::class, 'trashed']);

        Route::patch('/{id}/restore', [ChuDeBaiVietController::class, 'restore']);
        Route::delete('/{id}/force-delete', [ChuDeBaiVietController::class, 'forceDelete']);

        Route::get('/{id}', [ChuDeBaiVietController::class, 'show']);
        Route::put('/{id}', [ChuDeBaiVietController::class, 'update']);
        Route::delete('/{id}', [ChuDeBaiVietController::class, 'destroy']);
    });

// ==================== CHATBOT TƯ VẤN BÁN HÀNG ====================
Route::prefix('chatbot')->group(function () {
    Route::get('/policies', [ChatbotController::class, 'policies']);
    Route::post('/compare', [ChatbotController::class, 'compare']);
    Route::get('/stock', [ChatbotController::class, 'checkStock']);
    Route::get('/consult', [ChatbotController::class, 'consult']);
});

