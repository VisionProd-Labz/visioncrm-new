<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->string('event');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->ipAddress('ip_address');
            $table->text('user_agent')->nullable();
            $table->text('url');
            $table->string('method');
            $table->json('data')->nullable();
            $table->enum('level', ['info', 'warning', 'error'])->default('info');
            $table->timestamps();
            
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            $table->index(['event', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['ip_address', 'created_at']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('audit_logs');
    }
};
