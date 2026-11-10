<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChuDeBaiViet extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'chudebaiviet';

    protected $fillable = [
        'ten',
        'slug',
        'mota',
        'trangthai',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    // Một chủ đề có nhiều bài viết
    public function baiviets()
    {
        return $this->hasMany(BaiViet::class, 'chudebaiviet_id');
    }
}
