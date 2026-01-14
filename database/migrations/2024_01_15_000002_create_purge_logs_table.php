<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('purge_logs', function (Blueprint $table) {
            $table->id();
            $table->string('entity_type');
            $table->integer('records_purged');
            $table->datetime('cutoff_date');
            $table->integer('retention_days');
            $table->json('additional_info')->nullable();
            $table->enum('status', ['success', 'failed', 'partial']);
            $table->text('error_message')->nullable();
            $table->timestamp('executed_at');
            $table->decimal('execution_time', 8, 2)->nullable(); // seconds
            $table->timestamps();
            
            $table->index(['entity_type', 'executed_at']);
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('purge_logs');
    }
};
