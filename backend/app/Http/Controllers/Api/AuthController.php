<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\MemberResource;
use App\Models\NguoiDung;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        // 1. Lấy dữ liệu hợp lệ
        $data = $request->validated();

        // 2. Gán giá trị mặc định cho cột vaitro và trangthai
        $data['vaitro'] = $data['vaitro'] ?? 'thanhvien';
        $data['trangthai'] = $data['trangthai'] ?? 'hoatdong';

        // 3. Tạo tài khoản trong DB nguoidung
        $member = NguoiDung::create($data);

        // 4. Tạo Sanctum token
        $token = $member->createToken('web')->plainTextToken;

        // 5. Trả về Response
        return response()->json([
            'member' => new MemberResource($member),
            'token'  => $token,
        ], 201);
    }
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // 1. Tìm người dùng theo email
        $user = NguoiDung::where('email', $request->email)->first();

        // 2. Kiểm tra tài khoản và mật khẩu
        if (!$user || !Hash::check($request->password, $user->matkhau)) {
            return response()->json([
                'message' => 'Email hoặc mật khẩu không chính xác'
            ], 401);
        }

        // 3. Kiểm tra trạng thái tài khoản
        if ($user->trangthai !== 'hoatdong') {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt'
            ], 403);
        }

        // 4. Xóa tất cả token cũ
        // Mỗi tài khoản chỉ có một token hoạt động tại một thời điểm
        $user->tokens()->delete();

        // 5. Tạo token mới dựa trên vai trò
        $abilities = $user->vaitro === 'admin'
            ? ['admin:*']
            : ['user:*'];

        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        // 6. Trả về thông tin người dùng
        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'sodienthoai' => $user->sodienthoai,
                'diachi' => $user->diachi,
                'vaitro' => $user->vaitro,
                'trangthai' => $user->trangthai,
            ]
        ], 200);
    }
    public function adminLogin(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // 1. Tìm Admin bằng username (username chính là cột ten)
        $admin = Admin::where('ten', $request->username)->first();

        // 2. Kiểm tra username và mật khẩu
        if (!$admin || !Hash::check($request->password, $admin->matkhau)) {
            return response()->json([
                'message' => 'Username hoặc mật khẩu không chính xác'
            ], 401);
        }

        // 3. Kiểm tra trạng thái tài khoản
        if ($admin->trangthai !== 'hoatdong') {
            return response()->json([
                'message' => 'Tài khoản admin đã bị khóa hoặc chưa kích hoạt'
            ], 403);
        }

        // 4. Mỗi tài khoản chỉ có một token hoạt động
        $admin->tokens()->delete();

        // 5. Tạo token Admin
        $token = $admin->createToken(
            'admin',
            ['admin:*']
        )->plainTextToken;

        // 6. Trả về thông tin Admin + role
        return response()->json([
            'message' => 'Đăng nhập admin thành công',
            'token' => $token,
            'user' => [
                'id' => $admin->id,
                'username' => $admin->ten,
                'email' => $admin->email,
                'sodienthoai' => $admin->sodienthoai,
                'diachi' => $admin->diachi,
                'role' => $admin->vaitro,
                'trangthai' => $admin->trangthai,
            ]
        ], 200);
    }
    public function me(Request $request)
    {
        if (! $request->user()) {
            return response()->json([
                'message' => 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn'
            ], 401); // Trả về 401 Unauthorized chuẩn API
        }
        return new MemberResource($request->user());
    }

    /**
     * POST /api/logout — Đăng xuất (xóa token hiện tại)
     */
    public function logout(Request $request)
    {
        // Xóa token đang dùng của thiết bị hiện tại
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Đã đăng xuất thành công'
        ]);
    }
    public function updateProfile(Request $request)
    {
        // Lấy tài khoản đang đăng nhập bằng Sanctum
        $user = $request->user();

        // Kiểm tra dữ liệu gửi lên
        $validated = $request->validate([
            'ten' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:nguoidung,email,' . $user->id,
            'sodienthoai' => 'nullable|string|max:20',
            'diachi' => 'nullable|string',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ], [
            'ten.required' => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không đúng định dạng.',
            'email.unique' => 'Email này đã được sử dụng.',
            'avatar.image' => 'File tải lên phải là hình ảnh.',
            'avatar.mimes' => 'Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP.',
            'avatar.max' => 'Ảnh không được vượt quá 2MB.',
        ]);

        // Cập nhật thông tin cá nhân
        $user->ten = $validated['ten'];
        $user->email = $validated['email'];
        $user->sodienthoai = $validated['sodienthoai'] ?? null;
        $user->diachi = $validated['diachi'] ?? null;

        // Nếu người dùng có tải ảnh đại diện mới
        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
        }

        $user->save();

        return response()->json([
            'message' => 'Cập nhật thông tin cá nhân thành công.',
            'user' => [
                'id' => $user->id,
                'ten' => $user->ten,
                'email' => $user->email,
                'sodienthoai' => $user->sodienthoai,
                'diachi' => $user->diachi,
                'avatar' => $user->avatar,
                'vaitro' => $user->vaitro,
                'trangthai' => $user->trangthai,
            ],
        ]);
    }

    /**
     * POST /api/forgot-password
     * Tạo yêu cầu khôi phục mật khẩu và sinh mã token đặt lại
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Vui lòng nhập địa chỉ email.',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
        ]);

        $email = trim($request->email);
        $user = NguoiDung::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản với email này trong hệ thống.',
            ], 404);
        }

        if ($user->trangthai !== 'hoatdong') {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn hiện đang bị khóa hoặc ngưng hoạt động.',
            ], 403);
        }

        // Tạo mã khôi phục ngẫu nhiên (6 ký tự chữ hoa và số)
        $token = strtoupper(Str::random(6));

        // Lưu vào bảng nguoidung
        $user->reset_token = $token;
        $user->reset_token_expire = Carbon::now()->addMinutes(30);
        $user->save();

        // Lưu bản ghi đồng bộ vào bảng password_reset_tokens
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => $token,
                'created_at' => Carbon::now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Mã xác thực khôi phục mật khẩu đã được tạo thành công (hiệu lực trong 30 phút).',
            'email' => $user->email,
            'reset_token' => $token,
        ]);
    }

    /**
     * POST /api/reset-password
     * Đặt lại mật khẩu mới thông qua mã token và email
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'matkhau' => 'required|string|min:6|confirmed',
        ], [
            'email.required' => 'Vui lòng cung cấp email tài khoản.',
            'email.email' => 'Email không đúng định dạng.',
            'token.required' => 'Vui lòng cung cấp mã xác thực.',
            'matkhau.required' => 'Vui lòng nhập mật khẩu mới.',
            'matkhau.min' => 'Mật khẩu mới phải có tối thiểu 6 ký tự.',
            'matkhau.confirmed' => 'Xác nhận mật khẩu mới không trùng khớp.',
        ]);

        $email = trim($request->email);
        $tokenInput = strtoupper(trim($request->token));

        $user = NguoiDung::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy tài khoản với email đã cung cấp.',
            ], 404);
        }

        // Kiểm tra tính hợp lệ của mã token
        $isValidToken = false;

        if ($user->reset_token && strtoupper(trim($user->reset_token)) === $tokenInput) {
            $isValidToken = true;
        } else {
            // Kiểm tra bảng dự phòng password_reset_tokens
            $record = DB::table('password_reset_tokens')
                ->where('email', $email)
                ->where('token', $tokenInput)
                ->first();
            if ($record) {
                $isValidToken = true;
            }
        }

        if (!$isValidToken) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực không chính xác hoặc không tồn tại.',
            ], 400);
        }

        // Kiểm tra thời hạn hiệu lực của mã (30 phút)
        if ($user->reset_token_expire && Carbon::now()->gt($user->reset_token_expire)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã xác thực đã hết hạn sử dụng. Vui lòng gửi lại yêu cầu quên mật khẩu mới.',
            ], 400);
        }

        // Cập nhật mật khẩu mới (model NguoiDung có cast hashed nên sẽ tự động băm)
        $user->matkhau = $request->matkhau;
        $user->reset_token = null;
        $user->reset_token_expire = null;
        $user->save();

        // Xóa mã token đã sử dụng trong password_reset_tokens và thu hồi các phiên đăng nhập cũ
        DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
        ]);
    }
}
