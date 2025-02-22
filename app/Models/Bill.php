<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    use HasFactory;

    protected $fillable = ['table_number', 'total', 'status'];

    // ความสัมพันธ์ไปยัง BillItem
    public function items()
    {
        return $this->hasMany(BillItem::class);
    }

    // 🔥 เพิ่มความสัมพันธ์ไปยัง BillHistory
    public function history()
    {
        return $this->hasOne(BillHistory::class, 'table_number', 'table_number');
    }
}
