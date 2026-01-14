const mongoose = require('mongoose');
const encryptionPlugin = require('./EncryptedModel');
const encryption = require('../utils/encryption');

const customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    // Champs chiffrés
    phone_encrypted: String,
    address_encrypted: String,
    notes_encrypted: String,
    socialSecurityNumber_encrypted: String,
    
    // Métadonnées
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

// Application du plugin de chiffrement
customerSchema.plugin(encryptionPlugin, {
    encryptedFields: ['phone', 'address', 'notes', 'socialSecurityNumber']
});

// Index pour les recherches
customerSchema.index({ email: 1 });
customerSchema.index({ firstName: 1, lastName: 1 });

module.exports = mongoose.model('Customer', customerSchema);
