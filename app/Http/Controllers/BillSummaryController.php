<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\BillHistory; // เพิ่มการใช้ BillHistory model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB; // นำเข้า DB สำหรับการทำธุรกรรม

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
                    $firstBill = $tableBills->sortBy('created_at')->first(); // ใช้บิลแรกสุด
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
                        'id' => $firstBill->id, // ใช้ id จากบิลแรกสุดในแต่ละโต๊ะ
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

    public function markAsPaid($table_number)
    {
        // หาบิลที่ต้องการชำระเงิน
        $bill = Bill::where('table_number', $table_number)->first();

        if (!$bill) {
            return response()->json(['error' => 'ไม่พบบิลนี้'], 404);
        }

        // เปลี่ยนสถานะของบิลให้เป็น 'paid'
        $bill->status = 'paid';

        // เริ่มต้นการทำธุรกรรม (transaction)
        DB::beginTransaction();

        try {
            // บันทึกบิล
            $bill->save();

            // ย้ายบิลไปที่ประวัติการสั่งซื้อ (BillHistory)
            BillHistory::create([
                'bill_id' => $bill->id,
                'total' => $bill->total,
                'items' => json_encode($bill->items),  // แปลง items เป็น JSON
                'table_number' => $bill->table_number,
                'status' => 'paid',  // เพิ่มสถานะที่ชำระแล้ว
            ]);

            // ถ้าทุกอย่างสำเร็จ คอมมิทธุรกรรม
            DB::commit();

            return response()->json(['message' => 'ชำระเงินเสร็จเรียบร้อย'], 200);

        } catch (\Exception $e) {
            // หากเกิดข้อผิดพลาด ทำการยกเลิกธุรกรรม
            DB::rollBack();
            return response()->json(['error' => 'เกิดข้อผิดพลาดในการย้ายบิลไปที่ประวัติการชำระเงิน: ' . $e->getMessage()], 500);
        }
    }
}
