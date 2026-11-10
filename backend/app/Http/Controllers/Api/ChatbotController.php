<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SanPham;
use App\Models\DanhMuc;
use App\Models\ThuongHieu;
use App\Models\KhuyenMai;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ChatbotController extends Controller
{
    /**
     * GET /api/chatbot/policies
     * Cung cấp nội dung chính sách chính thức của cửa hàng
     */
    public function policies()
    {
        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin chính sách thành công',
            'data' => [
                'store_info' => [
                    'name' => 'Website Bán Hàng Công Nghệ & Điện Tử',
                    'hotline' => '1800 6868',
                    'operating_hours' => '8:00 - 21:30 (Tất cả các ngày trong tuần)',
                    'address' => '123 Đường Công Nghệ, Quận 1, TP. Hồ Chí Minh',
                    'email' => 'lienhe@websitebanhang.vn',
                ],
                'shipping' => [
                    'title' => 'Chính sách Giao Hàng & Vận Chuyển',
                    'standard_fee' => '30.000 đ toàn quốc',
                    'free_shipping_threshold' => 'Miễn phí giao hàng cho đơn hàng từ 500.000 đ trở lên',
                    'delivery_time' => 'Nội thành TP.HCM: 1 - 2 ngày; Các tỉnh thành khác: 2 - 4 ngày làm việc',
                    'partners' => 'Giao Hàng Nhanh (GHN), Viettel Post, Shopee Xpress',
                    'inspection' => 'Khách hàng ĐƯỢC PHÉP đồng kiểm (kiểm tra ngoại quan sản phẩm trước khi thanh toán)',
                ],
                'return_policy' => [
                    'title' => 'Chính sách Đổi Trả Sản Phẩm',
                    'period' => 'Đổi mới trong vòng 7 ngày đầu tiên kể từ khi nhận hàng',
                    'conditions' => [
                        'Sản phẩm bị lỗi kỹ thuật hoặc lỗi phần cứng do nhà sản xuất',
                        'Sản phẩm còn nguyên hộp, đầy đủ phụ kiện, quà tặng kèm theo (nếu có)',
                        'Thân máy không bị trầy xước, móp méo, nứt vỡ hoặc có dấu hiệu can thiệp',
                        'Có hóa đơn mua hàng hoặc số điện thoại đặt hàng trùng khớp trên hệ thống',
                    ],
                    'refund_time' => 'Xử lý đổi sản phẩm mới trong 1 - 3 ngày làm việc sau khi thẩm định',
                ],
                'warranty' => [
                    'title' => 'Chính sách Bảo Hành Chính Hãng',
                    'duration' => '12 tháng chính hãng (hoặc theo quy chuẩn từng hãng sản xuất)',
                    'type' => 'Bảo hành điện tử thông qua Số điện thoại đặt hàng / Serial Number',
                    'support' => 'Tiếp nhận bảo hành tại tất cả showroom hoặc gửi qua bưu điện về trung tâm bảo hành',
                ],
                'payment' => [
                    'title' => 'Phương Thức Thanh Toán Hỗ Trợ',
                    'methods' => [
                        'COD (Cash on Delivery) - Thanh toán tiền mặt khi nhận hàng',
                        'Chuyển khoản ngân hàng trực tiếp qua mã QR an toàn',
                        'Thanh toán trực tuyến qua VNPAY / Ví điện tử',
                    ],
                ],
            ]
        ]);
    }

    /**
     * POST /api/chatbot/compare
     * So sánh 2 hoặc nhiều sản phẩm dựa trên dữ liệu thật
     */
    public function compare(Request $request)
    {
        $request->validate([
            'ids' => 'nullable|array',
            'ids.*' => 'integer',
            'names' => 'nullable|array',
            'names.*' => 'string|max:100',
        ]);

        $ids = $request->input('ids', []);
        $names = $request->input('names', []);

        $query = SanPham::with(['danhmuc', 'thuonghieu']);

        if (!empty($ids)) {
            $query->whereIn('id', $ids);
        } elseif (!empty($names)) {
            $query->where(function ($q) use ($names) {
                foreach ($names as $name) {
                    $trimmed = trim($name);
                    if ($trimmed !== '') {
                        $q->orWhere('ten', 'like', '%' . $trimmed . '%');
                    }
                }
            });
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp ít nhất 2 sản phẩm để so sánh',
                'data' => [],
            ], 422);
        }

        $products = $query->take(4)->get();

        if ($products->count() < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đủ ít nhất 2 sản phẩm tương ứng trong cửa hàng để so sánh',
                'data' => $products,
            ]);
        }

        // Tạo bảng so sánh chi tiết
        $comparison = [];
        foreach ($products as $p) {
            $realPrice = ($p->giakhuyenmai && $p->giakhuyenmai > 0) ? (float) $p->giakhuyenmai : (float) $p->gia;
            $comparison[] = [
                'id' => $p->id,
                'ten' => $p->ten,
                'slug' => $p->slug,
                'hinhanh' => $p->hinhanh,
                'gia_goc' => (float) $p->gia,
                'gia_ban' => $realPrice,
                'giam_gia' => ($p->giakhuyenmai && $p->giakhuyenmai < $p->gia) ? ((float) $p->gia - (float) $p->giakhuyenmai) : 0,
                'danhmuc' => $p->danhmuc ? $p->danhmuc->ten : 'Chưa phân loại',
                'thuonghieu' => $p->thuonghieu ? $p->thuonghieu->ten : 'Khác',
                'tonkho' => $p->soluong,
                'tinh_trang' => ($p->soluong > 0) ? 'Còn hàng' : 'Tạm hết hàng',
                'mota' => $p->mota,
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'So sánh sản phẩm thành công',
            'data' => $comparison,
        ]);
    }

    /**
     * GET /api/chatbot/stock
     * Kiểm tra số lượng tồn kho theo id hoặc từ khóa
     */
    public function checkStock(Request $request)
    {
        $id = $request->input('id');
        $keyword = trim($request->input('keyword', ''));

        $query = SanPham::with(['danhmuc', 'thuonghieu']);

        if ($id) {
            $product = $query->find($id);
        } elseif ($keyword !== '') {
            $product = $query->where('ten', 'like', '%' . $keyword . '%')->first();
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp ID hoặc tên sản phẩm cần kiểm tra tồn kho',
            ], 422);
        }

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm trong hệ thống',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Kiểm tra tồn kho thành công',
            'data' => [
                'id' => $product->id,
                'ten' => $product->ten,
                'slug' => $product->slug,
                'hinhanh' => $product->hinhanh,
                'gia' => (float) $product->gia,
                'giakhuyenmai' => $product->giakhuyenmai ? (float) $product->giakhuyenmai : null,
                'soluong' => (int) $product->soluong,
                'con_hang' => ($product->soluong > 0),
                'trangthai' => $product->trangthai,
            ]
        ]);
    }

    /**
     * GET /api/chatbot/consult
     * Tư vấn sản phẩm theo danh mục, thương hiệu, ngân sách và nhu cầu
     */
    public function consult(Request $request)
    {
        $query = SanPham::with(['danhmuc', 'thuonghieu'])->where('trangthai', 'hienthi');

        // Lọc danh mục theo tên hoặc ID
        if ($request->filled('category')) {
            $catName = $request->input('category');
            $query->whereHas('danhmuc', function ($q) use ($catName) {
                $q->where('ten', 'like', '%' . $catName . '%');
            });
        } elseif ($request->filled('danhmuc_id')) {
            $query->where('danhmuc_id', $request->integer('danhmuc_id'));
        }

        // Lọc thương hiệu theo tên hoặc ID
        if ($request->filled('brand')) {
            $brandName = $request->input('brand');
            $query->whereHas('thuonghieu', function ($q) use ($brandName) {
                $q->where('ten', 'like', '%' . $brandName . '%');
            });
        } elseif ($request->filled('thuonghieu_id')) {
            $query->where('thuonghieu_id', $request->integer('thuonghieu_id'));
        }

        // Lọc ngân sách (tính trên giá bán thực tế)
        if ($request->filled('budget_min')) {
            $min = (float) $request->input('budget_min');
            $query->whereRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) >= ?', [$min]);
        }
        if ($request->filled('budget_max')) {
            $max = (float) $request->input('budget_max');
            $query->whereRaw('COALESCE(NULLIF(giakhuyenmai, 0), gia) <= ?', [$max]);
        }

        // Lọc từ khóa nhu cầu (học tập, văn phòng, gaming, đồ họa...)
        if ($request->filled('keyword')) {
            $kw = $request->input('keyword');
            $query->where(function ($q) use ($kw) {
                $q->where('ten', 'like', '%' . $kw . '%')
                  ->orWhere('mota', 'like', '%' . $kw . '%');
            });
        }

        // Ưu tiên sản phẩm còn hàng và giảm giá
        $products = $query->orderByRaw('CASE WHEN soluong > 0 THEN 0 ELSE 1 END')
                          ->orderBy('created_at', 'desc')
                          ->take(6)
                          ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh sách tư vấn thành công',
            'data' => $products,
        ]);
    }
}

