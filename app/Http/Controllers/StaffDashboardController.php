<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class StaffDashboardController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Welcome to the Staff Dashboard']);
    }
}
