<?php

namespace App\Http\Controllers;

use App\Models\BillHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Bill;

class BillHistoryController extends Controller
{
    public function index()
    {
        $billHistories = Bill::with('items.product')
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($billHistories as $bill) {
            $calculatedTotal = $bill->items->sum('price');
            Log::info("Bill #{$bill->id} - Expected Total: $calculatedTotal, Saved Total: {$bill->total}");
        }

        return response()->json($billHistories);
    }
    public function getHistory()
{
    $history = BillHistory::all();  // ดึงข้อมูลประวัติการชำระเงิน
    return response()->json($history);
}

}
