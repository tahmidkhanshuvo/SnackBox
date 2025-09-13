<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class MenuItemResource extends JsonResource
{
    /**
     * Keep default top-level key "data" so pagination works as:
     * { data: [...], links: {...}, meta: {...} }
     */
    public static $wrap = 'data';

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $imageUrl = $this->image_path
            ? Storage::disk('public')->url($this->image_path)
            : null;

        return [
            'id'           => $this->id,
            'name'         => $this->item_name,              // map DB -> API
            'price'        => (float) $this->price,
            'category'     => $this->category,
            'availability' => (bool) $this->availability,
            'image_url'    => $imageUrl,
            'image_alt'    => $this->image_alt,

            // timestamps (useful for admin UI / sorting)
            'created_at'   => $this->created_at,
            'updated_at'   => $this->updated_at,
        ];
    }
}
