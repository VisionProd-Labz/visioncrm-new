<?php

use App\Http\Controllers\DataRetentionController;

// Data Retention routes
Route::prefix('admin/data-retention')->middleware(['auth', 'admin'])->group(function () {
    Route::get('/', [DataRetentionController::class, 'index'])->name('admin.data-retention.index');
    Route::get('/policies', [DataRetentionController::class, 'policies'])->name('admin.data-retention.policies');
    Route::post('/policies', [DataRetentionController::class, 'createPolicy'])->name('admin.data-retention.policies.create');
    Route::put('/policies/{policy}', [DataRetentionController::class, 'updatePolicy'])->name('admin.data-retention.policies.update');
    Route::delete('/policies/{policy}', [DataRetentionController::class, 'deletePolicy'])->name('admin.data-retention.policies.delete');
    Route::get('/preview', [DataRetentionController::class, 'preview'])->name('admin.data-retention.preview');
    Route::post('/purge', [DataRetentionController::class, 'executePurge'])->name('admin.data-retention.purge');
    Route::get('/logs', [DataRetentionController::class, 'logs'])->name('admin.data-retention.logs');
});
