<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SanPhamResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'danhmuc_id' => $this->danhmuc_id,
            'thuonghieu_id' => $this->thuonghieu_id,

            'ten' => $this->ten,
            'slug' => $this->slug,
            'mota' => $this->mota,

            'gia' => $this->gia,
            'giakhuyenmai' => $this->giakhuyenmai,

            'soluong' => $this->soluong,
            'hinhanh' => $this->hinhanh,
            'trangthai' => $this->trangthai,

            'danhmuc' => $this->whenLoaded('danhmuc', function () {
                return [
                    'id' => $this->danhmuc->id,
                    'ten' => $this->danhmuc->ten,
                ];
            }),

            'thuonghieu' => $this->whenLoaded('thuonghieu', function () {
                return [
                    'id' => $this->thuonghieu->id,
                    'ten' => $this->thuonghieu->ten,
                    'slug' => $this->thuonghieu->slug,
                ];
            }),

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}