class DataSubjectRights {
    constructor() {
        this.requestTypes = {
            ACCESS: 'access',
            RECTIFICATION: 'rectification',
            ERASURE: 'erasure',
            PORTABILITY: 'portability',
            RESTRICTION: 'restriction',
            OBJECTION: 'objection'
        };
    }

    // Droit d'accès (Art. 15 RGPD)
    async requestDataAccess(userId, userEmail) {
        const request = this.createRequest(userId, this.requestTypes.ACCESS, {
            email: userEmail,
            description: "Demande d'accès aux données personnelles"
        });

        try {
            const userData = await this.gatherUserData(userId);
            const dataPackage = this.createDataPackage(userData);
            
            request.status = 'completed';
            request.responseData = dataPackage;
            request.completedAt = new Date().toISOString();
            
            await this.saveRequest(request);
            await this.sendDataToUser(userEmail, dataPackage);
            
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    // Droit de rectification (Art. 16 RGPD)
    async requestDataRectification(userId, corrections) {
        const request = this.createRequest(userId, this.requestTypes.RECTIFICATION, {
            corrections: corrections,
            description: "Demande de rectification des données"
        });

        try {
            await this.validateCorrections(corrections);
            await this.applyCorrections(userId, corrections);
            
            request.status = 'completed';
            request.completedAt = new Date().toISOString();
            
            await this.saveRequest(request);
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    // Droit à l'effacement (Art. 17 RGPD)
    async requestDataErasure(userId, reason) {
        const request = this.createRequest(userId, this.requestTypes.ERASURE, {
            reason: reason,
            description: "Demande d'effacement des données"
        });

        try {
            const canErase = await this.validateErasureRequest(userId, reason);
            
            if (canErase) {
                await this.performDataErasure(userId);
                request.status = 'completed';
            } else {
                request.status = 'rejected';
                request.rejectionReason = 'Obligations légales ou intérêts légitimes';
            }
            
            request.completedAt = new Date().toISOString();
            await this.saveRequest(request);
            
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    // Droit à la portabilité (Art. 20 RGPD)
    async requestDataPortability(userId, format = 'json') {
        const request = this.createRequest(userId, this.requestTypes.PORTABILITY, {
            format: format,
            description: "Demande de portabilité des données"
        });

        try {
            const portableData = await this.extractPortableData(userId);
            const formattedData = this.formatForPortability(portableData, format);
            
            request.status = 'completed';
            request.responseData = formattedData;
            request.completedAt = new Date().toISOString();
            
            await this.saveRequest(request);
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    // Droit de limitation (Art. 18 RGPD)
    async requestProcessingRestriction(userId, reason) {
        const request = this.createRequest(userId, this.requestTypes.RESTRICTION, {
            reason: reason,
            description: "Demande de limitation du traitement"
        });

        try {
            await this.applyProcessingRestriction(userId, reason);
            
            request.status = 'completed';
            request.completedAt = new Date().toISOString();
            
            await this.saveRequest(request);
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    // Droit d'opposition (Art. 21 RGPD)
    async requestProcessingObjection(userId, processingType, reason) {
        const request = this.createRequest(userId, this.requestTypes.OBJECTION, {
            processingType: processingType,
            reason: reason,
            description: "Opposition au traitement"
        });

        try {
            const canObject = await this.validateObjection(userId, processingType, reason);
            
            if (canObject) {
                await this.stopProcessing(userId, processingType);
                request.status = 'completed';
            } else {
                request.status = 'rejected';
                request.rejectionReason = 'Motifs légitimes impérieux';
            }
            
            request.completedAt = new Date().toISOString();
            await this.saveRequest(request);
            
            return request;
        } catch (error) {
            request.status = 'error';
            request.error = error.message;
            await this.saveRequest(request);
            throw error;
        }
    }

    createRequest(userId, type, details) {
        return {
            id: this.generateRequestId(),
            userId: userId,
            type: type,
            details: details,
            status: 'pending',
            createdAt: new Date().toISOString(),
            deadline: this.calculateDeadline(),
            ...details
        };
    }

    async gatherUserData(userId) {
        // Collecter toutes les données de l'utilisateur
        const promises = [
            this.getUserProfile(userId),
            this.getUserInteractions(userId),
            this.getUserConsents(userId),
            this.getUserTransactions(userId),
            this.getUserCommunications(userId)
        ];

        const [profile, interactions, consents, transactions, communications] = 
            await Promise.all(promises);

        return {
            profile,
            interactions,
            consents,
            transactions,
            communications,
            metadata: {
                exportedAt: new Date().toISOString(),
                dataController: 'Vision CRM',
                format: 'JSON'
            }
        };
    }

    createDataPackage(userData) {
        return {
            personalData: userData,
            processingActivities: this.getProcessingActivities(userData.profile.userId),
            legalBases: this.getLegalBases(userData.profile.userId),
            dataRetention: this.getRetentionPolicies(),
            thirdPartySharing: this.getThirdPartySharing(userData.profile.userId)
        };
    }

    async performDataErasure(userId) {
        const erasureTasks = [
            this.eraseUserProfile(userId),
            this.eraseUserInteractions(userId),
            this.eraseUserCommunications(userId),
            this.anonymizeTransactions(userId),
            this.removeFromThirdParties(userId)
        ];

        await Promise.all(erasureTasks);
        
        // Log de l'effacement
        await this.logErasure(userId);
    }

    async validateErasureRequest(userId, reason) {
        // Vérifier les conditions d'effacement
        const hasLegalObligation = await this.checkLegalObligations(userId);
        const hasLegitimateInterest = await this.checkLegitimateInterests(userId);
        
        return !hasLegalObligation && !hasLegitimateInterest;
    }

    formatForPortability(data, format) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.convertToCSV(data);
            case 'xml':
                return this.convertToXML(data);
            case 'json':
            default:
                return JSON.stringify(data, null, 2);
        }
    }

    calculateDeadline() {
        const deadline = new Date();
        deadline.setMonth(deadline.getMonth() + 1); // 1 mois pour répondre
        return deadline.toISOString();
    }

    generateRequestId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async saveRequest(request) {
        // Sauvegarder la demande
        return fetch('/api/gdpr/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
    }

    // Méthodes utilitaires (à implémenter selon la structure des données)
    async getUserProfile(userId) { 
        return fetch(`/api/users/${userId}/profile`).then(r => r.json());
    }
    
    async getUserInteractions(userId) { 
        return fetch(`/api/users/${userId}/interactions`).then(r => r.json());
    }
    
    async getUserConsents(userId) { 
        return window.consentManager.getUserConsents(userId);
    }
    
    async getUserTransactions(userId) { 
        return fetch(`/api/users/${userId}/transactions`).then(r => r.json());
    }
    
    async getUserCommunications(userId) { 
        return fetch(`/api/users/${userId}/communications`).then(r => r.json());
    }
}

// Instance globale
window.dataSubjectRights = new DataSubjectRights();
