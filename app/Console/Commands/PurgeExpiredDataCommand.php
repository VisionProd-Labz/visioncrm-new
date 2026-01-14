<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\DataRetentionService;
use App\Models\PurgeLog;
use Carbon\Carbon;

class PurgeExpiredDataCommand extends Command
{
    protected $signature = 'data:purge 
                          {--preview : Show what would be purged without executing}
                          {--entity= : Purge specific entity only}
                          {--force : Skip confirmation prompts}';

    protected $description = 'Purge expired data according to retention policies';

    protected DataRetentionService $retentionService;

    public function __construct(DataRetentionService $retentionService)
    {
        parent::__construct();
        $this->retentionService = $retentionService;
    }

    public function handle(): int
    {
        $startTime = microtime(true);

        if ($this->option('preview')) {
            return $this->handlePreview();
        }

        if (!$this->option('force') && !$this->confirmPurge()) {
            $this->info('Purge cancelled.');
            return 0;
        }

        try {
            $this->info('Starting data purge...');
            
            $results = $this->retentionService->purgeExpiredData();
            
            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);
            
            $this->displayResults($results, $executionTime);
            $this->logPurgeResults($results, $executionTime, 'success');
            
            return 0;
            
        } catch (\Exception $e) {
            $endTime = microtime(true);
            $executionTime = round($endTime - $startTime, 2);
            
            $this->error('Purge failed: ' . $e->getMessage());
            $this->logPurgeResults([], $executionTime, 'failed', $e->getMessage());
            
            return 1;
        }
    }

    protected function handlePreview(): int
    {
        $this->info('Generating purge preview...');
        
        $preview = $this->retentionService->previewPurge();
        
        if (empty($preview)) {
            $this->info('No active retention policies found.');
            return 0;
        }
        
        $this->table(
            ['Entity', 'Records to Purge', 'Cutoff Date', 'Retention Days'],
            collect($preview)->map(function ($data, $entity) {
                return [
                    $entity,
                    number_format($data['count']),
                    $data['cutoff_date'],
                    $data['retention_days']
                ];
            })->values()->toArray()
        );
        
        $total = collect($preview)->sum('count');
        $this->info("Total records to be purged: " . number_format($total));
        
        return 0;
    }

    protected function confirmPurge(): bool
    {
        $preview = $this->retentionService->previewPurge();
        
        if (empty($preview)) {
            $this->info('No data to purge.');
            return false;
        }
        
        $total = collect($preview)->sum('count');
        
        return $this->confirm(
            "This will permanently delete {$total} records. Are you sure you want to continue?"
        );
    }

    protected function displayResults(array $results, float $executionTime): void
    {
        $this->table(
            ['Entity', 'Records Purged'],
            collect($results)->map(function ($count, $entity) {
                return [$entity, number_format($count)];
            })->values()->toArray()
        );
        
        $total = array_sum($results);
        $this->info("Total records purged: " . number_format($total));
        $this->info("Execution time: {$executionTime} seconds");
    }

    protected function logPurgeResults(array $results, float $executionTime, string $status, ?string $errorMessage = null): void
    {
        foreach ($results as $entity => $count) {
            PurgeLog::create([
                'entity_type' => $entity,
                'records_purged' => $count,
                'cutoff_date' => Carbon::now(),
                'retention_days' => 0, // This should be retrieved from policy
                'status' => $status,
                'error_message' => $errorMessage,
                'executed_at' => Carbon::now(),
                'execution_time' => $executionTime
            ]);
        }
    }
}
