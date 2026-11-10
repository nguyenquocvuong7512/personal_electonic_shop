<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GioHang extends Model
{
    use HasFactory;

    protected $table = 'giohang';

    protected $fillable = [
        'nguoidung_id',
        'session_id',
    ];

    public function nguoidung()
    {
        return $this->belongsTo(NguoiDung::class, 'nguoidung_id');
    }

    public function chitiet()
    {
        return $this->hasMany(ChiTietGioHang::class, 'giohang_id');
    }
}