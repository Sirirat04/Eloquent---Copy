<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillHistory extends Model
{
    use HasFactory;

    protected $fillable = ['bill_id', 'table_number', 'total']; // ✅ เพิ่ม bill_id

    public function bill()
    {
        return $this->belongsTo(Bill::class, 'bill_id'); // ✅ เชื่อมกับ Bill
    }

    public function items()
    {
        return $this->hasMany(BillItem::class, 'bill_id', 'bill_id')->with('product');
    }
}
