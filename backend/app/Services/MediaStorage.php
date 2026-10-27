<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/** Small validated public images live with the database, including on ephemeral free hosts. */
class MediaStorage
{
    public static function url(?string $path): ?string
    {
        if (!$path) return null;
        if (str_starts_with($path, 'media:'))
            return rtrim(config('app.url'), '/') . '/api/media/' . substr($path, 6);
        if (preg_match('~^https?://~i', $path)) return $path;
        return Storage::disk('public')->url(preg_replace('~^/?storage/~', '', $path));
    }

    public static function replace(Model $model, string $field, UploadedFile $file): void
    {
        $oldPath = $model->getAttribute($field);
        DB::transaction(function () use ($model, $field, $file, $oldPath) {
            $id = (string) Str::uuid();
            DB::table('media_assets')->insert([
                'id' => $id,
                'mime_type' => $file->getMimeType(),
                'content_base64' => base64_encode($file->getContent()),
            ]);
            $model->setAttribute($field, 'media:' . $id)->save();
            if ($oldPath && str_starts_with($oldPath, 'media:'))
                DB::table('media_assets')->where('id', substr($oldPath, 6))->delete();
        });
        if ($oldPath && !str_starts_with($oldPath, 'media:') && !preg_match('~^https?://~i', $oldPath))
            Storage::disk('public')->delete($oldPath);
    }

    public static function delete(?string $path): void
    {
        if (!$path) return;
        if (str_starts_with($path, 'media:'))
            DB::table('media_assets')->where('id', substr($path, 6))->delete();
        elseif (!preg_match('~^https?://~i', $path)) Storage::disk('public')->delete($path);
    }
}
