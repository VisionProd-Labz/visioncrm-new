@extends('layouts.admin')

@section('title', 'Data Retention Management')

@section('content')
<div class="container-fluid">
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800">Data Retention Management</h1>
        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createPolicyModal">
            <i class="fas fa-plus"></i> Create Policy
        </button>
    </div>

    <!-- Preview Section -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                    <h6 class="m-0 font-weight-bold text-primary">Purge Preview</h6>
                    <div class="dropdown no-arrow">
                        <button class="btn btn-secondary btn-sm" id="previewBtn">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="btn btn-danger btn-sm ms-2" id="executePurgeBtn">
                            <i class="fas fa-trash"></i> Execute Purge
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div id="previewContent">
                        <p class="text-muted">Click "Preview" to see what data would be purged.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Policies Section -->
    <div class="row mb-4">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Retention Policies</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered" id="policiesTable">
                            <thead>
                                <tr>
                                    <th>Entity Type</th>
                                    <th>Retention Days</th>
                                    <th>Date Field</th>
                                    <th>Status</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($policies as $policy)
                                <tr>
                                    <td>{{ ucwords(str_replace('_', ' ', $policy->entity_type)) }}</td>
                                    <td>{{ $policy->retention_days }}</td>
                                    <td>{{ $policy->date_field }}</td>
                                    <td>
                                        <span class="badge badge-{{ $policy->is_active ? 'success' : 'secondary' }}">
                                            {{ $policy->is_active ? 'Active' : 'Inactive' }}
                                        </span>
                                    </td>
                                    <td>{{ $policy->description ?: '-' }}</td>
                                    <td>
                                        <button class="btn btn-sm btn-outline-primary edit-policy" 
                                                data-policy="{{ $policy->toJson() }}">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-sm btn-outline-danger delete-policy" 
                                                data-id="{{ $policy->id }}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Recent Logs Section -->
    <div class="row">
        <div class="col-12">
            <div class="card shadow">
                <div class="card-header py-3">
                    <h6 class="m-0 font-weight-bold text-primary">Recent Purge Logs</h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Entity Type</th>
                                    <th>Records Purged</th>
                                    <th>Status</th>
                                    <th>Executed At</th>
                                    <th>Execution Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($recentLogs as $log)
                                <tr>
                                    <td>{{ ucwords(str_replace('_', ' ', $log->entity_type)) }}</td>
                                    <td>{{ number_format($log->records_purged) }}</td>
                                    <td>
                                        <span class="badge badge-{{ $log->status === 'success' ? 'success' : 'danger' }}">
                                            {{ ucfirst($log->status) }}
                                        </span>
                                    </td>
                                    <td>{{ $log->executed_at->format('Y-m-d H:i:s') }}</td>
                                    <td>{{ $log->execution_time }}s</td>
                                </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Create Policy Modal -->
<div class="modal fade" id="createPolicyModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Create Retention Policy</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <form id="createPolicyForm">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="entity_type" class="form-label">Entity Type</label>
                        <select class="form-control" id="entity_type" name="entity_type" required>
                            <option value="">Select Entity</option>
                            <option value="contacts">Contacts</option>
                            <option value="deals">Deals</option>
                            <option value="activities">Activities</option>
                            <option value="documents">Documents</option>
                            <option value="email_logs">Email Logs</option>
                            <option value="audit_logs">Audit Logs</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="retention_days" class="form-label">Retention Days</label>
                        <input type="number" class="form-control" id="retention_days" name="retention_days" min="1" required>
                    </div>
                    <div class="mb-3">
                        <label for="date_field" class="form-label">Date Field</label>
                        <input type="text" class="form-control" id="date_field" name="date_field" value="created_at" required>
                    </div>
                    <div class="mb-3">
                        <label for="description" class="form-label">Description</label>
                        <textarea class="form-control" id="description" name="description" rows="3"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Policy</button>
                </div>
            </form>
        </div>
    </div>
</div>
@endsection

@section('scripts')
<script>
$(document).ready(function() {
    // Preview functionality
    $('#previewBtn').click(function() {
        $.get('/admin/data-retention/preview')
        .done(function(response) {
            if (response.success) {
                let html = '<div class="table-responsive"><table class="table table-sm">';
                html += '<thead><tr><th>Entity</th><th>Records to Purge</th><th>Cutoff Date</th></tr></thead><tbody>';
                
                $.each(response.preview, function(entity, data) {
                    html += `<tr>
                        <td>${entity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                        <td>${data.count.toLocaleString()}</td>
                        <td>${data.cutoff_date}</td>
                    </tr>`;
                });
                
                html += '</tbody></table></div>';
                html += `<div class="alert alert-info mt-3">Total records to purge: <strong>${response.total_records.toLocaleString()}</strong></div>`;
                
                $('#previewContent').html(html);
            }
        })
        .fail(function() {
            $('#previewContent').html('<div class="alert alert-danger">Failed to load preview</div>');
        });
    });

    // Execute purge functionality
    $('#executePurgeBtn').click(function() {
        if (confirm('This will permanently delete data according to retention policies. Are you sure?')) {
            $.post('/admin/data-retention/purge')
            .done(function(response) {
                if (response.success) {
                    alert(`Purge completed successfully. ${response.total_purged} records purged.`);
                    location.reload();
                }
            })
            .fail(function() {
                alert('Purge failed. Please check the logs.');
            });
        }
    });

    // Create policy form
    $('#createPolicyForm').submit(function(e) {
        e.preventDefault();
        
        $.post('/admin/data-retention/policies', $(this).serialize())
        .done(function(response) {
            if (response.success) {
                $('#createPolicyModal').modal('hide');
                location.reload();
            }
        })
        .fail(function() {
            alert('Failed to create policy');
        });
    });
});
</script>
@endsection
