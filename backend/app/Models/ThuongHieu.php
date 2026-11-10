<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ThuongHieu extends Model
{
    use SoftDeletes;

    protected $table = 'thuonghieu';

    protected $fillable = [
        'ten',
        'slug',
        'mota',
        'hinhanh',
        'trangthai',
    ];

    public function sanpham()
    {
        return $this->hasMany(
            SanPham::class,
            'thuonghieu_id'
        );
    }
}