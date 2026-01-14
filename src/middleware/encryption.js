const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

// Middleware de sécurité pour HTTPS
const enforceHTTPS = (req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect(301, 'https://' + req.get('host') + req.url);
    }
    next();
};

// Configuration CORS sécurisée
const corsConfig = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
};

// Limitation du taux de requêtes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite de 100 requêtes par fenêtre par IP
    message: {
        error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Limitation stricte pour l'authentification
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limite de 5 tentatives de connexion par fenêtre
    message: {
        error: 'Too many authentication attempts, please try again later.'
    },
    skipSuccessfulRequests: true,
});

// Configuration Helmet pour la sécurité des en-têtes
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false
});

// Middleware de validation des données sensibles
const validateSensitiveData = (req, res, next) => {
    const sensitiveFields = ['password', 'socialSecurityNumber', 'creditCard', 'bankAccount'];
    
    // Vérifier si des champs sensibles sont envoyés en clair dans les logs
    const reqBody = { ...req.body };
    sensitiveFields.forEach(field => {
        if (reqBody[field]) {
            reqBody[field] = '[REDACTED]';
        }
    });
    
    // Logger la requête avec les données sensibles masquées
    console.log(`${req.method} ${req.path}`, JSON.stringify(reqBody));
    
    next();
};

module.exports = {
    enforceHTTPS,
    corsConfig,
    apiLimiter,
    authLimiter,
    helmetConfig,
    validateSensitiveData,
    compression: compression()
};
