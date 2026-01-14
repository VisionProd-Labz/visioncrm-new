const encryption = require('../utils/encryption');
const Customer = require('../models/Customer');

class EncryptionService {
    // Chiffrement en lot des données existantes
    async encryptExistingData() {
        try {
            console.log('Starting data encryption migration...');
            
            const customers = await Customer.find({}).lean();
            let encryptedCount = 0;
            
            for (const customer of customers) {
                const updates = {};
                let hasUpdates = false;
                
                // Vérifier et chiffrer les champs non chiffrés
                const fieldsToEncrypt = ['phone', 'address', 'notes', 'socialSecurityNumber'];
                
                fieldsToEncrypt.forEach(field => {
                    const encryptedField = field + '_encrypted';
                    
                    // Si le champ existe en clair et n'est pas encore chiffré
                    if (customer[field] && !customer[encryptedField]) {
                        updates[encryptedField] = encryption.encrypt(customer[field]);
                        updates[field] = undefined; // Supprimer le champ en clair
                        hasUpdates = true;
                    }
                });
                
                if (hasUpdates) {
                    await Customer.findByIdAndUpdate(customer._id, updates);
                    encryptedCount++;
                }
            }
            
            console.log(`Encryption migration completed. ${encryptedCount} records updated.`);
            return { success: true, encryptedCount };
        } catch (error) {
            console.error('Encryption migration failed:', error);
            throw error;
        }
    }

    // Vérification de l'intégrité des données chiffrées
    async verifyDataIntegrity() {
        try {
            const customers = await Customer.find({});
            const results = {
                total: customers.length,
                encrypted: 0,
                corrupted: 0,
                issues: []
            };
            
            for (const customer of customers) {
                let hasEncryptedFields = false;
                
                ['phone', 'address', 'notes', 'socialSecurityNumber'].forEach(field => {
                    const encryptedField = field + '_encrypted';
                    
                    if (customer[encryptedField]) {
                        hasEncryptedFields = true;
                        try {
                            encryption.decrypt(customer[encryptedField]);
                        } catch (error) {
                            results.corrupted++;
                            results.issues.push({
                                customerId: customer._id,
                                field: encryptedField,
                                error: 'Decryption failed'
                            });
                        }
                    }
                });
                
                if (hasEncryptedFields) {
                    results.encrypted++;
                }
            }
            
            return results;
        } catch (error) {
            console.error('Data integrity verification failed:', error);
            throw error;
        }
    }

    // Rotation des clés de chiffrement
    async rotateEncryptionKeys(newMasterKey) {
        try {
            console.log('Starting encryption key rotation...');
            
            // Sauvegarder l'ancienne configuration
            const oldConfig = new (require('../config/encryption'))();
            
            // Temporairement utiliser l'ancienne clé pour déchiffrer
            const customers = await Customer.find({});
            const decryptedData = [];
            
            // Déchiffrer avec l'ancienne clé
            for (const customer of customers) {
                const decrypted = customer.getDecrypted();
                decryptedData.push({
                    id: customer._id,
                    data: decrypted
                });
            }
            
            // Mettre à jour la clé maître
            process.env.ENCRYPTION_MASTER_KEY = newMasterKey;
            
            // Re-chiffrer avec la nouvelle clé
            let rotatedCount = 0;
            for (const item of decryptedData) {
                const updates = {};
                ['phone', 'address', 'notes', 'socialSecurityNumber'].forEach(field => {
                    if (item.data[field]) {
                        updates[field + '_encrypted'] = encryption.encrypt(item.data[field]);
                    }
                });
                
                if (Object.keys(updates).length > 0) {
                    await Customer.findByIdAndUpdate(item.id, updates);
                    rotatedCount++;
                }
            }
            
            console.log(`Key rotation completed. ${rotatedCount} records re-encrypted.`);
            return { success: true, rotatedCount };
        } catch (error) {
            console.error('Key rotation failed:', error);
            throw error;
        }
    }

    // Audit des données sensibles
    async auditSensitiveData() {
        try {
            const customers = await Customer.find({}).select('_id email createdAt');
            const audit = {
                timestamp: new Date(),
                totalRecords: customers.length,
                encryptedFields: {
                    phone: 0,
                    address: 0,
                    notes: 0,
                    socialSecurityNumber: 0
                },
                unencryptedFields: []
            };
            
            for (const customer of customers) {
                const fullCustomer = await Customer.findById(customer._id);
                
                ['phone', 'address', 'notes', 'socialSecurityNumber'].forEach(field => {
                    const encryptedField = field + '_encrypted';
                    
                    if (fullCustomer[encryptedField]) {
                        audit.encryptedFields[field]++;
                    } else if (fullCustomer[field]) {
                        audit.unencryptedFields.push({
                            customerId: customer._id,
                            field: field
                        });
                    }
                });
            }
            
            return audit;
        } catch (error) {
            console.error('Sensitive data audit failed:', error);
            throw error;
        }
    }
}

module.exports = new EncryptionService();
