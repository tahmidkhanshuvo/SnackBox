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

Route::get('/healthz', fn () => response()->json(['ok' => true, 'time' => now()]));

/*
|--------------------------------------------------------------------------
| Public catalog
|--------------------------------------------------------------------------
*/
Route::get('/menu-items', [MenuItemController::class, 'index']);
Route::get('/menu-items/{menuItem}', [MenuItemController::class, 'show'])->whereNumber('menuItem');
Route::get('/menu-items/{menuItem}/stock', [InventoryMovementController::class, 'stock'])->whereNumber('menuItem');

/*
|--------------------------------------------------------------------------
| Auth (Sanctum-protected; session cookie established via web.php)
|--------------------------------------------------------------------------
*/
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me', [AuthController::class, 'updateMe']);
});

/*
|--------------------------------------------------------------------------
| Authenticated API (Sanctum cookie session)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ---- Menu + Inventory
    Route::post('/menu-items', [MenuItemController::class, 'store']);
    Route::post('/menu-items/{menuItem}/image', [MenuItemController::class, 'uploadImage'])->whereNumber('menuItem');
    Route::put('/menu-items/{menuItem}', [MenuItemController::class, 'update'])->whereNumber('menuItem');
    Route::delete('/menu-items/{menuItem}', [MenuItemController::class, 'destroy'])->whereNumber('menuItem');
    Route::post('/menu-items/{menuItem}/inventory/move', [InventoryMovementController::class, 'store'])->whereNumber('menuItem');
    Route::get('/menu-items/{menuItem}/movements', [InventoryMovementController::class, 'index'])->whereNumber('menuItem');

    // ---- Staff & Shifts
    Route::get('/staff', [StaffController::class, 'index']);
    Route::post('/staff', [StaffController::class, 'store']);
    Route::get('/staff/{staff}', [StaffController::class, 'show'])->whereNumber('staff');
    Route::put('/staff/{staff}', [StaffController::class, 'update'])->whereNumber('staff');
    Route::patch('/staff/{staff}/toggle', [StaffController::class, 'toggleActive'])->whereNumber('staff');

    Route::get('/staff/{staff}/shifts', [StaffController::class, 'shifts'])->whereNumber('staff');
    Route::get('/shifts', [ShiftController::class, 'index']);
    Route::post('/shifts', [ShiftController::class, 'store']);
    Route::get('/shifts/{shift}', [ShiftController::class, 'show'])->whereNumber('shift');
    Route::put('/shifts/{shift}', [ShiftController::class, 'update'])->whereNumber('shift');
    Route::patch('/shifts/{shift}/toggle', [ShiftController::class, 'toggleActive'])->whereNumber('shift');
    Route::patch('/shifts/{shift}/accept', [ShiftController::class, 'accept'])->whereNumber('shift');
    Route::patch('/shifts/{shift}/request-change', [ShiftController::class, 'requestChange'])->whereNumber('shift');
    Route::patch('/shifts/{shift}/mark-late', [ShiftController::class, 'markLate'])->whereNumber('shift');
    Route::patch('/shifts/{shift}/mark-absent', [ShiftController::class, 'markAbsent'])->whereNumber('shift');

    // ---- Salaries
    Route::get('/salaries', [SalaryController::class, 'index']);
    Route::post('/salaries', [SalaryController::class, 'store']);
    Route::patch('/salaries/{salary}/mark-paid', [SalaryController::class, 'markPaid'])->whereNumber('salary');

    // ---- Complaints
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/complaints', [ComplaintController::class, 'index']);
    Route::patch('/complaints/{complaint}', [ComplaintController::class, 'update'])->whereNumber('complaint');
    Route::patch('/complaints/{complaint}/assign/{staff}', [ComplaintController::class, 'assign'])->whereNumber('complaint')->whereNumber('staff');
    Route::patch('/complaints/{complaint}/resolve', [ComplaintController::class, 'resolve'])->whereNumber('complaint');
    Route::patch('/complaints/{complaint}/reply', [ComplaintController::class, 'reply'])->whereNumber('complaint');

    // ---- Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{order}', [OrderController::class, 'show'])->whereNumber('order');
    Route::post('/orders/{order}/items', [OrderController::class, 'addItem'])->whereNumber('order');
    Route::delete('/orders/{order}/items/{orderItem}', [OrderController::class, 'removeItem'])
        ->whereNumber('order')->whereNumber('orderItem');
    Route::patch('/orders/{order}/status', [OrderController::class, 'updateStatus'])->whereNumber('order');
    Route::patch('/orders/{order}', [OrderController::class, 'updateStatus'])->whereNumber('order');

    /*
    |--------------------------------------------------------------------------
    | Admin area (custom middleware)
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('admin.only')->group(function () {
        Route::get('/pending-users', [AdminController::class, 'pendingUsers']);
        Route::post('/approve-user/{id}', [AdminController::class, 'approveUser'])->whereNumber('id');
        Route::get('/menu-items', [AdminController::class, 'adminMenuItems']);
        Route::get('/orders', [AdminController::class, 'adminOrders']);
    });
});
