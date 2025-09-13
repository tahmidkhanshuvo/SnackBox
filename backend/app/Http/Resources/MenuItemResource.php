<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuItemResource extends JsonResource
{
    /** Keep default top-level "data" so pagination works */
    public static $wrap = 'data';

    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->item_name,                 // DB -> API
            'price'        => (float) $this->price,
            'category'     => $this->category,
            'availability' => (bool) $this->availability,
            'image_url'    => $this->image_url,                  // from model accessor
            'image_alt'    => $this->image_alt,
            'stock'        => (int) $this->stock,                // from model accessor

            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
