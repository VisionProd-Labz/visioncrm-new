<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('data_retention_policies', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');
            $table->integer('retention_days');
            $table->string('date_field')->default('created_at');
            $table->json('conditions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('description')->nullable();
            $table->timestamps();
            
            $table->unique(['entity_type', 'is_active']);
            $table->index(['entity_type', 'is_active']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('data_retention_policies');
    }
};
