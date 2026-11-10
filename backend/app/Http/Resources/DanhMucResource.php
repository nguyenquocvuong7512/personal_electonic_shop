<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->ten,
            'description' => $this->mota,
            'image'     => $this->hinhanh,
            'status'    => $this->trangthai,

            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Chỉ trả về khi Controller đã load relationship "children"
            'children' => CategoryResource::collection(
                $this->whenLoaded('children')
            ),
        ];
    }
}


