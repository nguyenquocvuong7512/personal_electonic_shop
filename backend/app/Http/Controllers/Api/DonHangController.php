<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DonHang;
use App\Models\LichSuDonHang;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Mail\OrderConfirmedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
class DonHangController extends Controller
{
    /**
     * =========================================================
     * FUNC-ADM-ORDER-01
     * GET /api/admin/orders
     *
     * Xem danh sách đơn hàng
     *
     * Hỗ trợ:
     * - Lọc trạng thái
     * - Lọc khoảng thời gian
     * - Tìm mã đơn
     * - Tìm tên khách hàng
     * =========================================================
     */
    public function index(Request $request)
    {
        $query = DonHang::with('nguoidung');

        // =========================
        // LỌC TRẠNG THÁI
        // =========================

        if ($request->filled('trangthai')) {
            $request->validate([
                'trangthai' => [
                    'in:choxacnhan,daxacnhan,danggiao,hoantat,dahuy'
                ],
            ]);

            $query->where(
                'trangthai',
                $request->trangthai
            );
        }

        // =========================
        // TÌM KIẾM
        // mã đơn / tên khách
        // =========================

        if ($request->filled('search')) {
            $search = trim($request->search);

            $query->where(function ($q) use ($search) {

                $q->where(
                    'madon',
                    'like',
                    '%' . $search . '%'
                );

                $q->orWhere(
                    'hoten_nguoinhan',
                    'like',
                    '%' . $search . '%'
                );

                $q->orWhereHas(
                    'nguoidung',
                    function ($userQuery) use ($search) {
                        $userQuery->where(
                            'ten',
                            'like',
                            '%' . $search . '%'
                        );
                    }
                );
            });
        }

        // =========================
        // TỪ NGÀY
        // =========================

        if ($request->filled('from_date')) {
            $request->validate([
                'from_date' => 'date',
            ]);

            $query->whereDate(
                'created_at',
                '>=',
                $request->from_date
            );
        }

        // =========================
        // ĐẾN NGÀY
        // =========================

        if ($request->filled('to_date')) {
            $request->validate([
                'to_date' => 'date',
            ]);

            $query->whereDate(
                'created_at',
                '<=',
                $request->to_date
            );
        }

        // Mới nhất trước
        $query->orderBy(
            'created_at',
            'desc'
        );

        // =========================
        // PHÂN TRANG
        // =========================

        $perPage = (int) $request->input(
            'per_page',
            10
        );

        $perPage = max(
            1,
            min($perPage, 100)
        );

        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đơn hàng thành công',
            'data' => $orders,
        ]);
    }


    /**
     * =========================================================
     * FUNC-ADM-ORDER-02
     * GET /api/admin/orders/{id}
     *
     * Xem chi tiết đơn hàng
     * =========================================================
     */
    public function show($id)
    {
        $order = DonHang::with([
            'nguoidung:id,ten,email,sodienthoai,diachi',

            'chitiet' => function ($query) {
                $query->with([
                    'sanpham:id,ten,slug,hinhanh'
                ]);
            },

            'lichsu' => function ($query) {
                $query->with([
                    'nguoidung:id,ten,vaitro'
                ]);
            },
        ])->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết đơn hàng thành công',
            'data' => $order,
        ]);
    }


    /**
     * =========================================================
     * FUNC-ADM-ORDER-03
     * PATCH /api/admin/orders/{id}/status
     *
     * Cập nhật trạng thái đơn hàng
     * =========================================================
     */
    public function updateStatus(
        Request $request,
        $id
    ) {
        $request->validate([
            'trangthai' => [
                'required',
                'in:choxacnhan,daxacnhan,danggiao,hoantat,dahuy'
            ],

            'ghichu' => [
                'nullable',
                'string',
                'max:1000'
            ],
        ]);

        $order = DonHang::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        $trangThaiCu = $order->trangthai;
        $trangThaiMoi = $request->trangthai;

        // Không cập nhật nếu giống trạng thái hiện tại
        if ($trangThaiCu === $trangThaiMoi) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng đang ở trạng thái này',
            ], 400);
        }

        $admin = $request->user();

        DB::transaction(function () use (
            $order,
            $admin,
            $trangThaiCu,
            $trangThaiMoi,
            $request
        ) {

            // Cập nhật đơn hàng
            $order->update([
                'trangthai' => $trangThaiMoi,
            ]);

            // Ghi lịch sử
            LichSuDonHang::create([
                'donhang_id' => $order->id,

                'nguoidung_id' => $admin
                    ? $admin->id
                    : null,

                'trangthaicu' => $trangThaiCu,

                'trangthaimoi' => $trangThaiMoi,

                'ghichu' => $request->ghichu,
            ]);
        });

        $order->refresh();

        // ==========================================
        // GỬI EMAIL KHI ADMIN XÁC NHẬN ĐƠN HÀNG
        // ==========================================

        // Chỉ gửi khi trạng thái chuyển từ chờ xác nhận
        // sang đã xác nhận.
        if (
            $trangThaiCu === 'choxacnhan' &&
            $trangThaiMoi === 'daxacnhan' &&
            !empty($order->email)
        ) {
            try {
                // Lấy chi tiết sản phẩm trong đơn hàng
                $order->load('chitiet');

                // Gửi email cho khách hàng
                Mail::to($order->email)
                    ->send(new OrderConfirmedMail($order));
            } catch (\Throwable $e) {
                // Ghi nhận lỗi nếu gửi email thất bại
                Log::error('Gui email xac nhan don hang that bai', [
                    'donhang_id' => $order->id,
                    'email' => $order->email,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái đơn hàng thành công',
            'data' => $order,
        ]);
    }


    /**
     * =========================================================
     * FUNC-ADM-ORDER-04
     * PATCH /api/admin/orders/{id}/cancel
     *
     * Hủy đơn hàng phía quản trị
     * =========================================================
     */
    public function cancel(
        Request $request,
        $id
    ) {
        $request->validate([
            'ghichu' => [
                'nullable',
                'string',
                'max:1000'
            ],
        ]);

        $order = DonHang::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Chỉ cho hủy đơn chưa giao
        if (
            !in_array(
                $order->trangthai,
                [
                    'choxacnhan',
                    'daxacnhan'
                ]
            )
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                'Không thể hủy đơn hàng ở trạng thái hiện tại',
            ], 400);
        }

        $trangThaiCu = $order->trangthai;

        $admin = $request->user();

        DB::transaction(function () use (
            $order,
            $admin,
            $trangThaiCu,
            $request
        ) {

            $order->update([
                'trangthai' => 'dahuy',
            ]);

            LichSuDonHang::create([
                'donhang_id' => $order->id,

                'nguoidung_id' => $admin
                    ? $admin->id
                    : null,

                'trangthaicu' => $trangThaiCu,

                'trangthaimoi' => 'dahuy',

                'ghichu' =>
                $request->ghichu
                    ?? 'Đơn hàng bị hủy bởi quản trị viên',
            ]);
        });

        $order->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Hủy đơn hàng thành công',
            'data' => $order,
        ]);
    }

    /**
     * =========================================================
     * GET /api/orders
     * Lấy danh sách đơn hàng từ database cho người dùng / khách hàng
     * =========================================================
     */
    public function userOrders(Request $request)
    {
        $user = auth('sanctum')->user();

        $query = DonHang::with([
            'chitiet' => function ($q) {
                $q->with('sanpham:id,ten,slug,hinhanh,gia,giakhuyenmai');
            }
        ]);

        if ($user) {
            // Nếu là thành viên thông thường, lấy đơn theo ID hoặc email
            if ($user->vaitro !== 'admin') {
                $query->where(function ($q) use ($user) {
                    $q->where('nguoidung_id', $user->id);
                    if ($user->email) {
                        $q->orWhere('email', $user->email);
                    }
                });
            }
        } elseif ($request->filled('sodienthoai')) {
            $query->where('sodienthoai', $request->sodienthoai);
        } elseif ($request->filled('email')) {
            $query->where('email', $request->email);
        }

        // Lọc theo trạng thái
        if ($request->filled('trangthai') && $request->trangthai !== 'all') {
            $statusMap = [
                'pending' => ['choxacnhan', 'daxacnhan'],
                'choxacnhan' => ['choxacnhan', 'daxacnhan'],
                'shipping' => ['danggiao'],
                'danggiao' => ['danggiao'],
                'completed' => ['hoantat', 'hoanthanh'],
                'hoantat' => ['hoantat', 'hoanthanh'],
                'cancelled' => ['dahuy'],
                'dahuy' => ['dahuy'],
            ];

            $val = strtolower($request->trangthai);
            if (isset($statusMap[$val])) {
                $query->whereIn('trangthai', $statusMap[$val]);
            } else {
                $query->where('trangthai', $val);
            }
        }

        // Tìm kiếm theo mã đơn hoặc người nhận
        if ($request->filled('search')) {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('madon', 'like', '%' . $search . '%')
                    ->orWhere('hoten_nguoinhan', 'like', '%' . $search . '%');
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách đơn hàng từ database thành công',
            'data' => $orders,
        ]);
    }

    /**
     * =========================================================
     * GET /api/orders/{id}
     * Lấy chi tiết đơn hàng cho khách hàng
     * =========================================================
     */
    public function userOrderDetail($id)
    {
        $order = DonHang::with([
            'chitiet.sanpham',
            'lichsu',
        ])->where('id', $id)->orWhere('madon', $id)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    /**
     * =========================================================
     * PATCH /api/orders/{id}/cancel
     * Hủy đơn hàng phía khách hàng / thành viên
     * Chỉ cho phép hủy khi đơn ở trạng thái 'choxacnhan'
     * =========================================================
     */
    public function userCancel(Request $request, $id)
    {
        $user = auth('sanctum')->user();

        $order = DonHang::with(['chitiet'])->where('id', $id)->orWhere('madon', $id)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng',
            ], 404);
        }

        // Kiểm tra quyền sở hữu đơn hàng (nếu đang đăng nhập)
        if ($user) {
            if ($user->vaitro !== 'admin' && $order->nguoidung_id !== $user->id && $order->email !== $user->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn không có quyền thao tác trên đơn hàng này',
                ], 403);
            }
        }

        // Kiểm tra trạng thái đơn: chỉ cho phép hủy khi đơn chưa giao (choxacnhan, daxacnhan)
        $cancelableStatuses = ['choxacnhan', 'daxacnhan', 'pending'];
        if (!in_array(strtolower($order->trangthai), $cancelableStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Chỉ có thể hủy đơn hàng khi đơn chưa được giao (ở trạng thái Chờ xác nhận hoặc Đã xác nhận). Đơn hàng này hiện ở trạng thái: ' . $order->trangthai,
            ], 400);
        }

        $request->validate([
            'ghichu' => 'nullable|string|max:500',
            'lydo' => 'nullable|string|max:500',
        ]);

        $lyDoHuy = $request->input('ghichu') ?? $request->input('lydo') ?? 'Khách hàng tự hủy đơn';

        $trangThaiCu = $order->trangthai;

        DB::transaction(function () use ($order, $user, $trangThaiCu, $lyDoHuy) {
            // Cập nhật trạng thái đơn
            $order->update([
                'trangthai' => 'dahuy',
            ]);

            // Ghi lịch sử đơn hàng
            LichSuDonHang::create([
                'donhang_id' => $order->id,
                'nguoidung_id' => $user ? $user->id : $order->nguoidung_id,
                'trangthaicu' => $trangThaiCu,
                'trangthaimoi' => 'dahuy',
                'ghichu' => 'Khách hủy đơn: ' . $lyDoHuy,
            ]);

            // Hoàn lại tồn kho cho sản phẩm
            foreach ($order->chitiet as $item) {
                if ($item->sanpham_id && $item->soluong > 0) {
                    DB::table('sanpham')
                        ->where('id', $item->sanpham_id)
                        ->increment('soluong', $item->soluong);
                }
            }

            // Hoàn lại lượt dùng mã khuyến mãi (nếu có)
            if ($order->khuyenmai_id) {
                \App\Models\KhuyenMai::where('id', $order->khuyenmai_id)
                    ->where('daluotdung', '>', 0)
                    ->decrement('daluotdung');
            }
        });

        $order->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Hủy đơn hàng thành công',
            'data' => $order,
        ]);
    }
}
