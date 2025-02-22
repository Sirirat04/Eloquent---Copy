<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BillHistory extends Model
{
    use HasFactory;

    protected $fillable = ['table_number', 'total'];

    public function items()
    {
        return $this->hasMany(BillItem::class, 'bill_id');
    }
}
