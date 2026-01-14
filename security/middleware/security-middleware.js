/**
 * Middleware de sécurité pour VisionCRM
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const validator = require('validator');
const xss = require('xss');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Configuration du rate limiting
const createRateLimit = (windowMs, max, message) => {
    return rateLimit({
        windowMs,
        max,
        message: { error: message },
        standardHeaders: true,
        legacyHeaders: false,
    });
};

// Rate limits spécifiques
const authLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 tentatives max
    'Trop de tentatives de connexion, réessayez dans 15 minutes'
);

const apiLimiter = createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requêtes max
    'Trop de requêtes API, réessayez plus tard'
);

// Middleware de sécurisation des headers
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            formAction: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});

// Validation et sanitisation des entrées
const validateInput = (req, res, next) => {
    try {
        // Sanitiser tous les champs de texte
        if (req.body) {
            for (const key in req.body) {
                if (typeof req.body[key] === 'string') {
                    req.body[key] = xss(req.body[key].trim());
                }
            }
        }
        
        // Validation des emails
        if (req.body.email) {
            if (!validator.isEmail(req.body.email)) {
                return res.status(400).json({
                    error: 'Format d\'email invalide'
                });
            }
            req.body.email = validator.normalizeEmail(req.body.email);
        }
        
        // Validation des URLs
        if (req.body.website) {
            if (!validator.isURL(req.body.website)) {
                return res.status(400).json({
                    error: 'Format d\'URL invalide'
                });
            }
        }
        
        // Validation des numéros de téléphone
        if (req.body.phone) {
            if (!validator.isMobilePhone(req.body.phone, 'any')) {
                return res.status(400).json({
                    error: 'Format de téléphone invalide'
                });
            }
        }
        
        next();
    } catch (error) {
        res.status(400).json({
            error: 'Données d\'entrée invalides'
        });
    }
};

// Validation des mots de passe
const validatePassword = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({
            error: 'Mot de passe requis'
        });
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
        });
    }
    
    next();
};

// Vérification des tokens JWT
const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                error: 'Token d\'authentification requis'
            });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Vérifier que le token n'est pas expiré
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({
                error: 'Token expiré'
            });
        }
        
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            error: 'Token invalide'
        });
    }
};

// Vérification des permissions
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Authentification requise'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Permissions insuffisantes'
            });
        }
        
        next();
    };
};

// Protection contre les attaques par déni de service
const dosProtection = (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB max
        return res.status(413).json({
            error: 'Payload trop volumineux'
        });
    }
    
    next();
};

// Validation des paramètres de fichiers
const validateFileUpload = (req, res, next) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({
            error: 'Aucun fichier fourni'
        });
    }
    
    const file = req.files.file;
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
            error: 'Type de fichier non autorisé'
        });
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB max
        return res.status(400).json({
            error: 'Fichier trop volumineux (5MB max)'
        });
    }
    
    // Vérifier le nom du fichier pour éviter directory traversal
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
        return res.status(400).json({
            error: 'Nom de fichier invalide'
        });
    }
    
    next();
};

// Middleware CSRF
const csrfProtection = (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
        const token = req.headers['x-csrf-token'] || req.body._csrf;
        const sessionToken = req.session?.csrfToken;
        
        if (!token || token !== sessionToken) {
            return res.status(403).json({
                error: 'Token CSRF invalide'
            });
        }
    }
    
    next();
};

// Logging de sécurité
const securityLogger = (req, res, next) => {
    const suspiciousPatterns = [
        /(\.\.|\/etc\/|\/windows\/|cmd\.exe|powershell)/i,
        /<script|javascript:|on\w+=/i,
        /(union\s+select|insert\s+into|drop\s+table)/i
    ];
    
    const requestData = JSON.stringify({
        body: req.body,
        query: req.query,
        params: req.params
    });
    
    const isSuspicious = suspiciousPatterns.some(pattern => 
        pattern.test(requestData)
    );
    
    if (isSuspicious) {
        console.warn('🔒 Requête suspecte détectée:', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            method: req.method,
            url: req.originalUrl,
            data: requestData,
            timestamp: new Date().toISOString()
        });
    }
    
    next();
};

module.exports = {
    authLimiter,
    apiLimiter,
    securityHeaders,
    validateInput,
    validatePassword,
    verifyToken,
    requireRole,
    dosProtection,
    validateFileUpload,
    csrfProtection,
    securityLogger
};
