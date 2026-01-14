const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();

// Middleware de sécurité
const {
    enforceHTTPS,
    corsConfig,
    apiLimiter,
    helmetConfig,
    validateSensitiveData,
    compression
} = require('./middleware/encryption');

const tlsConfig = require('./utils/tlsConfig');

// Routes
const encryptionRoutes = require('./routes/encryption');
const customerRoutes = require('./routes/customers');
const authRoutes = require('./routes/auth');

const app = express();

// Configuration de sécurité de base
app.use(helmetConfig);
app.use(enforceHTTPS);
app.use(compression);

// CORS
app.use(cors(corsConfig));

// Limitation du taux de requêtes
app.use('/api', apiLimiter);

// Parsing JSON avec limite de taille
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Validation des données sensibles
app.use(validateSensitiveData);

// Configuration des sessions sécurisées
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        touchAfter: 24 * 3600 // lazy session update
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'strict'
    }
}));

// Routes
app.use('/api/encryption', encryptionRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);

// Route de santé
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        environment: process.env.NODE_ENV,
        encryption: 'enabled'
    });
});

// Gestion des erreurs
app.use((error, req, res, next) => {
    console.error('Application error:', error);
    
    // Ne pas exposer les détails des erreurs en production
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message
    };
    
    res.status(500).json(errorResponse);
});

// Route 404
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Connexion à MongoDB avec chiffrement
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            ssl: process.env.NODE_ENV === 'production',
            sslValidate: true
        });
        
        console.log('MongoDB connected with encryption enabled');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

// Démarrage du serveur
const startServer = async () => {
    await connectDB();
    
    const PORT = process.env.PORT || 3000;
    
    // Utiliser HTTPS en production
    const server = tlsConfig.createHTTPSServer(app);
    
    if (server) {
        server.listen(PORT, () => {
            console.log(`HTTPS Server running on port ${PORT} with encryption enabled`);
        });
    } else {
        app.listen(PORT, () => {
            console.log(`HTTP Server running on port ${PORT} (development mode)`);
        });
    }
};

// Gestion des signaux de fermeture
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    mongoose.connection.close(() => {
        process.exit(0);
    });
});

if (require.main === module) {
    startServer();
}

module.exports = app;
