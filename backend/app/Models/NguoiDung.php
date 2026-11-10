<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class NguoiDung extends Authenticatable
{
    use HasApiTokens, Notifiable, SoftDeletes;

    protected $table = 'nguoidung';

    protected $fillable = [
        'ten',
        'email',
        'matkhau',
        'sodienthoai',
        'diachi',
        'avatar',
        'vaitro',
        'trangthai',
        'reset_token',
        'reset_token_expire',
    ];

    public function getAuthPassword()
    {
        return $this->matkhau;
    }

    protected $hidden = [
        'matkhau',
        'reset_token',
    ];

    protected function casts(): array
    {
        return [
            'matkhau' => 'hashed', // Tự động băm mật khẩu khi lưu
            'reset_token_expire' => 'datetime',
        ];
    }

    // ==========================================
    // BỔ SUNG CÁC HÀM TIỆN ÍCH PHÂN QUYỀN
    // ==========================================

    /**
     * Kiểm tra tài khoản có phải Admin hay không
     */
    public function isAdmin(): bool
    {
        return $this->vaitro === 'admin';
    }

    /**
     * Kiểm tra tài khoản có phải Người dùng thường hay không
     */
    public function isUser(): bool
    {
        return $this->vaitro === 'user';
    }
}
