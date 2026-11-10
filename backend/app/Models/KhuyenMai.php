<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KhuyenMai extends Model
{
    use HasFactory;

    protected $table = 'khuyenmai';

    protected $fillable = [
        'ma',
        'ten',
        'mota',
        'loaigiam',
        'giatri',
        'giatritoithieu',
        'giamtoida',
        'soluong',
        'daluotdung',
        'ngaybatdau',
        'ngayketthuc',
        'trangthai',
    ];

    protected $casts = [
        'giatri' => 'float',
        'giatritoithieu' => 'float',
        'giamtoida' => 'float',
        'soluong' => 'integer',
        'daluotdung' => 'integer',
        'ngaybatdau' => 'datetime',
        'ngayketthuc' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $appends = [
        'trangthai_hieuluc',
        'soluong_conlai',
    ];

    /**
     * Quan hệ với bảng Đơn hàng (1 Khuyến mãi có thể áp dụng cho nhiều Đơn hàng)
     */
    public function donhangs()
    {
        return $this->hasMany(DonHang::class, 'khuyenmai_id');
    }

    /**
     * Thuộc tính động: trạng thái hiệu lực theo thời gian
     * (chuabatdau, conhan, hethan)
     */
    public function getTrangthaiHieulucAttribute()
    {
        $now = now();

        if ($this->ngaybatdau && $now->lt($this->ngaybatdau)) {
            return 'chuabatdau';
        }

        if ($this->ngayketthuc && $now->gt($this->ngayketthuc)) {
            return 'hethan';
        }

        return 'conhan';
    }

    /**
     * Thuộc tính động: số lượt còn lại
     */
    public function getSoluongConlaiAttribute()
    {
        return max(0, (int) $this->soluong - (int) $this->daluotdung);
    }
}

