<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietDonHang extends Model
{
    use HasFactory;

    protected $table = 'chitietdonhang';

    protected $fillable = [
        'donhang_id',
        'sanpham_id',
        'ten_sanpham',
        'soluong',
        'gia',
        'thanhtien',
    ];

    protected $casts = [
        'soluong' => 'integer',
        'gia' => 'decimal:2',
        'thanhtien' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
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
     * Sản phẩm
     *
     * sanpham_id có thể NULL vì sản phẩm
     * có thể bị xóa sau khi đặt hàng.
     */
    public function sanpham()
    {
        return $this->belongsTo(
            SanPham::class,
            'sanpham_id'
        );
    }
}