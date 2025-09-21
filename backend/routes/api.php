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
use App\Http\Controllers\AdminController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes in this file are automatically prefixed with `/api`.
| Sanctum’s SPA auth cookies are handled automatically for these routes.
|
*/

/* -----------------------------
| Public health & catalog
|------------------------------*/
Route::get('/healthz', fn () => response()->json(['ok' => true, 'time' => now()]));

Route::get('/menu-items',                  [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}',       [MenuItemController::class, 'show']);
Route::get('/menu-items/{menuItem}/stock', [InventoryMovementController::class, 'stock']);

/* -----------------------------
| Authentication (rate-limited)
|------------------------------*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:6,1');
    Route::post('/login',    [AuthController::class, 'login'])->middleware('throttle:6,1');

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me',     [AuthController::class, 'me']);
        Route::patch('/me',   [AuthController::class, 'updateMe']);
        Route::post('/logout',[AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->get('/me', [AuthController::class, 'me']);

// Admin-specific authentication
Route::post('/admin/login', [AuthController::class, 'adminLogin'])->middleware('throttle:6,1');

/* -----------------------------
| Protected resources
|------------------------------*/
Route::middleware('auth:sanctum')->group(function () {
    // Menu items (manage + image)
    Route::post  ('/menu-items',                  [MenuItemController::class, 'store']);
    Route::post  ('/menu-items/{menuItem}/image', [MenuItemController::class, 'uploadImage']);
    Route::put   ('/menu-items/{menuItem}',       [MenuItemController::class, 'update']);
    Route::delete('/menu-items/{menuItem}',       [MenuItemController::class, 'destroy']);

    // Inventory movements
    Route::post('/menu-items/{menuItem}/inventory/move', [InventoryMovementController::class, 'store']);
    Route::get ('/menu-items/{menuItem}/movements',      [InventoryMovementController::class, 'index']);

    // Staff
    Route::get   ('/staff',                   [StaffController::class, 'index']);
    Route::post  ('/staff',                   [StaffController::class, 'store']);
    Route::get   ('/staff/{staff}',           [StaffController::class, 'show']);
    Route::put   ('/staff/{staff}',           [StaffController::class, 'update']);
    Route::patch ('/staff/{staff}/toggle',    [StaffController::class, 'toggleActive']);

    // Shifts
    Route::get   ('/shifts',                  [ShiftController::class, 'index']);
    Route::post  ('/shifts',                  [ShiftController::class, 'store']);
    Route::get   ('/shifts/{shift}',          [ShiftController::class, 'show']);
    Route::put   ('/shifts/{shift}',          [ShiftController::class, 'update']);
    Route::patch ('/shifts/{shift}/toggle',   [ShiftController::class, 'toggleActive']);

    // Salaries
    Route::get   ('/salaries',                [SalaryController::class, 'index']);
    Route::post  ('/salaries',                [SalaryController::class, 'store']);
    Route::patch ('/salaries/{salary}/mark-paid', [SalaryController::class, 'markPaid']);

    // Complaints
    Route::post  ('/complaints',                          [ComplaintController::class, 'store']);
    Route::get   ('/complaints',                          [ComplaintController::class, 'index']);
    Route::patch ('/complaints/{complaint}',              [ComplaintController::class, 'update']);
    Route::patch ('/complaints/{complaint}/assign/{staff}', [ComplaintController::class, 'assign']);
    Route::patch ('/complaints/{complaint}/resolve',      [ComplaintController::class, 'resolve']);

    // Orders
    Route::get    ('/orders',                              [OrderController::class, 'index']);
    Route::post   ('/orders',                              [OrderController::class, 'store']);
    Route::get    ('/orders/{order}',                      [OrderController::class, 'show'])->whereNumber('order');
    Route::post   ('/orders/{order}/items',                [OrderController::class, 'addItem'])->whereNumber('order');
    Route::delete ('/orders/{order}/items/{orderItem}',    [OrderController::class, 'removeItem'])
        ->whereNumber('order')->whereNumber('orderItem');
    Route::patch  ('/orders/{order}/status',               [OrderController::class, 'updateStatus'])->whereNumber('order');
    Route::patch  ('/orders/{order}',                      [OrderController::class, 'updateStatus'])->whereNumber('order');

    // Admin-specific routes
    Route::prefix('admin')->group(function () {
    Route::get('/pending-users', [AdminController::class, 'pendingUsers']);
    Route::post('/approve-user/{id}', [AdminController::class, 'approveUser'])->whereNumber('id');
    Route::get('/menu-items', [AdminController::class, 'adminMenuItems']);
    Route::get('/orders', [AdminController::class, 'adminOrders']);
    
    });
});