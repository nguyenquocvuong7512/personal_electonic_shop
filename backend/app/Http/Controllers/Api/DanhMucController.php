<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DanhMuc;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DanhMucController extends Controller
{
    // GET /api/danhmuc
    // Truyền ?tree=1 nếu muốn lấy dạng danh mục cấp cha kèm các danh mục con bên trong
// GET /api/danh-muc
// Có thể dùng:
// /api/danh-muc?page=1&per_page=10
// /api/danh-muc?tree=1&page=1&per_page=10
// /api/danh-muc?trangthai=hienthi&page=1&per_page=10
// /api/danh-muc?trashed=1
public function index(Request $request)
{
    $isTrashed = $request->boolean('trashed');
    $query = $isTrashed
        ? DanhMuc::onlyTrashed()
        : DanhMuc::query();

    if (!$isTrashed) {
        if ($request->has('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        } else {
            $query->where('trangthai', 'hienthi');
        }
    }

    // Số lượng danh mục trên mỗi trang
    // Mặc định: 10
    // Tối thiểu: 1
    // Tối đa: 100
    $perPage = min(
        max($request->integer('per_page', 10), 1),
        100
    );

    // =========================
    // DẠNG CÂY
    // =========================
    if ($request->boolean('tree')) {

        // Chỉ phân trang danh mục cấp cha
        $danhmucs = $query
            ->whereNull('parent_id')
            ->with('childrenRecursive')
            ->orderBy('id', 'desc')
            ->paginate($perPage);

    } else {

        // =========================
        // DẠNG PHẲNG
        // =========================

        $danhmucs = $query
            ->with('parent:id,ten')
            ->orderBy('id', 'desc')
            ->paginate($perPage);
    }

    return response()->json([
        'success' => true,
        'data' => $danhmucs
    ]);
}

    // GET /api/danhmuc/{id}
    public function show($id)
    {
        $danhmuc = DanhMuc::with(['parent', 'children'])->find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $danhmuc
        ]);
    }

    // POST /api/danhmuc
    public function store(Request $request)
    {
        //kiểm tra data trước khi đưa lên
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:danhmuc,id',
            'ten'       => [
                'required',
                'string',
                'max:255',
                Rule::unique('danhmuc', 'ten')
                    ->where(function ($query) use ($request) {
                        if ($request->filled('parent_id')) {
                            return $query->where(
                                'parent_id',
                                $request->input('parent_id')
                            );
                        }

                        return $query->whereNull('parent_id');
                    }),
            ],
            'mota'      => 'nullable|string',
            'trangthai' => 'nullable|in:hienthi,an',
        ], [
            'ten.unique' => 'Tên danh mục này đã tồn tại trong danh mục cha đã chọn.',
        ]);

        $danhmuc = DanhMuc::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Thêm danh mục thành công',
            'data'    => $danhmuc
        ], 201);
    }

    // PUT /api/danhmuc/{id}
    public function update(Request $request, $id)
    {
        $danhmuc = DanhMuc::find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        $validated = $request->validate([
            'parent_id' => [
                'nullable',
                'exists:danhmuc,id',
                // Ràng buộc không cho chọn chính nó làm parent_id
                function ($attribute, $value, $fail) use ($id) {
                    if ($value == $id) {
                        $fail('Danh mục cha không thể là chính danh mục này.');
                    }
                },
            ],
            'ten'       => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('danhmuc', 'ten')
                    ->ignore($id)
                    ->where(function ($query) use ($request, $danhmuc) {
                        if ($request->exists('parent_id')) {
                            if ($request->filled('parent_id')) {
                                return $query->where(
                                    'parent_id',
                                    $request->input('parent_id')
                                );
                            }

                            return $query->whereNull('parent_id');
                        }

                        if ($danhmuc->parent_id === null) {
                            return $query->whereNull('parent_id');
                        }

                        return $query->where('parent_id', $danhmuc->parent_id);
                    }),
            ],
            'mota'      => 'nullable|string',
            'trangthai' => 'nullable|in:hienthi,an',
        ], [
            'ten.unique' => 'Tên danh mục này đã tồn tại trong danh mục cha đã chọn.',
        ]);

        $danhmuc->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật danh mục thành công',
            'data'    => $danhmuc
        ]);
    }

    // DELETE /api/danh-muc/{id}
    public function destroy($id)
    {
        $danhmuc = DanhMuc::find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục'
            ], 404);
        }

        // Cảnh báo nếu danh mục này có chứa các danh mục con
        if ($danhmuc->children()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa danh mục này vì vẫn còn các danh mục con bên trong.'
            ], 400);
        }

        $danhmuc->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển danh mục vào thùng rác'
        ]);
    }

    // PATCH /api/danh-muc/{id}/restore
    public function restore($id)
    {
        $danhmuc = DanhMuc::onlyTrashed()->find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục trong thùng rác'
            ], 404);
        }

        $danhmuc->restore();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục danh mục thành công'
        ]);
    }

    // DELETE /api/danh-muc/{id}/force
    public function forceDestroy($id)
    {
        $danhmuc = DanhMuc::onlyTrashed()->find($id);

        if (!$danhmuc) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy danh mục trong thùng rác'
            ], 404);
        }

        if ($danhmuc->children()->withTrashed()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vĩnh viễn danh mục vì vẫn còn danh mục con.'
            ], 400);
        }

        if ($danhmuc->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa vĩnh viễn danh mục vì vẫn còn sản phẩm thuộc danh mục này.'
            ], 400);
        }

        $danhmuc->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa vĩnh viễn danh mục thành công'
        ]);
    }
}