<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NguoiDung;
use Illuminate\Http\Request;

class NguoiDungController extends Controller
{
    /**
     * GET /api/nguoi-dung
     * Lấy danh sách người dùng có phân trang và tìm kiếm.
     */
    public function index(Request $request)
    {
        $query = NguoiDung::query()
            ->select([
                'id',
                'ten',
                'email',
                'sodienthoai',
                'diachi',
                'vaitro',
                'trangthai',
                'created_at',
            ]);

        // Tìm theo tên, email hoặc số điện thoại.
        if ($request->filled('keyword')) {
            $keyword = $request->keyword;

            $query->where(function ($q) use ($keyword) {
                $q->where('ten', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('sodienthoai', 'like', "%{$keyword}%");
            });
        }

        // Lọc theo vai trò nếu được yêu cầu.
        if ($request->filled('vaitro')) {
            $query->where('vaitro', $request->vaitro);
        }

        // Lọc theo trạng thái nếu được yêu cầu.
        if ($request->filled('trangthai')) {
            $query->where('trangthai', $request->trangthai);
        }

        $users = $query
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 10));

        return response()->json($users);
    }

    /**
     * Lay thong tin chi tiet nguoi dung.
     */
    public function show($id)
    {
        $user = NguoiDung::findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'sodienthoai' => $user->sodienthoai,
                'diachi' => $user->diachi,
                'vaitro' => $user->vaitro,
                'trangthai' => $user->trangthai,
            ],
        ]);
    }

    public function store(Request $request)
    {
        // Kiểm tra dữ liệu đầu vào.
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:nguoidung,email',
            'matkhau' => 'required|string|min:8',
            'sodienthoai' => 'nullable|string|max:20|unique:nguoidung,sodienthoai',
            'diachi' => 'nullable|string|max:255',
            'vaitro' => 'required|in:admin,thanhvien',
            'trangthai' => 'required|in:hoatdong,khoa',
        ]);

        // Tạo tài khoản mới.
        $user = NguoiDung::create([
            'ten' => $validated['ten'],
            'email' => $validated['email'],
            'matkhau' => $validated['matkhau'],
            'sodienthoai' => $validated['sodienthoai'] ?? null,
            'diachi' => $validated['diachi'] ?? null,
            'vaitro' => $validated['vaitro'],
            'trangthai' => $validated['trangthai'],
        ]);

        return response()->json([
            'message' => 'Tạo người dùng thành công.',
            'data' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'sodienthoai' => $user->sodienthoai,
                'diachi' => $user->diachi,
                'vaitro' => $user->vaitro,
                'trangthai' => $user->trangthai,
            ],
        ], 201);
    }

    /**
     * Cap nhat thong tin nguoi dung.
     */
    public function update(Request $request, $id)
    {
        $user = NguoiDung::findOrFail($id);

        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:nguoidung,email,' . $user->id,
            'sodienthoai' => 'nullable|string|max:20|',//unique:nguoidung,sodienthoai'. $user->id,
            'diachi' => 'nullable|string|max:255',
            'vaitro' => 'required|in:admin,thanhvien',
            'trangthai' => 'required|in:hoatdong,khoa',
        ]);

        // Khong cho phep tu ha quyen tai khoan dang dang nhap.
        $currentUser = $request->user();

        if (
            $currentUser &&
            (int) $user->id === (int) $currentUser->id &&
            $validated['vaitro'] !== 'admin'
        ) {
            return response()->json([
                'message' => 'Ban khong the tu ha quyen tai khoan dang dang nhap.',
            ], 422);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Cap nhat nguoi dung thanh cong.',
            'data' => $user->fresh()->makeHidden('matkhau'),
        ]);
    }
    
    /**
     * Lay danh sach nguoi dung da xoa mem.
     */
    public function trash(Request $request)
    {
        $query = NguoiDung::onlyTrashed()->select([
            'id',
            'ten',
            'email',
            'sodienthoai',
            'diachi',
            'vaitro',
            'trangthai',
            'created_at',
            'deleted_at',
        ]);

        if ($request->filled('keyword')) {
            $keyword = $request->keyword;

            $query->where(function ($q) use ($keyword) {
                $q->where('ten', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('sodienthoai', 'like', "%{$keyword}%");
            });
        }

        $users = $query->orderByDesc('deleted_at')
            ->paginate($request->integer('per_page', 10));

        return response()->json($users);
    }

    /**
     * Xoa mem nguoi dung.
     */
    public function destroy(Request $request, $id)
    {
        $user = NguoiDung::findOrFail($id);

        $currentUser = $request->user();

        // Khong cho phep admin tu xoa tai khoan dang dang nhap.
        if ($currentUser && (int) $user->id === (int) $currentUser->id) {
            return response()->json([
                'message' => 'Ban khong the tu xoa tai khoan dang dang nhap.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'Da dua nguoi dung vao thung rac.',
        ]);
    }
    /**
     * restore.
     */
    public function restore($id)
    {
        // Tìm tài khoản, kể cả tài khoản đã bị xóa mềm.
        $user = NguoiDung::withTrashed()->findOrFail($id);

        // Kiểm tra tài khoản có đang nằm trong thùng rác không.
        if (!$user->trashed()) {
            return response()->json([
                'message' => 'Tài khoản này chưa bị xóa.'
            ], 400);
        }

        // Khôi phục tài khoản bằng cách đặt deleted_at về NULL.
        $user->restore();

        return response()->json([
            'message' => 'Khôi phục tài khoản thành công.'
        ], 200);
    }

    public function forceDelete($id)
    {
        // Tìm tài khoản kể cả tài khoản đã xóa mềm.
        $user = NguoiDung::withTrashed()->findOrFail($id);

        // Chỉ cho phép xóa vĩnh viễn tài khoản trong thùng rác.
        if (!$user->trashed()) {
            return response()->json([
                'message' => 'Chỉ có thể xóa vĩnh viễn tài khoản trong thùng rác.'
            ], 400);
        }

        // Xóa bản ghi khỏi database.
        $user->forceDelete();

        return response()->json([
            'message' => 'Xóa vĩnh viễn tài khoản thành công.'
        ]);
    }
}
