<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('data_subject_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->enum('request_type', ['access', 'rectification', 'erasure', 'portability', 'restriction', 'objection']);
            $table->enum('status', ['pending_verification', 'verified', 'in_progress', 'completed', 'rejected'])
                  ->default('pending_verification');
            $table->text('description')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->foreignId('processor_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('verification_token')->nullable();
            $table->timestamp('verification_expires_at')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->json('request_data')->nullable();
            $table->text('processing_notes')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'submitted_at']);
            $table->index(['user_id', 'request_type']);
            $table->index('verification_token');
        });
    }

    public function down()
    {
        Schema::dropIfExists('data_subject_requests');
    }
};
