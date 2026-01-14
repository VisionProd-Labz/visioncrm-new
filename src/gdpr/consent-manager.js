class ConsentManager {
    constructor() {
        this.consentTypes = {
            MARKETING: 'marketing',
            ANALYTICS: 'analytics',
            FUNCTIONAL: 'functional',
            ESSENTIAL: 'essential'
        };
        this.init();
    }

    init() {
        this.loadConsents();
        this.setupEventListeners();
    }

    // Gestion du consentement
    requestConsent(userId, consentType, purpose, lawfulBasis = 'consent') {
        return new Promise((resolve, reject) => {
            const consentRecord = {
                id: this.generateId(),
                userId: userId,
                consentType: consentType,
                purpose: purpose,
                lawfulBasis: lawfulBasis,
                granted: false,
                timestamp: new Date().toISOString(),
                ipAddress: this.getUserIP(),
                userAgent: navigator.userAgent,
                method: 'explicit',
                version: '1.0'
            };

            this.showConsentModal(consentRecord)
                .then(userResponse => {
                    consentRecord.granted = userResponse;
                    consentRecord.responseTimestamp = new Date().toISOString();
                    
                    this.saveConsent(consentRecord);
                    resolve(consentRecord);
                })
                .catch(reject);
        });
    }

    // Vérification du consentement
    hasValidConsent(userId, consentType) {
        const consents = this.getUserConsents(userId);
        const relevantConsent = consents.find(c => 
            c.consentType === consentType && 
            c.granted && 
            !this.isConsentExpired(c)
        );
        return !!relevantConsent;
    }

    // Retrait du consentement
    withdrawConsent(userId, consentType) {
        const consents = this.getUserConsents(userId);
        const consentToWithdraw = consents.find(c => 
            c.consentType === consentType && c.granted
        );

        if (consentToWithdraw) {
            consentToWithdraw.granted = false;
            consentToWithdraw.withdrawnAt = new Date().toISOString();
            consentToWithdraw.withdrawalMethod = 'user_request';
            
            this.saveConsent(consentToWithdraw);
            this.triggerDataProcessingStop(userId, consentType);
            
            return true;
        }
        return false;
    }

    // Modal de consentement
    showConsentModal(consentRecord) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'gdpr-consent-modal';
            modal.innerHTML = `
                <div class="consent-overlay">
                    <div class="consent-dialog">
                        <h3>Demande de consentement</h3>
                        <p><strong>Finalité :</strong> ${consentRecord.purpose}</p>
                        <p><strong>Type :</strong> ${consentRecord.consentType}</p>
                        <p><strong>Base légale :</strong> ${consentRecord.lawfulBasis}</p>
                        
                        <div class="consent-details">
                            <p>Nous souhaitons traiter vos données personnelles pour la finalité mentionnée ci-dessus. 
                            Vous pouvez retirer votre consentement à tout moment.</p>
                        </div>
                        
                        <div class="consent-actions">
                            <button id="consent-accept" class="btn btn-primary">J'accepte</button>
                            <button id="consent-decline" class="btn btn-secondary">Je refuse</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            const acceptBtn = modal.querySelector('#consent-accept');
            const declineBtn = modal.querySelector('#consent-decline');

            acceptBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };

            declineBtn.onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });
    }

    saveConsent(consentRecord) {
        let consents = JSON.parse(localStorage.getItem('gdpr_consents') || '[]');
        
        // Mettre à jour ou ajouter le consentement
        const existingIndex = consents.findIndex(c => c.id === consentRecord.id);
        if (existingIndex >= 0) {
            consents[existingIndex] = consentRecord;
        } else {
            consents.push(consentRecord);
        }
        
        localStorage.setItem('gdpr_consents', JSON.stringify(consents));
        
        // Envoyer au serveur
        this.syncWithServer(consentRecord);
    }

    getUserConsents(userId) {
        const consents = JSON.parse(localStorage.getItem('gdpr_consents') || '[]');
        return consents.filter(c => c.userId === userId);
    }

    isConsentExpired(consent) {
        const expiryMonths = 24; // 2 ans
        const consentDate = new Date(consent.timestamp);
        const expiryDate = new Date(consentDate.setMonth(consentDate.getMonth() + expiryMonths));
        return new Date() > expiryDate;
    }

    generateId() {
        return 'consent_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserIP() {
        // En production, obtenir l'IP côté serveur
        return 'client_side_unavailable';
    }

    triggerDataProcessingStop(userId, consentType) {
        // Arrêter le traitement des données pour ce type de consentement
        console.log(`Arrêt du traitement ${consentType} pour l'utilisateur ${userId}`);
        
        // Déclencher les événements nécessaires
        const event = new CustomEvent('gdpr:consent-withdrawn', {
            detail: { userId, consentType }
        });
        document.dispatchEvent(event);
    }

    syncWithServer(consentRecord) {
        fetch('/api/gdpr/consent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consentRecord)
        }).catch(err => console.error('Erreur sync consentement:', err));
    }

    setupEventListeners() {
        document.addEventListener('gdpr:request-consent', (event) => {
            const { userId, consentType, purpose } = event.detail;
            this.requestConsent(userId, consentType, purpose);
        });
    }

    loadConsents() {
        // Charger les consentements depuis le serveur au démarrage
        fetch('/api/gdpr/consents')
            .then(response => response.json())
            .then(consents => {
                localStorage.setItem('gdpr_consents', JSON.stringify(consents));
            })
            .catch(err => console.error('Erreur chargement consentements:', err));
    }
}

// Instance globale
window.consentManager = new ConsentManager();
