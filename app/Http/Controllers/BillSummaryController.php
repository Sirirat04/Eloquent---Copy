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
                ->doesntHave('history') // ✅ ใช้ doesn'tHave แทน
                ->get()
                ->groupBy('table_number')
                ->map(function ($tableBills) {
                    $total = $tableBills->sum('total');
                    $items = $tableBills->flatMap->items
                        ->groupBy('product_id')
                        ->map(function ($productItems) {
                            $quantity = $productItems->sum('quantity');
                            $price = $productItems->sum('price');
                            $product = optional($productItems->first())->product;
                            return [
                                'product' => $product,
                                'quantity' => $quantity,
                                'price' => $price,
                            ];
                        })
                        ->values();
                    return [
                        'table_number' => $tableBills->first()->table_number,
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
