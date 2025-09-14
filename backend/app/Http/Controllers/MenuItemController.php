<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Http\Resources\MenuItemResource;

class MenuItemController extends Controller
{
    /**
     * GET /api/menu-items
     * Query params: q, category, availability (1/0/true/false), sortBy, sortDir, per_page
     */
    public function index(Request $request)
    {
        $q        = $request->string('q')->toString();
        $category = $request->string('category')->toString();
        $avail    = $request->input('availability', null);
        $sortBy   = $request->input('sortBy', 'item_name');
        $sortDir  = strtolower($request->input('sortDir', 'asc')) === 'desc' ? 'desc' : 'asc';
        $perPage  = (int) ($request->input('per_page', 10));

        $query = MenuItem::query();

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('item_name', 'like', "%{$q}%")
                  ->orWhere('category', 'like', "%{$q}%");
            });
        }

        if ($category !== '') {
            $query->where('category', $category);
        }

        if (!is_null($avail)) {
            $bool = filter_var($avail, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if (!is_null($bool)) {
                $query->where('availability', $bool);
            }
        }

        // only allow sorting by known columns
        if (!in_array($sortBy, ['item_name','price','category','availability','created_at'], true)) {
            $sortBy = 'item_name';
        }

        $items = $query->orderBy($sortBy, $sortDir)->paginate($perPage);

        // Resource collection keeps paginator meta/links automatically
        return MenuItemResource::collection($items);
    }

    /**
     * GET /api/menu-items/{menuItem}
     */
    public function show(MenuItem $menuItem)
    {
        return new MenuItemResource($menuItem);
    }

    /**
     * POST /api/menu-items
     * Body: { item_name, price, category?, availability? }  (JSON or multipart)
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'item_name'    => ['required','string','max:255'],
            'price'        => ['required','numeric','min:0'],
            'category'     => ['nullable','string','max:255'],
            'availability' => ['nullable','boolean'],
            'image'        => ['sometimes','file','image','mimes:jpg,jpeg,png,webp','max:2048'],
            'image_alt'    => ['nullable','string','max:255'],
        ]);

        $menuItem = MenuItem::create([
            'item_name'    => $data['item_name'],
            'price'        => $data['price'],
            'category'     => $data['category'] ?? null,
            'availability' => array_key_exists('availability', $data) ? (bool)$data['availability'] : true,
            'image_path'   => null,
            'image_alt'    => $data['image_alt'] ?? null,
        ]);

        if ($request->hasFile('image')) {
            $this->storeImage($request, $menuItem);
        }

        return response()->json(new MenuItemResource($menuItem->fresh()), 201);
    }

    /**
     * PUT /api/menu-items/{menuItem}
     * Body: { item_name?, price?, category?, availability?, image? (optional), image_alt? }
     */
    public function update(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'item_name'    => ['sometimes','string','max:255'],
            'price'        => ['sometimes','numeric','min:0'],
            'category'     => ['sometimes','nullable','string','max:255'],
            'availability' => ['sometimes','boolean'],
            'image'        => ['sometimes','file','image','mimes:jpg,jpeg,png,webp','max:2048'],
            'image_alt'    => ['sometimes','nullable','string','max:255'],
        ]);

        $menuItem->fill($data);
        if (array_key_exists('availability', $data)) {
            $menuItem->availability = (bool)$data['availability'];
        }
        $menuItem->save();

        if ($request->hasFile('image')) {
            $this->storeImage($request, $menuItem);
        }

        return response()->json(new MenuItemResource($menuItem->fresh()));
    }

    /**
     * POST /api/menu-items/{menuItem}/image (multipart/form-data)
     */
    public function uploadImage(Request $request, MenuItem $menuItem)
    {
        $request->validate([
            'image'     => ['required','file','image','mimes:jpg,jpeg,png,webp','max:2048'],
            'image_alt' => ['nullable','string','max:255'],
        ]);

        $this->storeImage($request, $menuItem);

        if ($request->filled('image_alt')) {
            $menuItem->image_alt = $request->input('image_alt');
            $menuItem->save();
        }

        return response()->json(new MenuItemResource($menuItem->fresh()));
    }

    /**
     * DELETE /api/menu-items/{menuItem}
     */
    public function destroy(MenuItem $menuItem)
    {
        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }
        $menuItem->delete();

        return response()->json(['message' => 'Deleted']);
    }

    /* ------------ helpers ------------ */

    private function storeImage(Request $request, MenuItem $menuItem): void
    {
        $file = $request->file('image');
        $path = $file->store('menu_items', 'public');
        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }
        $menuItem->image_path = $path;
        $menuItem->save();
    }
}
