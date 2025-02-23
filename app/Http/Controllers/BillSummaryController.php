<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;


class BillSummaryController extends Controller
{
    public function summary()
    {
        try {
            $bills = Bill::with('items.product')
                ->where('status', 'completed')
                ->doesntHave('history')
                ->get()
                ->groupBy('table_number')
                ->map(function ($tableBills) {
                    $firstBill = $tableBills->sortBy('created_at')->first(); // ✅ ใช้บิลแรกสุด
                    $total = $tableBills->sum('total');

                    $items = $tableBills->flatMap->items
                        ->groupBy('product_id')
                        ->map(function ($productItems) {
                            return [
                                'product' => optional($productItems->first())->product,
                                'quantity' => $productItems->sum('quantity'),
                                'price' => $productItems->sum('price'),
                            ];
                        })
                        ->values();

                    return [
                        'id' => $firstBill->id, // ✅ ใช้ id จากบิลแรกสุดในแต่ละโต๊ะ
                        'table_number' => $firstBill->table_number,
                        'total' => $total,
                        'items' => $items,
                    ];
                })
                ->values();

            return response()->json($bills);
        } catch (\Exception $e) {
            Log::error('Error in Bill Summary: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch bill summary'], 500);
        }
    }
}
