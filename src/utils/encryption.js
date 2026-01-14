const crypto = require('crypto');
const EncryptionConfig = require('../config/encryption');

class DataEncryption {
    constructor() {
        this.config = new EncryptionConfig();
    }

    // Chiffrement des données sensibles
    encrypt(plaintext) {
        try {
            if (!plaintext) return null;
            
            const salt = this.config.generateSalt();
            const iv = this.config.generateIV();
            const key = this.config.deriveKey(salt);
            
            const cipher = crypto.createCipher(this.config.algorithm, key, { iv });
            
            let encrypted = cipher.update(plaintext, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag();
            
            // Combinaison: salt + iv + tag + encrypted data
            const result = {
                encrypted: encrypted,
                salt: salt.toString('hex'),
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
            
            return Buffer.from(JSON.stringify(result)).toString('base64');
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    // Déchiffrement des données
    decrypt(encryptedData) {
        try {
            if (!encryptedData) return null;
            
            const data = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
            
            const salt = Buffer.from(data.salt, 'hex');
            const iv = Buffer.from(data.iv, 'hex');
            const tag = Buffer.from(data.tag, 'hex');
            const encrypted = data.encrypted;
            
            const key = this.config.deriveKey(salt);
            
            const decipher = crypto.createDecipher(this.config.algorithm, key, { iv });
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    // Chiffrement pour les mots de passe (hash unidirectionnel)
    hashPassword(password) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
        return `${salt}:${hash}`;
    }

    // Vérification des mots de passe
    verifyPassword(password, hashedPassword) {
        const [salt, hash] = hashedPassword.split(':');
        const hashVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
        return hash === hashVerify;
    }

    // Génération de tokens sécurisés
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }

    // Hachage pour l'intégrité des données
    generateHash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
}

module.exports = new DataEncryption();
