const express = require('express');
const router = express.Router();
const EncryptionService = require('../services/EncryptionService');
const { authLimiter } = require('../middleware/encryption');
const auth = require('../middleware/auth');

// Route pour migrer les données existantes vers le chiffrement
router.post('/migrate', authLimiter, auth.requireAdmin, async (req, res) => {
    try {
        const result = await EncryptionService.encryptExistingData();
        
        res.json({
            success: true,
            message: 'Data encryption migration completed',
            data: result
        });
    } catch (error) {
        console.error('Migration error:', error);
        res.status(500).json({
            success: false,
            message: 'Migration failed',
            error: error.message
        });
    }
});

// Route pour vérifier l'intégrité des données
router.get('/verify', auth.requireAdmin, async (req, res) => {
    try {
        const result = await EncryptionService.verifyDataIntegrity();
        
        res.json({
            success: true,
            message: 'Data integrity verification completed',
            data: result
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Verification failed',
            error: error.message
        });
    }
});

// Route pour l'audit des données sensibles
router.get('/audit', auth.requireAdmin, async (req, res) => {
    try {
        const result = await EncryptionService.auditSensitiveData();
        
        res.json({
            success: true,
            message: 'Sensitive data audit completed',
            data: result
        });
    } catch (error) {
        console.error('Audit error:', error);
        res.status(500).json({
            success: false,
            message: 'Audit failed',
            error: error.message
        });
    }
});

// Route pour la rotation des clés (très sensible)
router.post('/rotate-keys', authLimiter, auth.requireSuperAdmin, async (req, res) => {
    try {
        const { newMasterKey } = req.body;
        
        if (!newMasterKey || newMasterKey.length < 64) {
            return res.status(400).json({
                success: false,
                message: 'Invalid master key. Must be at least 64 characters.'
            });
        }
        
        const result = await EncryptionService.rotateEncryptionKeys(newMasterKey);
        
        res.json({
            success: true,
            message: 'Encryption keys rotated successfully',
            data: result
        });
    } catch (error) {
        console.error('Key rotation error:', error);
        res.status(500).json({
            success: false,
            message: 'Key rotation failed',
            error: error.message
        });
    }
});

module.exports = router;
