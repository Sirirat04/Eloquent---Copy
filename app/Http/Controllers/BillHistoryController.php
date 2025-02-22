<?php

namespace App\Http\Controllers;

use App\Models\BillHistory;
use Illuminate\Http\Request;

class BillHistoryController extends Controller
{
    public function index()
    {
        $billHistories = BillHistory::with('items.product')->get();
        return response()->json($billHistories);
    }
}
