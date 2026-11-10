<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SanPhamController extends Controller
{
    /**
     * GET /api/san-pham
     * Lấy danh sách sản phẩm
     */
    public function index(Request $request)
    {
        $query = SanPham::with([
            'danhmuc',
            'thuonghieu'
        ]);

        // Tìm kiếm theo tên hoặc mô tả
        if ($request->filled('search')) {
            $search = $request->search;
            if ($request->boolean('include_mota')) {
                $query->where(function ($q) use ($search) {
                    $q->where('ten', 'like', '%' . $search . '%')
                      ->orWhere('mota', 'like', '%' . $search . '%');
                });
            } else {
                $query->where('ten', 'like', '%' . $search . '%');
            }
        }

        // Lọc theo danh mục (nếu có truyền ?danhmuc_id=...)
        if ($request->filled('danhmuc_id')) {
            $query->where('danhmuc_id', $request->integer('danhmuc_id'));
        }

        // Lọc theo thương hiệu (nếu có truyền ?thuonghieu_id=...)
        if ($request->filled('thuonghieu_id')) {
            $query->where('thuonghieu_id', $request->integer('thuonghieu_id'));
        }

        // Lọc theo khoảng giá (tính theo giá thực tế bán ra)
        if ($request->filled('min_price') || $request->filled('gia_tu')) {
            $minPrice = (float) ($request->min_price ?? $request->gia_tu);
            $query->whereRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) >= ?', [$minPrice]);
        }
        if ($request->filled('max_price') || $request->filled('gia_den')) {
            $maxPrice = (float) ($request->max_price ?? $request->gia_den);
            $query->whereRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) <= ?', [$maxPrice]);
        }

        // Lọc sản phẩm đang giảm giá
        if ($request->boolean('on_sale') || $request->boolean('has_sale')) {
            $query->whereNotNull('giakhuyenmai')
                  ->where('giakhuyenmai', '>', 0)
                  ->whereColumn('giakhuyenmai', '<', 'gia');
        }

        // Lọc sản phẩm còn hàng
        if ($request->boolean('in_stock')) {
            $query->where('soluong', '>', 0);
        }

        // Lọc theo trạng thái hiển thị
        if ($request->filled('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        }

        // Sắp xếp
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderByRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) DESC');
                break;
            case 'name_asc':
                $query->orderBy('ten', 'asc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Lấy số lượng phần tử trên 1 trang (mặc định 10)
        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        $sanpham = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách sản phẩm thành công',
            'data'    => $sanpham,
        ]);
    }

    /**
     * POST /api/san-pham
     * Thêm sản phẩm
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'danhmuc_id' => [
                'required',
                'integer',
                'exists:danhmuc,id',
            ],

            'thuonghieu_id' => [
                'nullable',
                'integer',
                'exists:thuonghieu,id',
            ],

            'ten' => [
                'required',
                'string',
                'max:255',
                'unique:sanpham,ten',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:sanpham,slug',
            ],

            'mota' => [
                'nullable',
                'string',
            ],

            'gia' => [
                'required',
                'numeric',
                'min:0',
            ],

            'giakhuyenmai' => [
                'nullable',
                'numeric',
                'min:0',
                'lte:gia',
            ],

            'soluong' => [
                'required',
                'integer',
                'min:0',
            ],

            // Đồng bộ key 'hinhanh'
            'hinhanh' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png,webp,gif',
                'max:5120', // Tối đa 5MB
            ],

            'trangthai' => [
                'required',
                Rule::in([
                    'hienthi',
                    'an',
                ]),
            ],

        ], [
            'ten.unique' => 'Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.',
        ]);

        // Nếu frontend không gửi slug thì tự tạo
        $validated['slug'] = $this->generateUniqueSlug(
            $request->slug ?: $request->ten
        );

        // SỬA: Upload hình ảnh sử dụng field 'hinhanh' và lưu vào thư mục 'sanpham'
        if ($request->hasFile('hinhanh')) {
            $validated['hinhanh'] = $request
                ->file('hinhanh')
                ->store('sanpham', 'public');
        }

        $sanpham = SanPham::create($validated);

        $sanpham->load([
            'danhmuc',
            'thuonghieu'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành công',
            'data' => $sanpham,
        ], 201);
    }

    /**
     * GET /api/san-pham/{id}
     * Chi tiết sản phẩm
     */
    public function show($id)
    {
        $sanpham = SanPham::with([
            'danhmuc',
            'thuonghieu'
        ])->find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm thành công',
            'data' => $sanpham,
        ]);
    }
    // Lấy sản phẩm cùng danh mục với sản phẩm hiện tại
    public function related($id)
    {
        $sanpham = SanPham::find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $sanphamLienQuan = SanPham::with([
            'danhmuc',
            'thuonghieu'
        ])
            ->where('danhmuc_id', $sanpham->danhmuc_id)
            ->where('id', '!=', $sanpham->id)
            ->orderBy('created_at', 'desc')
            ->limit(4)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm liên quan thành công',
            'data' => $sanphamLienQuan,
        ]);
    }
    /**
     * GET /api/san-pham/slug/{slug}
     * Lấy sản phẩm theo slug
     */
    public function showBySlug($slug)
    {
        $sanpham = SanPham::with([
            'danhmuc',
            'thuonghieu'
        ])
            ->where('slug', $slug)
            ->first();

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $sanpham,
        ]);
    }

    /**
     * PUT/PATCH /api/san-pham/{id}
     * Cập nhật sản phẩm
     */
    public function update(Request $request, $id)
    {
        $sanpham = SanPham::find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        $validated = $request->validate(
            [
                'danhmuc_id' => [
                    'sometimes',
                    'required',
                    'integer',
                    'exists:danhmuc,id',
                ],

                'thuonghieu_id' => [
                    'nullable',
                    'integer',
                    'exists:thuonghieu,id',
                ],

                'ten' => [
                    'sometimes',
                    'required',
                    'string',
                    'max:255',
                    Rule::unique('sanpham', 'ten')
                        ->ignore($sanpham->id),
                ],

                'slug' => [
                    'nullable',
                    'string',
                    'max:255',
                    Rule::unique('sanpham', 'slug')
                        ->ignore($sanpham->id),
                ],

                'mota' => [
                    'nullable',
                    'string',
                ],

                'gia' => [
                    'sometimes',
                    'required',
                    'numeric',
                    'min:0',
                ],

                'giakhuyenmai' => [
                    'nullable',
                    'numeric',
                    'min:0',
                ],

                'soluong' => [
                    'sometimes',
                    'required',
                    'integer',
                    'min:0',
                ],

                // SỬA: Validate đúng key 'hinhanh'
                'hinhanh' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp,gif',
                    'max:5120',
                ],

                'trangthai' => [
                    'sometimes',
                    'required',
                    Rule::in([
                        'hienthi',
                        'an',
                    ]),
                ],

            ],
            [
                'ten.unique' => 'Tên sản phẩm đã tồn tại. Vui lòng nhập tên khác.',
            ],
        );

        /*
    |--------------------------------------------------------------------------
    | Xử lý slug
    |--------------------------------------------------------------------------
    */

        if ($request->filled('slug')) {
            $validated['slug'] = $this->generateUniqueSlug(
                $request->slug,
                $sanpham->id
            );
        } elseif (
            $request->filled('ten') &&
            $request->ten !== $sanpham->ten
        ) {
            $validated['slug'] = $this->generateUniqueSlug(
                $request->ten,
                $sanpham->id
            );
        }

        /*
    |--------------------------------------------------------------------------
    | Kiểm tra giá khuyến mãi
    |--------------------------------------------------------------------------
    */

        $gia = $validated['gia'] ?? $sanpham->gia;

        $giakhuyenmai = array_key_exists(
            'giakhuyenmai',
            $validated
        )
            ? $validated['giakhuyenmai']
            : $sanpham->giakhuyenmai;

        if (
            $giakhuyenmai !== null &&
            $giakhuyenmai > $gia
        ) {
            return response()->json([
                'success' => false,
                'message' => 'Giá khuyến mãi không được lớn hơn giá bán',
            ], 422);
        }

        /*
    |--------------------------------------------------------------------------
    | Upload hình mới (SỬA: Đồng bộ key 'hinhanh' & thư mục 'sanpham')
    |--------------------------------------------------------------------------
    */

        if ($request->hasFile('hinhanh')) {

            // Xóa ảnh cũ trong thư mục storage nếu tồn tại
            if (
                $sanpham->hinhanh &&
                Storage::disk('public')->exists($sanpham->hinhanh)
            ) {
                Storage::disk('public')->delete($sanpham->hinhanh);
            }

            // Lưu ảnh mới vào thư mục 'sanpham' trên disk 'public'
            $validated['hinhanh'] = $request
                ->file('hinhanh')
                ->store('sanpham', 'public');
        }

        $sanpham->update($validated);

        $sanpham->load([
            'danhmuc',
            'thuonghieu'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $sanpham,
        ]);
    }


    /**
     * DELETE /api/san-pham/{id}
     * Xóa mềm sản phẩm.
     */
    public function destroy($id)
    {
        // Chỉ tìm sản phẩm chưa bị xóa mềm.
        $sanpham = SanPham::find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm',
            ], 404);
        }

        // Chỉ đánh dấu thời gian xóa, không xóa bản ghi và hình ảnh.
        $sanpham->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đưa sản phẩm vào thùng rác thành công',
        ]);
    }

    /**
     * GET /api/san-pham/thung-rac
     * Lấy danh sách sản phẩm đã xóa mềm.
     */
    public function trashed(Request $request)
    {
        $query = SanPham::onlyTrashed()
            ->with(['danhmuc', 'thuonghieu'])
            ->orderBy('deleted_at', 'desc');

        if ($request->filled('search')) {
            $query->where('ten', 'like', '%' . $request->search . '%');
        }

        $perPage = min(max($request->integer('per_page', 10), 1), 100);

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách thùng rác thành công',
            'data' => $query->paginate($perPage),
        ]);
    }

    /**
     * PATCH /api/san-pham/{id}/restore
     * Khôi phục sản phẩm đã xóa mềm.
     */
    public function restore($id)
    {
        $sanpham = SanPham::onlyTrashed()->find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong thùng rác',
            ], 404);
        }

        $sanpham->restore();

        return response()->json([
            'success' => true,
            'message' => 'Khôi phục sản phẩm thành công',
        ]);
    }

    /**
     * DELETE /api/san-pham/{id}/force-delete
     * Xóa vĩnh viễn sản phẩm.
     */
    public function forceDelete($id)
    {
        $sanpham = SanPham::onlyTrashed()->find($id);

        if (!$sanpham) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong thùng rác',
            ], 404);
        }

        // Xóa ảnh khỏi Storage chỉ khi xóa vĩnh viễn.
        if (
            $sanpham->hinhanh &&
            \Illuminate\Support\Facades\Storage::disk('public')
            ->exists($sanpham->hinhanh)
        ) {
            \Illuminate\Support\Facades\Storage::disk('public')
                ->delete($sanpham->hinhanh);
        }

        $sanpham->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Xóa vĩnh viễn sản phẩm thành công',
        ]);
    }


    /**
     * Tạo slug không bị trùng
     */
    private function generateUniqueSlug(
        string $value,
        $ignoreId = null
    ): string {
        $slug = Str::slug($value);

        if (!$slug) {
            $slug = 'san-pham';
        }

        $originalSlug = $slug;
        $count = 1;

        while (
            SanPham::where('slug', $slug)
            ->when(
                $ignoreId,
                function ($query) use ($ignoreId) {
                    $query->where(
                        'id',
                        '!=',
                        $ignoreId
                    );
                }
            )
            ->exists()
        ) {
            $slug = $originalSlug . '-' . $count;

            $count++;
        }

        return $slug;
    }
}
