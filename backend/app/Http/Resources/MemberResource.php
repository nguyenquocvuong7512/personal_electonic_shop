<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'ten'         => $this->ten,
            'email'       => $this->email,
            'sodienthoai' => $this->sodienthoai,
            'diachi'      => $this->diachi,
            'avatar'      => $this->avatar,
            'vaitro'      => $this->vaitro,
            'trangthai'   => $this->trangthai
            
        ];
    }
}