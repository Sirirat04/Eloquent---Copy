<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillItem extends Model
{
    use HasFactory;

    protected $fillable = ['bill_id', 'product_id', 'quantity', 'price'];

    public function bill()
    {
        return $this->belongsTo(Bill::class, 'bill_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function billHistory()
    {
        return $this->belongsTo(BillHistory::class, 'bill_id', 'id'); // ✅ Ensure correct FK
    }
}
