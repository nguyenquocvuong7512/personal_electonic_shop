<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LichSuDonHang extends Model
{
    use HasFactory;

    protected $table = 'lichsudonhang';

    public $timestamps = false;

    protected $fillable = [
        'donhang_id',
        'nguoidung_id',
        'trangthaicu',
        'trangthaimoi',
        'ghichu',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Đơn hàng
     */
    public function donhang()
    {
        return $this->belongsTo(
            DonHang::class,
            'donhang_id'
        );
    }

    /**
     * Người thực hiện thay đổi
     *
     * Có thể là Admin.
     */
    public function nguoidung()
    {
        return $this->belongsTo(
            NguoiDung::class,
            'nguoidung_id'
        );
    }
}