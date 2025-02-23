<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillItem;
use App\Models\BillSummary;
use App\Models\BillHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillController extends Controller
{
    public function index()
    {
        return Bill::with('items.product')->get();
    }

    public function store(Request $request)
    {
        $bill = Bill::create([
            'table_number' => $request->table_number,
            'total' => $request->total,
        ]);

        foreach ($request->items as $item) {
            BillItem::create([
                'bill_id' => $bill->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price'],
            ]);
        }

        return response()->json($bill->load('items.product'), 201);
    }

    public function complete(Request $request, $id)
    {
        try {
            $bill = Bill::findOrFail($id);
            $bill->status = 'completed';
            $bill->save();

            // Store the completed bill data in the BillSummary
            $billSummary = BillSummary::create([
                'table_number' => $bill->table_number,
                'total' => $bill->total,
            ]);

            foreach ($bill->items as $item) {
                BillItem::updateOrCreate(
                    ['bill_id' => $billSummary->id, 'product_id' => $item->product_id],
                    ['quantity' => $item->quantity, 'price' => $item->price]
                );
            }

            return response()->json($billSummary->load('items.product'), 200);
        } catch (\Exception $e) {
            Log::error('Failed to complete bill: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to complete bill'], 500);
        }
    }

    public function pay(Request $request)
    {
        try {
            $billSummary = BillSummary::where('table_number', $request->table_number)->firstOrFail();

            // Store the completed bill data in the BillHistory
            $billHistory = BillHistory::create([
                'table_number' => $billSummary->table_number,
                'total' => $billSummary->total,
            ]);

            foreach ($billSummary->items as $item) {
                BillItem::create([
                    'bill_id' => $billHistory->id,
                    'product_id' => $item->product_id,
                    'quantity' => $item->quantity,
                    'price' => $item->price,
                ]);
            }

            // Delete the bill and its items from the BillSummary table
            $billSummary->items()->delete();
            $billSummary->delete();

            return response()->json($billHistory->load('items.product'), 200);
        } catch (\Exception $e) {
            Log::error('Failed to process payment: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to process payment'], 500);
        }
    }
    public function updateItems(Request $request, $id)
    {
        try {
            $bill = Bill::findOrFail($id);

            if (!$request->has('items')) {
                return response()->json(['error' => 'No items provided'], 400);
            }

            $remainingItems = collect($request->items);

            foreach ($remainingItems as $item) {
                BillItem::where('id', $item['id'])->update(['quantity' => $item['quantity']]);
            }

            // ลบออเดอร์ที่ไม่มีอยู่ใน `items`
            BillItem::where('bill_id', $bill->id)
                ->whereNotIn('id', $remainingItems->pluck('id'))
                ->delete();

            // คำนวณราคารวมใหม่
            $newTotal = $remainingItems->sum(function ($item) {
                return $item['quantity'] * $item['price'];
            });

            // อัปเดตราคาบิล
            $bill->update(['total' => $newTotal]);

            return response()->json(['message' => 'Bill updated successfully', 'new_total' => $newTotal], 200);
        } catch (\Exception $e) {
            Log::error('Failed to update bill items: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update bill items'], 500);
        }
    }
    public function destroy($id)
    {
        try {
            $bill = Bill::findOrFail($id);
            $bill->items()->delete(); // ✅ ลบรายการอาหารในบิล
            $bill->delete(); // ✅ ลบบิล

            return response()->json(['message' => 'ลบบิลเรียบร้อยแล้ว'], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'เกิดข้อผิดพลาดในการลบบิล'], 500);
        }
    }
}
