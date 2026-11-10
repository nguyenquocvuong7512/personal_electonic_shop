<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChuDeBaiViet;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;

class ChuDeBaiVietController extends Controller
{
    // Danh sách danh mục bài viết dành cho Admin
    public function index(Request $request)
    {
        $query = ChuDeBaiViet::withCount('baiviets');

        // Tìm kiếm theo tên danh mục
        if ($request->filled('search')) {
            $query->where('ten', 'like', '%' . $request->search . '%');
        }

        // Lọc theo trạng thái
        if ($request->filled('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        }

        $danhmucs = $query->orderBy('id', 'desc')
            ->paginate($request->input('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục thành công',
            'data' => $danhmucs,
        ]);
    }

    // Thêm danh mục bài viết
    public function store(Request $request)
    {
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:chudebaiviet,slug',
            'mota' => 'nullable|string',
            'trangthai' => 'required|in:hienthi,an',
        ]);

        $validated['slug'] = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['ten']);

        // Đảm bảo slug không bị trùng
        $originalSlug = $validated['slug'];
        $counter = 1;

        while (
            ChuDeBaiViet::where('slug', $validated['slug'])->exists()
        ) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $danhmuc = ChuDeBaiViet::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thành công',
            'data' => $danhmuc,
        ], 201);
    }

    // Chi tiết một danh mục
    public function show($id)
    {
        $danhmuc = ChuDeBaiViet::withCount('baiviets')->find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $danhmuc,
        ]);
    }

    // Cập nhật danh mục
    public function update(Request $request, $id)
    {
        $danhmuc = ChuDeBaiViet::find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục',
            ], 404);
        }

        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('chudebaiviet', 'slug')->ignore($id),
            ],
            'mota' => 'nullable|string',
            'trangthai' => 'required|in:hienthi,an',
        ]);

        $validated['slug'] = !empty($validated['slug'])
            ? Str::slug($validated['slug'])
            : Str::slug($validated['ten']);

        $originalSlug = $validated['slug'];
        $counter = 1;

        while (
            ChuDeBaiViet::where('slug', $validated['slug'])
            ->where('id', '!=', $id)
            ->exists()
        ) {
            $validated['slug'] = $originalSlug . '-' . $counter;
            $counter++;
        }

        $danhmuc->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data' => $danhmuc,
        ]);
    }

    // Xóa danh mục
    // Danh sách danh mục đã xóa
    public function trashed()
    {
        $data = ChuDeBaiViet::onlyTrashed()
            ->withCount('baiviets')
            ->orderByDesc('deleted_at')
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách danh mục trong thùng rác thành công',
            'data' => $data,
        ]);
    }

    // Xóa danh mục vào thùng rác
    public function destroy($id)
    {
        $danhMuc = ChuDeBaiViet::findOrFail($id);

        $danhMuc->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển danh mục vào thùng rác',
        ]);
    }

    // Khôi phục danh mục
    public function restore($id)
    {
        $danhMuc = ChuDeBaiViet::onlyTrashed()->findOrFail($id);

        $danhMuc->restore();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục danh mục thành công',
        ]);
    }

    // Xóa vĩnh viễn danh mục
    public function forceDelete($id)
    {
        $danhMuc = ChuDeBaiViet::onlyTrashed()->findOrFail($id);

        // Không xóa vĩnh viễn nếu vẫn còn bài viết liên kết
        if ($danhMuc->baiviets()->withTrashed()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vĩnh viễn vì vẫn còn bài viết thuộc danh mục này.',
            ], 422);
        }

        $danhMuc->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa vĩnh viễn danh mục thành công',
        ]);
    }
}
