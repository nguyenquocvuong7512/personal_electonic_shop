<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChiTietGioHang extends Model
{
    use HasFactory;

    protected $table = 'chitietgiohang';

    protected $fillable = [
        'giohang_id',
        'sanpham_id',
        'soluong',
    ];

    protected $casts = [
        'soluong' => 'integer',
    ];

    public function giohang()
    {
        return $this->belongsTo(GioHang::class, 'giohang_id');
    }

    public function sanpham()
    {
        return $this->belongsTo(SanPham::class, 'sanpham_id');
    }
}