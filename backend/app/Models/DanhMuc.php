<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DanhMuc extends Model
{
    use HasFactory, SoftDeletes;

    // Tên bảng trong CSDL
    protected $table = 'danhmuc';

    // Khóa chính (mặc định là id, kiểu bigint unsigned)
    protected $primaryKey = 'id';

    // Cho phép gán hàng loạt (Mass Assignment) bao gồm cả parent_id
    //định nghĩa thuộc tính có thể gán hàng loạt (Mass Assignment) bao gồm cả parent_id
    protected $fillable = [
        'parent_id',
        'ten',
        'mota',
        'trangthai',
    ];

    // Ep kiểu dữ liệu thuộc tính
    protected $casts = [
        'parent_id'  => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /* =========================================================================
     * RELATIONSHIPS (QUAN HỆ ĐỆ QUY CHA - CON)
     * ========================================================================= */

    /**
     * Lấy danh mục cha của danh mục hiện tại.
     */
    public function parent()
    {
        return $this->belongsTo(DanhMuc::class, 'parent_id');
    }

    /**
     * Lấy danh sách các danh mục con trực tiếp (cấp 1).
     */
    public function children()
    {
        return $this->hasMany(DanhMuc::class, 'parent_id');
    }

    /**
     * Lấy danh sách danh mục con theo dạng đệ quy (nhiều cấp lồng nhau).
     */
    public function childrenRecursive()
    {
        return $this->children()->with('childrenRecursive');
    }

    public function products()
    {
        return $this->hasMany(SanPham::class, 'danhmuc_id');
    }
}