<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CustomerDashboardController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'Welcome to the Customer Dashboard']);
    }
}
