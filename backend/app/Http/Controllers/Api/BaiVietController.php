<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use App\Models\BaiViet;
use App\Models\ChuDeBaiViet;

class BaiVietController extends Controller
{
    // ==========================================
    // API CÔNG KHAI - NGƯỜI DÙNG
    // ==========================================

    // FUNC-POST-U-01: Xem danh sách bài viết đang hiển thị
    public function index(Request $request)
    {
        $query = BaiViet::with('chudebaiviet')
            ->where('trangthai', 'hienthi');

        if ($request->filled('chudebaiviet_id')) {
            $query->where(
                'chudebaiviet_id',
                $request->integer('chudebaiviet_id')
            );
        }

        $query->orderBy('ngaydang', 'desc')
            ->orderBy('created_at', 'desc');

        $perPage = min(
            max($request->integer('per_page', 10), 1),
            100
        );

        $baiviet = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách bài viết thành công',
            'data' => $baiviet,
        ]);
    }

    // FUNC-POST-U-02: Xem chi tiết bài viết
    public function showBySlug($slug)
    {
        $baiviet = BaiViet::with('chudebaiviet')
            ->where('slug', $slug)
            ->where('trangthai', 'hienthi')
            ->first();

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài viết thành công',
            'data' => $baiviet,
        ]);
    }

    // Lấy danh sách chủ đề đang hiển thị
    public function topics()
    {
        $chude = ChuDeBaiViet::where('trangthai', 'hienthi')
            ->orderBy('ten', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách chủ đề thành công',
            'data' => $chude,
        ]);
    }

    // ==========================================
    // API QUẢN TRỊ - ADMIN
    // ==========================================

    // Lấy danh sách tất cả bài viết
    public function adminIndex(Request $request)
    {
        $query = BaiViet::with('chudebaiviet')
            ->orderBy('created_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($q) use ($search) {
                $q->where('tieude', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if ($request->filled('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        }

        if ($request->filled('chudebaiviet_id')) {
            $query->where(
                'chudebaiviet_id',
                $request->integer('chudebaiviet_id')
            );
        }

        $perPage = min(
            max($request->integer('per_page', 10), 1),
            100
        );

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách bài viết quản trị thành công',
            'data' => $query->paginate($perPage),
        ]);
    }

    // Xem chi tiết bài viết trong quản trị
    public function adminShow($id)
    {
        $baiviet = BaiViet::with('chudebaiviet')->find($id);

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy chi tiết bài viết thành công',
            'data' => $baiviet,
        ]);
    }

    // Thêm bài viết
    public function store(Request $request)
    {
        $validated = $request->validate([
            'chudebaiviet_id' => [
                'required',
                'integer',
                'exists:chudebaiviet,id',
            ],
            'tieude' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:baiviet,slug',
            'noidung' => 'required|string',
            'hinhanh' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'trangthai' => [
                'required',
                Rule::in(['bannhap', 'hienthi', 'an']),
            ],
            'ngaydang' => 'nullable|date',
        ]);

        $validated['slug'] = $this->generateUniqueSlug(
            $validated['slug'] ?? $validated['tieude']
        );

        // Lấy ID của Admin đang đăng nhập
        $validated['nguoidung_id'] = $request->user()->id;

        if ($request->hasFile('hinhanh')) {
            $validated['hinhanh'] = $request->file('hinhanh')
                ->store('baiviet', 'public');
        }

        // Nếu bài viết được hiển thị nhưng chưa có ngày đăng
        if (
            $validated['trangthai'] === 'hienthi'
            && empty($validated['ngaydang'])
        ) {
            $validated['ngaydang'] = now();
        }

        $baiviet = BaiViet::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm bài viết thành công',
            'data' => $baiviet->load('chudebaiviet'),
        ], 201);
    }

    // Cập nhật bài viết
    public function update(Request $request, $id)
    {
        $baiviet = BaiViet::find($id);

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết',
            ], 404);
        }

        $validated = $request->validate([
            'chudebaiviet_id' => [
                'sometimes',
                'required',
                'integer',
                'exists:chudebaiviet,id',
            ],
            'tieude' => 'sometimes|required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('baiviet', 'slug')->ignore($id),
            ],
            'noidung' => 'sometimes|required|string',
            'hinhanh' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'trangthai' => [
                'sometimes',
                'required',
                Rule::in(['bannhap', 'hienthi', 'an']),
            ],
            'ngaydang' => 'nullable|date',
        ]);

        if (isset($validated['tieude']) || isset($validated['slug'])) {
            $slugInput = $validated['slug']
                ?? $validated['tieude']
                ?? $baiviet->slug;

            $validated['slug'] = $this->generateUniqueSlug(
                $slugInput,
                $id
            );
        }

        if ($request->hasFile('hinhanh')) {
            // Xóa ảnh cũ khi thay ảnh mới
            if (
                $baiviet->hinhanh
                && Storage::disk('public')->exists($baiviet->hinhanh)
            ) {
                Storage::disk('public')->delete($baiviet->hinhanh);
            }

            $validated['hinhanh'] = $request->file('hinhanh')
                ->store('baiviet', 'public');
        }

        if (
            ($validated['trangthai'] ?? $baiviet->trangthai) === 'hienthi'
            && empty($validated['ngaydang'] ?? $baiviet->ngaydang)
        ) {
            $validated['ngaydang'] = now();
        }

        $baiviet->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật bài viết thành công',
            'data' => $baiviet->fresh()->load('chudebaiviet'),
        ]);
    }

    // Xóa mềm bài viết
    public function destroy($id)
    {
        $baiviet = BaiViet::find($id);

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết',
            ], 404);
        }

        $baiviet->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển bài viết vào thùng rác',
        ]);
    }

    // Lấy danh sách bài viết trong thùng rác
    public function trashed(Request $request)
    {
        $query = BaiViet::onlyTrashed()
            ->with('chudebaiviet')
            ->orderBy('deleted_at', 'desc');

        if ($request->filled('search')) {
            $search = $request->search;

            $query->where('tieude', 'like', "%{$search}%");
        }

        $perPage = min(
            max($request->integer('per_page', 10), 1),
            100
        );

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách thùng rác thành công',
            'data' => $query->paginate($perPage),
        ]);
    }

    // Khôi phục bài viết
    public function restore($id)
    {
        $baiviet = BaiViet::onlyTrashed()->find($id);

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết trong thùng rác',
            ], 404);
        }

        $baiviet->restore();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục bài viết thành công',
            'data' => $baiviet->fresh()->load('chudebaiviet'),
        ]);
    }

    // Xóa vĩnh viễn bài viết
    public function forceDelete($id)
    {
        $baiviet = BaiViet::onlyTrashed()->find($id);

        if (!$baiviet) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết trong thùng rác',
            ], 404);
        }

        // Xóa ảnh khỏi Storage khi xóa vĩnh viễn
        if (
            $baiviet->hinhanh
            && Storage::disk('public')->exists($baiviet->hinhanh)
        ) {
            Storage::disk('public')->delete($baiviet->hinhanh);
        }

        $baiviet->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa vĩnh viễn bài viết thành công',
        ]);
    }

    // Tạo slug duy nhất
    private function generateUniqueSlug($value, $ignoreId = null)
    {
        $slug = Str::slug($value);

        if ($slug === '') {
            $slug = 'bai-viet';
        }

        $originalSlug = $slug;
        $counter = 1;

        while (
            BaiViet::withTrashed()
                ->where('slug', $slug)
                ->when($ignoreId, function ($query) use ($ignoreId) {
                    $query->where('id', '!=', $ignoreId);
                })
                ->exists()
        ) {
            $slug = $originalSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
