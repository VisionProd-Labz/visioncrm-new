/**
 * Utilitaires de chiffrement pour VisionCRM
 */

const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.tagLength = 16;
        this.saltRounds = 12;
    }
    
    // Générer une clé de chiffrement
    generateKey() {
        return crypto.randomBytes(this.keyLength);
    }
    
    // Chiffrer des données sensibles
    encrypt(text, key) {
        try {
            const iv = crypto.randomBytes(this.ivLength);
            const cipher = crypto.createCipher(this.algorithm, key, iv);
            
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            
            const tag = cipher.getAuthTag();
            
            return {
                encrypted,
                iv: iv.toString('hex'),
                tag: tag.toString('hex')
            };
        } catch (error) {
            throw new Error('Erreur lors du chiffrement');
        }
    }
    
    // Déchiffrer des données
    decrypt(encryptedData, key) {
        try {
            const { encrypted, iv, tag } = encryptedData;
            const decipher = crypto.createDecipher(
                this.algorithm,
                key,
                Buffer.from(iv, 'hex')
            );
            
            decipher.setAuthTag(Buffer.from(tag, 'hex'));
            
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error('Erreur lors du déchiffrement');
        }
    }
    
    // Hasher un mot de passe
    async hashPassword(password) {
        try {
            return await bcrypt.hash(password, this.saltRounds);
        } catch (error) {
            throw new Error('Erreur lors du hashage du mot de passe');
        }
    }
    
    // Vérifier un mot de passe
    async verifyPassword(password, hash) {
        try {
            return await bcrypt.compare(password, hash);
        } catch (error) {
            throw new Error('Erreur lors de la vérification du mot de passe');
        }
    }
    
    // Générer un token JWT sécurisé
    generateJWT(payload, expiresIn = '24h') {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn,
            issuer: 'visioncrm',
            audience: 'visioncrm-client'
        });
    }
    
    // Vérifier un token JWT
    verifyJWT(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET, {
                issuer: 'visioncrm',
                audience: 'visioncrm-client'
            });
        } catch (error) {
            throw new Error('Token JWT invalide');
        }
    }
    
    // Générer un token sécurisé pour reset password
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    
    // Créer une signature HMAC
    createHMAC(data, secret) {
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(data);
        return hmac.digest('hex');
    }
    
    // Vérifier une signature HMAC
    verifyHMAC(data, signature, secret) {
        const expectedSignature = this.createHMAC(data, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }
    
    // Générer un salt pour les sessions
    generateSalt() {
        return crypto.randomBytes(16).toString('hex');
    }
    
    // Chiffrer des données de session
    encryptSessionData(data, secret) {
        const stringData = JSON.stringify(data);
        return this.encrypt(stringData, secret);
    }
    
    // Déchiffrer des données de session
    decryptSessionData(encryptedData, secret) {
        const decrypted = this.decrypt(encryptedData, secret);
        return JSON.parse(decrypted);
    }
}

module.exports = new EncryptionService();
