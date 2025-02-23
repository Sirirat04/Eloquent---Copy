<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillHistory extends Model
{
    use HasFactory;

    protected $fillable = ['bill_id', 'table_number', 'total'];

    // ความสัมพันธ์กับ Bill
    public function bill()
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }

    // ความสัมพันธ์กับ BillItem และ Product
    public function items()
    {
        return $this->morphMany(BillItem::class, 'billable');
    }
}
