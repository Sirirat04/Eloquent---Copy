<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillSummariesTable extends Migration
{
    public function up()
    {
        Schema::create('bill_summaries', function (Blueprint $table) {
            $table->id();
            $table->integer('table_number');
            $table->decimal('total', 8, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('bill_summaries');
    }
}
