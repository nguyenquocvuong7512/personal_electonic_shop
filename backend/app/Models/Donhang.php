<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonHang extends Model
{
    use HasFactory;

    protected $table = 'donhang';

    protected $fillable = [
        'nguoidung_id',
        'khuyenmai_id',
        'hoten_nguoinhan',
        'email',
        'madon',
        'tongtien',
        'tiengiam',
        'thanhtien',
        'diachigiaohang',
        'sodienthoai',
        'phuongthucthanhtoan',
        'trangthai',
        'ghichu',
    ];

    protected $casts = [
        'tongtien' => 'decimal:2',
        'tiengiam' => 'decimal:2',
        'thanhtien' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Khách hàng đặt đơn
     */
    public function nguoidung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoidung_id');
    }

    /**
     * Khuyến mãi áp dụng cho đơn hàng
     */
    public function khuyenmai()
    {
        return $this->belongsTo(KhuyenMai::class, 'khuyenmai_id');
    }

    /**
     * Các sản phẩm trong đơn
     */
    public function chitiet()
    {
        return $this->hasMany(
            ChiTietDonHang::class,
            'donhang_id'
        );
    }

    /**
     * Lịch sử trạng thái
     */
    public function lichsu()
    {
        return $this->hasMany(
            LichSuDonHang::class,
            'donhang_id'
        )->orderBy('created_at', 'asc');
    }
}