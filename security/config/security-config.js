/**
 * Configuration de sécurité pour VisionCRM
 */

const securityConfig = {
    // Configuration des mots de passe
    password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // jours
        preventReuse: 5 // nombre de derniers mots de passe à éviter
    },
    
    // Configuration des sessions
    session: {
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict'
    },
    
    // Configuration JWT
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '24h',
        refreshExpiresIn: '7d',
        algorithm: 'HS256'
    },
    
    // Configuration du rate limiting
    rateLimit: {
        auth: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 5 // 5 tentatives max
        },
        api: {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // 100 requêtes max
        },
        fileUpload: {
            windowMs: 60 * 1000, // 1 minute
            max: 10 // 10 uploads max
        }
    },
    
    // Configuration des fichiers
    fileUpload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/pdf',
            'text/plain',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        uploadPath: './uploads/',
        scanForVirus: process.env.NODE_ENV === 'production'
    },
    
    // Configuration CORS
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
    },
    
    // Headers de sécurité
    securityHeaders: {
        contentSecurityPolicy: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"]
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    },
    
    // Configuration de la base de données
    database: {
        ssl: process.env.NODE_ENV === 'production',
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
    },
    
    // Configuration des logs de sécurité
    logging: {
        level: 'warn',
        logFailedAttempts: true,
        logSuspiciousActivity: true,
        retentionDays: 90
    },
    
    // Configuration de la surveillance
    monitoring: {
        enableMetrics: true,
        alertThresholds: {
            failedLogins: 10,
            suspiciousRequests: 50,
            errorRate: 0.05
        }
    }
};

module.exports = securityConfig;
