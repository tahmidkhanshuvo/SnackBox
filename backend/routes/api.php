<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MenuItemController;
use App\Http\Controllers\InventoryMovementController;
use App\Http\Controllers\StaffController;
use App\Http\Controllers\SalaryController;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\ShiftController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Sanctum SPA cookie auth flow (for the React app):
| 1) Frontend/Postman calls GET  /sanctum/csrf-cookie  (sets XSRF-TOKEN cookie)
| 2) Then POST /api/auth/register or /api/auth/login with X-XSRF-TOKEN header
|
| Token flow (for Postman/server-to-server):
| POST /api/auth/token  -> returns Bearer token (no CSRF/cookies)
| Then send Authorization: Bearer <token> to protected routes
*/

Route::get('/healthz', fn () => response()->json(['ok' => true, 'time' => now()]));

// --- Cookie/session auth (SPA) ---
Route::prefix('auth')->middleware('web')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::post('/logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me',        [AuthController::class, 'me'])->middleware('auth:sanctum');
});

// --- Token (Bearer) auth for Postman ---
Route::post('/auth/token',         [AuthController::class, 'tokenLogin'])->middleware('throttle:10,1');
Route::post('/auth/token/logout',  [AuthController::class, 'tokenLogout'])->middleware('auth:sanctum');

/*
|--------------------------------------------------------------------------
| Public endpoints (no auth)
|--------------------------------------------------------------------------
*/
Route::get('/menu-items',                  [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}',       [MenuItemController::class, 'show']);
Route::get('/menu-items/{menuItem}/stock', [InventoryMovementController::class, 'stock']);

/*
|--------------------------------------------------------------------------
| Protected endpoints (cookie session via Sanctum OR Bearer token)
|--------------------------------------------------------------------------
*/
Route::middleware(['web', 'auth:sanctum'])->group(function () {
    // Menu Items + Image upload
    Route::post('/menu-items',                              [MenuItemController::class, 'store']);
    Route::post('/menu-items/{menuItem}/image',             [MenuItemController::class, 'uploadImage']); // multipart/form-data
    Route::put('/menu-items/{menuItem}',                    [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{menuItem}',                 [MenuItemController::class, 'destroy']);

    // Inventory movements (auditable stock)
    Route::post('/menu-items/{menuItem}/inventory/move',    [InventoryMovementController::class, 'store']);
    Route::get('/menu-items/{menuItem}/movements',          [InventoryMovementController::class, 'index']);

    // Staff
    Route::get('/staff',                                    [StaffController::class, 'index']);
    Route::post('/staff',                                   [StaffController::class, 'store']);
    Route::get('/staff/{staff}',                            [StaffController::class, 'show']);
    Route::put('/staff/{staff}',                            [StaffController::class, 'update']);
    Route::patch('/staff/{staff}/toggle',                   [StaffController::class, 'toggleActive']);

    // Shifts
    Route::get('/shifts',                                   [ShiftController::class, 'index']);
    Route::post('/shifts',                                  [ShiftController::class, 'store']);
    Route::get('/shifts/{shift}',                           [ShiftController::class, 'show']);
    Route::put('/shifts/{shift}',                           [ShiftController::class, 'update']);
    Route::patch('/shifts/{shift}/toggle',                  [ShiftController::class, 'toggleActive']);

    // Salaries
    Route::get('/salaries',                                 [SalaryController::class, 'index']);
    Route::post('/salaries',                                [SalaryController::class, 'store']);
    Route::patch('/salaries/{salary}/mark-paid',            [SalaryController::class, 'markPaid']);

    // Complaints
    Route::post('/complaints',                              [ComplaintController::class, 'store']);
    Route::get('/complaints',                               [ComplaintController::class, 'index']);
    Route::patch('/complaints/{complaint}',                 [ComplaintController::class, 'update']);
    Route::patch('/complaints/{complaint}/assign/{staff}',  [ComplaintController::class, 'assign']);
    Route::patch('/complaints/{complaint}/resolve',         [ComplaintController::class, 'resolve']);

    // Orders
    Route::get('/orders',                                   [OrderController::class, 'index']);
    Route::post('/orders',                                  [OrderController::class, 'store']);
    Route::get('/orders/{order}',                           [OrderController::class, 'show']);
    Route::post('/orders/{order}/items',                    [OrderController::class, 'addItem']);
    Route::delete('/orders/{order}/items/{orderItem}',      [OrderController::class, 'removeItem']);
    Route::patch('/orders/{order}/status',                 [OrderController::class, 'updateStatus']); // note: extra brace fixed below
});
