<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Laravel\Sanctum\HasApiTokens;

class Admin extends NguoiDung
{
    use HasApiTokens;

    protected $table = 'nguoidung';

    protected static function booted()
    {
        static::addGlobalScope('admin', function (Builder $builder) {
            $builder->where('vaitro', 'admin');
        });
    }
}