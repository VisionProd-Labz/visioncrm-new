const crypto = require('crypto');
require('dotenv').config();

class EncryptionConfig {
    constructor() {
        // Clés de chiffrement depuis les variables d'environnement
        this.masterKey = process.env.ENCRYPTION_MASTER_KEY;
        this.algorithm = 'aes-256-gcm';
        this.keyDerivationRounds = 100000;
        this.saltLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        
        if (!this.masterKey) {
            throw new Error('ENCRYPTION_MASTER_KEY must be set in environment variables');
        }
    }

    // Génération d'une clé dérivée
    deriveKey(salt) {
        return crypto.pbkdf2Sync(this.masterKey, salt, this.keyDerivationRounds, 32, 'sha256');
    }

    // Génération d'un salt aléatoire
    generateSalt() {
        return crypto.randomBytes(this.saltLength);
    }

    // Génération d'un IV aléatoire
    generateIV() {
        return crypto.randomBytes(this.ivLength);
    }

    // Génération d'une clé maître sécurisée (pour l'initialisation)
    static generateMasterKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = EncryptionConfig;
