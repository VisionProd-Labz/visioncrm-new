-- Table pour stocker les logs d'audit
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    event_type ENUM('DATA_ACCESS', 'DATA_MODIFICATION', 'AUTHENTICATION', 'SECURITY', 'SYSTEM') NOT NULL,
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(50) NOT NULL,
    resource_id INT DEFAULT 0,
    user_id INT NULL,
    user_role VARCHAR(50) NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NULL,
    timestamp DATETIME NOT NULL,
    changes JSON NULL,
    old_data JSON NULL,
    new_data JSON NULL,
    additional_data JSON NULL,
    description TEXT NULL,
    success BOOLEAN DEFAULT TRUE,
    reason VARCHAR(255) NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_user_id (user_id),
    INDEX idx_resource (resource, resource_id),
    INDEX idx_timestamp (timestamp),
    INDEX idx_severity (severity),
    INDEX idx_ip_address (ip_address)
);

-- Table pour stocker les configurations de rétention des logs
CREATE TABLE IF NOT EXISTS audit_log_retention (
    id INT PRIMARY KEY AUTO_INCREMENT,
    event_type VARCHAR(50) NOT NULL,
    retention_days INT NOT NULL DEFAULT 365,
    archive_after_days INT NOT NULL DEFAULT 90,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_event_type (event_type)
);

-- Insérer les configurations par défaut
INSERT INTO audit_log_retention (event_type, retention_days, archive_after_days) VALUES
('DATA_ACCESS', 365, 90),
('DATA_MODIFICATION', 2555, 180), -- 7 ans pour les modifications RGPD
('AUTHENTICATION', 180, 30),
('SECURITY', 1095, 180), -- 3 ans pour les événements de sécurité
('SYSTEM', 90, 30);
