<?php

return [
    'encryption' => [
        'cipher' => 'AES-256-CBC',
        'key' => env('APP_KEY'),
        'key_path' => storage_path('app/keys/'),
    ],
    
    'password' => [
        'min_length' => 8,
        'require_uppercase' => true,
        'require_lowercase' => true,
        'require_numbers' => true,
        'require_symbols' => true,
        'max_attempts' => 5,
        'lockout_duration' => 900, // 15 minutes
    ],
    
    'session' => [
        'lifetime' => 120, // minutes
        'expire_on_close' => true,
        'encrypt' => true,
        'http_only' => true,
        'same_site' => 'strict',
        'secure' => env('APP_ENV') === 'production',
    ],
    
    'csrf' => [
        'enabled' => true,
        'token_lifetime' => 3600, // 1 hour
    ],
    
    'rate_limiting' => [
        'login_attempts' => [
            'max_attempts' => 5,
            'decay_minutes' => 15,
        ],
        'api_requests' => [
            'max_attempts' => 100,
            'decay_minutes' => 1,
        ],
    ],
    
    'audit_log' => [
        'enabled' => true,
        'retention_days' => 90,
        'log_sensitive_data' => false,
    ],
    
    'file_upload' => [
        'max_size' => 10 * 1024 * 1024, // 10MB
        'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        'scan_for_malware' => true,
    ],
];
