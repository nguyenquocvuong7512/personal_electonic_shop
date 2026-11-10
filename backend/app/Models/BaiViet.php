<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BaiViet extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'baiviet';

    protected $fillable = [
        'chudebaiviet_id',
        'nguoidung_id',
        'tieude',
        'slug',
        'noidung',
        'hinhanh',
        'trangthai',
        'ngaydang',
    ];

    protected $casts = [
        'ngaydang' => 'datetime',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Bài viết thuộc một chủ đề
    public function chudebaiviet()
    {
        return $this->belongsTo(
            ChuDeBaiViet::class,
            'chudebaiviet_id'
        );
    }
}