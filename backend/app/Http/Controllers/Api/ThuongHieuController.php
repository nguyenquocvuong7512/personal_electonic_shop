<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ThuongHieu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ThuongHieuController extends Controller
{
    // ==================== DANH SÁCH ====================

    public function index(Request $request)
    {
        $isTrashed = $request->boolean('trashed');
        $query = $isTrashed
            ? ThuongHieu::onlyTrashed()
            : ThuongHieu::query();

        if (!$isTrashed) {
            $query->where(
                'trangthai',
                $request->filled('trangthai')
                    ? $request->input('trangthai')
                    : 'hienthi'
            );
        }

        $perPage = min(
            max($request->integer('per_page', 10), 1),
            100
        );

        $thuongHieus = $query
            ->orderBy('id', 'desc')
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách thương hiệu thành công',
            'data' => $thuongHieus
        ]);
    }


    // ==================== CHI TIẾT THEO ID ====================

    public function show($id)
    {
        $thuongHieu = ThuongHieu::find($id);

        if (!$thuongHieu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thương hiệu'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin thương hiệu thành công',
            'data' => $thuongHieu
        ]);
    }


    // ==================== CHI TIẾT THEO SLUG ====================

    public function showBySlug($slug)
    {
        $thuongHieu = ThuongHieu::where('slug', $slug)->first();

        if (!$thuongHieu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thương hiệu'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin thương hiệu thành công',
            'data' => $thuongHieu
        ]);
    }


    // ==================== THÊM ====================

    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:255',

            'slug' => 'required|string|max:255|unique:thuonghieu,slug',

            'mota' => 'nullable|string',

            // Upload file
            'hinhanh' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'max:5120',
            ],

            'trangthai' => 'nullable|in:hienthi,an',
        ]);


        // ============================
        // XỬ LÝ ẢNH
        // ============================

        $imagePath = null;

        if ($request->hasFile('hinhanh')) {

            $imagePath = $request
                ->file('hinhanh')
                ->store('brands', 'public');
        }


        // ============================
        // TẠO THƯƠNG HIỆU
        // ============================

        $thuongHieu = ThuongHieu::create([
            'ten' => $validated['ten'],

            'slug' => $validated['slug'],

            'mota' => $validated['mota'] ?? null,

            'hinhanh' => $imagePath,

            'trangthai' => $validated['trangthai'] ?? 'hienthi',
        ]);


        return response()->json([
            'success' => true,
            'message' => 'Thêm thương hiệu thành công',
            'data' => $thuongHieu
        ], 201);
    }


   // ==================== CẬP NHẬT ====================

public function update(Request $request, $id)
{
    $thuongHieu = ThuongHieu::find($id);

    if (!$thuongHieu) {
        return response()->json([
            'success' => false,
            'message' => 'Không tìm thấy thương hiệu'
        ], 404);
    }

    // ============================
    // VALIDATE
    // ============================

    $validated = $request->validate([
        'ten'       => 'required|string|max:255',
        'slug'      => 'required|string|max:255|unique:thuonghieu,slug,' . $id,
        'mota'      => 'nullable|string',
        'hinhanh'   => [
            'nullable',
            'image',
            'mimes:jpg,jpeg,png,webp',
            'max:5120',
        ],
        'trangthai' => 'nullable|in:hienthi,an',
        'xoa_hinhanh' => 'nullable|boolean', // Cho phép nhận cờ xóa từ frontend (1/true/'1')
    ]);

    // ============================
    // DỮ LIỆU CẬP NHẬT CO BAN
    // ============================

    $data = [
        'ten'       => $validated['ten'],
        'slug'      => $validated['slug'],
        'mota'      => $validated['mota'] ?? null,
        'trangthai' => $validated['trangthai'] ?? $thuongHieu->trangthai,
    ];

    // Hàm phụ trợ dùng để xóa file cũ khỏi Storage
    $deleteOldImage = function () use ($thuongHieu) {
        if (
            $thuongHieu->hinhanh &&
            !str_starts_with($thuongHieu->hinhanh, 'http://') &&
            !str_starts_with($thuongHieu->hinhanh, 'https://')
        ) {
            if (Storage::disk('public')->exists($thuongHieu->hinhanh)) {
                Storage::disk('public')->delete($thuongHieu->hinhanh);
            }
        }
    };

    // ============================
    // XỬ LÝ HÌNH ẢNH
    // ============================

    if ($request->hasFile('hinhanh')) {
        // Trường hợp 1: Người dùng upload ảnh mới
        $deleteOldImage(); // Xóa ảnh cũ
        $data['hinhanh'] = $request->file('hinhanh')->store('brands', 'public');
    } elseif ($request->boolean('xoa_hinhanh')) {
        // Trường hợp 2: Người dùng bấm "Xóa ảnh này" (không chọn ảnh mới)
        $deleteOldImage(); // Xóa ảnh cũ khỏi disk
        $data['hinhanh'] = null; // Cập nhật cột hinhanh trong DB thành null
    }

    // ============================
    // CẬP NHẬT DATABASE
    // ============================

    $thuongHieu->update($data);
    $thuongHieu->refresh();

    return response()->json([
        'success' => true,
        'message' => 'Cập nhật thương hiệu thành công',
        'data'    => $thuongHieu
    ]);
}


    // ==================== XÓA ====================

    public function destroy($id)
    {
        $thuongHieu = ThuongHieu::find($id);

        if (!$thuongHieu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thương hiệu'
            ], 404);
        }


        $thuongHieu->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển thương hiệu vào thùng rác'
        ]);
    }

    // PATCH /api/thuong-hieu/{id}/restore
    public function restore($id)
    {
        $thuongHieu = ThuongHieu::onlyTrashed()->find($id);

        if (!$thuongHieu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thương hiệu trong thùng rác'
            ], 404);
        }

        $thuongHieu->restore();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục thương hiệu thành công'
        ]);
    }

    // DELETE /api/thuong-hieu/{id}/force
    public function forceDestroy($id)
    {
        $thuongHieu = ThuongHieu::onlyTrashed()->find($id);

        if (!$thuongHieu) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy thương hiệu trong thùng rác'
            ], 404);
        }

        if ($thuongHieu->sanpham()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vĩnh viễn thương hiệu vì vẫn còn sản phẩm thuộc thương hiệu này.'
            ], 400);
        }

        $imagePath = $thuongHieu->hinhanh;
        $thuongHieu->forceDelete();

        if (
            $imagePath &&
            !str_starts_with($imagePath, 'http://') &&
            !str_starts_with($imagePath, 'https://')
        ) {
            Storage::disk('public')->delete($imagePath);
        }

        return response()->json([
            'success' => true,
            'message' => 'Xóa vĩnh viễn thương hiệu thành công'
        ]);
    }
}