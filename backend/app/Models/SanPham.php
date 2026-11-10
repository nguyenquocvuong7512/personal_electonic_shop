<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SanPham extends Model
{
    use HasFactory,SoftDeletes;

    protected $table = 'sanpham';

    protected $fillable = [
        'danhmuc_id',
        'thuonghieu_id',
        'ten',
        'slug',
        'mota',
        'gia',
        'giakhuyenmai',
        'soluong',
        'hinhanh',
        'trangthai',
    ];

    protected $casts = [
        'gia' => 'decimal:2',
        'giakhuyenmai' => 'decimal:2',
        'soluong' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function danhmuc()
    {
        return $this->belongsTo(DanhMuc::class, 'danhmuc_id');
    }

    public function thuonghieu()
    {
        return $this->belongsTo(ThuongHieu::class, 'thuonghieu_id');
    }
}