const mongoose = require('mongoose');
const encryption = require('../utils/encryption');

// Plugin pour chiffrement automatique
function encryptionPlugin(schema, options = {}) {
    const encryptedFields = options.encryptedFields || [];
    
    // Middleware pre-save pour chiffrer les champs sensibles
    schema.pre('save', function(next) {
        const doc = this;
        
        encryptedFields.forEach(field => {
            if (doc[field] && doc.isModified(field)) {
                // Marquer le champ comme étant chiffré
                if (!field.endsWith('_encrypted')) {
                    doc[field + '_encrypted'] = encryption.encrypt(doc[field]);
                    doc[field] = undefined; // Supprimer la valeur en clair
                } else if (!doc[field].startsWith('encrypted:')) {
                    doc[field] = encryption.encrypt(doc[field]);
                }
            }
        });
        
        next();
    });

    // Méthode pour déchiffrer les données
    schema.methods.decrypt = function(field) {
        const encryptedField = field.endsWith('_encrypted') ? field : field + '_encrypted';
        if (this[encryptedField]) {
            return encryption.decrypt(this[encryptedField]);
        }
        return null;
    };

    // Méthode pour obtenir toutes les données déchiffrées
    schema.methods.getDecrypted = function() {
        const decryptedDoc = this.toObject();
        
        encryptedFields.forEach(field => {
            const encryptedField = field + '_encrypted';
            if (decryptedDoc[encryptedField]) {
                try {
                    decryptedDoc[field] = encryption.decrypt(decryptedDoc[encryptedField]);
                    delete decryptedDoc[encryptedField];
                } catch (error) {
                    console.error(`Failed to decrypt field ${field}:`, error);
                }
            }
        });
        
        return decryptedDoc;
    };
}

module.exports = encryptionPlugin;
