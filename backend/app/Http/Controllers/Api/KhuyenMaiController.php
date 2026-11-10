<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class KhuyenMaiController extends Controller
{
    /**
     * GET /api/admin/khuyen-mai
     * Lấy danh sách khuyến mãi kèm phân trang, lọc và thống kê số đơn đã áp dụng
     */
    public function index(Request $request)
    {
        $query = KhuyenMai::query()->withCount('donhangs');

        // Tìm kiếm theo mã hoặc tên khuyến mãi
        if ($request->filled('keyword')) {
            $keyword = trim($request->keyword);
            $query->where(function ($q) use ($keyword) {
                $q->where('ma', 'like', "%{$keyword}%")
                    ->orWhere('ten', 'like', "%{$keyword}%");
            });
        }

        // Lọc theo loại giảm
        if ($request->filled('loaigiam')) {
            $query->where('loaigiam', $request->loaigiam);
        }

        // Lọc theo trạng thái hoạt động / ngừng
        if ($request->filled('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        }

        // Lọc theo hiệu lực thời gian
        if ($request->filled('hieuluc')) {
            $now = Carbon::now();
            switch ($request->hieuluc) {
                case 'conhan':
                    $query->where('ngaybatdau', '<=', $now)
                        ->where('ngayketthuc', '>=', $now);
                    break;
                case 'hethan':
                    $query->where('ngayketthuc', '<', $now);
                    break;
                case 'chuabatdau':
                    $query->where('ngaybatdau', '>', $now);
                    break;
            }
        }

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('sort_order', 'desc');

        $allowedSorts = ['id', 'ma', 'ten', 'giatri', 'soluong', 'daluotdung', 'ngaybatdau', 'ngayketthuc', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'id';
        }
        $sortOrder = strtolower($sortOrder) === 'asc' ? 'asc' : 'desc';

        $promotions = $query->orderBy($sortBy, $sortOrder)->paginate($perPage);

        // Thống kê nhanh tổng quan
        $now = Carbon::now();
        $stats = [
            'total' => KhuyenMai::count(),
            'hoatdong' => KhuyenMai::where('trangthai', 'hoatdong')->count(),
            'ngung' => KhuyenMai::where('trangthai', 'ngung')->count(),
            'conhan' => KhuyenMai::where('trangthai', 'hoatdong')
                ->where('ngaybatdau', '<=', $now)
                ->where('ngayketthuc', '>=', $now)
                ->count(),
            'hethan' => KhuyenMai::where('ngayketthuc', '<', $now)->count(),
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách khuyến mãi thành công',
            'data' => $promotions,
            'stats' => $stats,
        ]);
    }

    /**
     * GET /api/admin/khuyen-mai/{id}
     * Chi tiết khuyến mãi kèm danh sách đơn hàng đã áp dụng
     */
    public function show($id)
    {
        $khuyenMai = KhuyenMai::withCount('donhangs')
            ->with(['donhangs' => function ($q) {
                $q->select([
                    'id',
                    'madon',
                    'khuyenmai_id',
                    'nguoidung_id',
                    'hoten_nguoinhan',
                    'sodienthoai',
                    'tongtien',
                    'tiengiam',
                    'thanhtien',
                    'trangthai',
                    'created_at',
                ])->orderByDesc('id')->take(10);
            }])
            ->find($id);

        if (!$khuyenMai) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thông tin khuyến mãi',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết khuyến mãi thành công',
            'data' => $khuyenMai,
        ]);
    }

    /**
     * POST /api/admin/khuyen-mai
     * Thêm mới khuyến mãi
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ma' => ['required', 'string', 'max:100', 'unique:khuyenmai,ma'],
            'ten' => ['required', 'string', 'max:255'],
            'mota' => ['nullable', 'string'],
            'loaigiam' => ['required', 'in:phantram,sotien'],
            'giatri' => ['required', 'numeric', 'min:0.01'],
            'giatritoithieu' => ['nullable', 'numeric', 'min:0'],
            'giamtoida' => ['nullable', 'numeric', 'min:0'],
            'soluong' => ['required', 'integer', 'min:0'],
            'ngaybatdau' => ['required', 'date'],
            'ngayketthuc' => ['required', 'date', 'after_or_equal:ngaybatdau'],
            'trangthai' => ['required', 'in:hoatdong,ngung'],
        ], [
            'ma.required' => 'Mã khuyến mãi không được để trống',
            'ma.unique' => 'Mã khuyến mãi này đã tồn tại trong hệ thống',
            'ten.required' => 'Tên chương trình khuyến mãi không được để trống',
            'loaigiam.required' => 'Vui lòng chọn hình thức giảm giá',
            'loaigiam.in' => 'Hình thức giảm giá không hợp lệ',
            'giatri.required' => 'Giá trị giảm không được để trống',
            'giatri.min' => 'Giá trị giảm phải lớn hơn 0',
            'soluong.required' => 'Số lượng mã phát hành không được để trống',
            'soluong.min' => 'Số lượng không được âm',
            'ngaybatdau.required' => 'Vui lòng chọn thời điểm bắt đầu',
            'ngayketthuc.required' => 'Vui lòng chọn thời điểm kết thúc',
            'ngayketthuc.after_or_equal' => 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu',
            'trangthai.required' => 'Vui lòng chọn trạng thái',
        ]);

        // Kiểm tra logic nếu giảm theo % thì giá trị không vượt 100%
        if ($validated['loaigiam'] === 'phantram' && (float)$validated['giatri'] > 100) {
            throw ValidationException::withMessages([
                'giatri' => ['Mức giảm theo phần trăm không được vượt quá 100%'],
            ]);
        }

        $data = [
            'ma' => strtoupper(trim($validated['ma'])),
            'ten' => trim($validated['ten']),
            'mota' => $validated['mota'] ?? null,
            'loaigiam' => $validated['loaigiam'],
            'giatri' => (float)$validated['giatri'],
            'giatritoithieu' => isset($validated['giatritoithieu']) ? (float)$validated['giatritoithieu'] : 0,
            'giamtoida' => isset($validated['giamtoida']) && $validated['giamtoida'] !== '' ? (float)$validated['giamtoida'] : null,
            'soluong' => (int)$validated['soluong'],
            'daluotdung' => 0,
            'ngaybatdau' => Carbon::parse($validated['ngaybatdau'])->format('Y-m-d H:i:s'),
            'ngayketthuc' => Carbon::parse($validated['ngayketthuc'])->format('Y-m-d H:i:s'),
            'trangthai' => $validated['trangthai'],
        ];

        $khuyenMai = KhuyenMai::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Tạo khuyến mãi mới thành công',
            'data' => $khuyenMai,
        ], 201);
    }

    /**
     * PUT /api/admin/khuyen-mai/{id}
     * Cập nhật thông tin khuyến mãi
     */
    public function update(Request $request, $id)
    {
        $khuyenMai = KhuyenMai::find($id);

        if (!$khuyenMai) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy khuyến mãi để cập nhật',
            ], 404);
        }

        $validated = $request->validate([
            'ma' => ['required', 'string', 'max:100', "unique:khuyenmai,ma,{$id}"],
            'ten' => ['required', 'string', 'max:255'],
            'mota' => ['nullable', 'string'],
            'loaigiam' => ['required', 'in:phantram,sotien'],
            'giatri' => ['required', 'numeric', 'min:0.01'],
            'giatritoithieu' => ['nullable', 'numeric', 'min:0'],
            'giamtoida' => ['nullable', 'numeric', 'min:0'],
            'soluong' => ['required', 'integer', 'min:0'],
            'daluotdung' => ['nullable', 'integer', 'min:0'],
            'ngaybatdau' => ['required', 'date'],
            'ngayketthuc' => ['required', 'date', 'after_or_equal:ngaybatdau'],
            'trangthai' => ['required', 'in:hoatdong,ngung'],
        ], [
            'ma.required' => 'Mã khuyến mãi không được để trống',
            'ma.unique' => 'Mã khuyến mãi này đã tồn tại trong hệ thống',
            'ten.required' => 'Tên chương trình khuyến mãi không được để trống',
            'loaigiam.required' => 'Vui lòng chọn hình thức giảm giá',
            'loaigiam.in' => 'Hình thức giảm giá không hợp lệ',
            'giatri.required' => 'Giá trị giảm không được để trống',
            'giatri.min' => 'Giá trị giảm phải lớn hơn 0',
            'soluong.required' => 'Số lượng mã phát hành không được để trống',
            'soluong.min' => 'Số lượng không được âm',
            'ngaybatdau.required' => 'Vui lòng chọn thời điểm bắt đầu',
            'ngayketthuc.required' => 'Vui lòng chọn thời điểm kết thúc',
            'ngayketthuc.after_or_equal' => 'Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu',
            'trangthai.required' => 'Vui lòng chọn trạng thái',
        ]);

        if ($validated['loaigiam'] === 'phantram' && (float)$validated['giatri'] > 100) {
            throw ValidationException::withMessages([
                'giatri' => ['Mức giảm theo phần trăm không được vượt quá 100%'],
            ]);
        }

        $data = [
            'ma' => strtoupper(trim($validated['ma'])),
            'ten' => trim($validated['ten']),
            'mota' => $validated['mota'] ?? null,
            'loaigiam' => $validated['loaigiam'],
            'giatri' => (float)$validated['giatri'],
            'giatritoithieu' => isset($validated['giatritoithieu']) ? (float)$validated['giatritoithieu'] : 0,
            'giamtoida' => isset($validated['giamtoida']) && $validated['giamtoida'] !== '' ? (float)$validated['giamtoida'] : null,
            'soluong' => (int)$validated['soluong'],
            'ngaybatdau' => Carbon::parse($validated['ngaybatdau'])->format('Y-m-d H:i:s'),
            'ngayketthuc' => Carbon::parse($validated['ngayketthuc'])->format('Y-m-d H:i:s'),
            'trangthai' => $validated['trangthai'],
        ];

        if (isset($validated['daluotdung'])) {
            $data['daluotdung'] = (int)$validated['daluotdung'];
        }

        $khuyenMai->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật khuyến mãi thành công',
            'data' => $khuyenMai->fresh(),
        ]);
    }

    /**
     * DELETE /api/admin/khuyen-mai/{id}
     * Xóa khuyến mãi (liên kết với đơn hàng sẽ tự động set null nhờ ON DELETE SET NULL)
     */
    public function destroy($id)
    {
        $khuyenMai = KhuyenMai::find($id);

        if (!$khuyenMai) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy khuyến mãi để xóa',
            ], 404);
        }

        $donHangCount = $khuyenMai->donhangs()->count();

        $khuyenMai->delete();

        $message = $donHangCount > 0
            ? "Đã xóa khuyến mãi thành công (Mã này đã từng được dùng trong {$donHangCount} đơn hàng, dữ liệu đơn hàng vẫn được bảo toàn)."
            : 'Xóa khuyến mãi thành công.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'affected_orders' => $donHangCount,
        ]);
    }

    /**
     * GET /api/khuyen-mai/check
     * Kiểm tra tính hợp lệ của mã khuyến mãi (có thể dùng cho shop checkout)
     */
    public function check(Request $request)
    {
        $request->validate([
            'ma' => ['required', 'string'],
            'tongtien' => ['nullable', 'numeric', 'min:0'],
        ]);

        $code = strtoupper(trim($request->ma));
        $tongTien = (float) $request->input('tongtien', 0);

        $km = KhuyenMai::where('ma', $code)->first();

        if (!$km) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi không tồn tại.',
            ], 404);
        }

        if ($km->trangthai !== 'hoatdong') {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi hiện đang tạm ngưng sử dụng.',
            ], 400);
        }

        $now = Carbon::now();
        if ($now->lt($km->ngaybatdau)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi chưa đến thời điểm áp dụng.',
            ], 400);
        }

        if ($now->gt($km->ngayketthuc)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi đã hết hạn sử dụng.',
            ], 400);
        }

        if ($km->soluong > 0 && $km->daluotdung >= $km->soluong) {
            return response()->json([
                'success' => false,
                'message' => 'Mã khuyến mãi đã hết lượt sử dụng.',
            ], 400);
        }

        if ($tongTien > 0 && $km->giatritoithieu > 0 && $tongTien < $km->giatritoithieu) {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng chưa đạt giá trị tối thiểu ' . number_format($km->giatritoithieu) . 'đ để áp dụng mã này.',
            ], 400);
        }

        // Tính tiền giảm
        $tienGiam = 0;
        if ($km->loaigiam === 'phantram') {
            $tienGiam = ($tongTien * $km->giatri) / 100;
            if ($km->giamtoida && $km->giamtoida > 0 && $tienGiam > $km->giamtoida) {
                $tienGiam = $km->giamtoida;
            }
        } else {
            $tienGiam = min($km->giatri, $tongTien > 0 ? $tongTien : $km->giatri);
        }

        return response()->json([
            'success' => true,
            'message' => 'Mã khuyến mãi hợp lệ',
            'data' => [
                'id' => $km->id,
                'ma' => $km->ma,
                'ten' => $km->ten,
                'loaigiam' => $km->loaigiam,
                'giatri' => $km->giatri,
                'giatritoithieu' => $km->giatritoithieu,
                'giamtoida' => $km->giamtoida,
                'tiengiam' => $tienGiam,
            ],
        ]);
    }

    /**
     * GET /api/khuyen-mai/active
     * Lấy danh sách các mã khuyến mãi đang có hiệu lực để hiển thị cho khách hàng chọn
     */
    public function getActivePromotions(Request $request)
    {
        $now = Carbon::now();
        $promotions = KhuyenMai::where('trangthai', 'hoatdong')
            ->where('ngaybatdau', '<=', $now)
            ->where('ngayketthuc', '>=', $now)
            ->where(function ($q) {
                $q->where('soluong', 0)
                    ->orWhereRaw('daluotdung < soluong');
            })
            ->select([
                'id',
                'ma',
                'ten',
                'mota',
                'loaigiam',
                'giatri',
                'giatritoithieu',
                'giamtoida',
                'soluong',
                'daluotdung',
                'ngaybatdau',
                'ngayketthuc',
            ])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $promotions,
        ]);
    }
}

