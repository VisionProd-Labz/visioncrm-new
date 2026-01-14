class SubcontractorManager {
    constructor() {
        this.subcontractors = new Map();
        this.contracts = new Map();
        this.reviews = new Map();
        this.auditLogs = [];
    }

    // Enregistrer un sous-traitant
    registerSubcontractor(data) {
        const subcontractor = {
            id: this.generateId(),
            name: data.name,
            type: data.type, // processor, sub-processor
            services: data.services,
            dataAccess: data.dataAccess,
            location: data.location,
            contact: data.contact,
            registrationDate: new Date().toISOString(),
            status: 'active',
            riskLevel: this.calculateRiskLevel(data),
            certifications: data.certifications || []
        };

        this.subcontractors.set(subcontractor.id, subcontractor);
        this.logAudit('SUBCONTRACTOR_REGISTERED', subcontractor.id, data.name);
        return subcontractor.id;
    }

    // Associer un contrat à un sous-traitant
    attachContract(subcontractorId, contractData) {
        if (!this.subcontractors.has(subcontractorId)) {
            throw new Error('Sous-traitant non trouvé');
        }

        const contract = {
            id: this.generateId(),
            subcontractorId,
            type: contractData.type,
            signedDate: contractData.signedDate,
            expiryDate: contractData.expiryDate,
            clauses: contractData.clauses,
            gdprCompliant: false,
            reviewStatus: 'pending',
            filePath: contractData.filePath,
            version: contractData.version || '1.0'
        };

        this.contracts.set(contract.id, contract);
        this.logAudit('CONTRACT_ATTACHED', contract.id, subcontractorId);
        return contract.id;
    }

    // Effectuer une revue de conformité RGPD
    async performGDPRReview(contractId) {
        const contract = this.contracts.get(contractId);
        if (!contract) {
            throw new Error('Contrat non trouvé');
        }

        const review = {
            id: this.generateId(),
            contractId,
            reviewDate: new Date().toISOString(),
            reviewer: 'DPO', // Data Protection Officer
            checklist: this.getGDPRChecklist(),
            findings: [],
            recommendations: [],
            complianceScore: 0,
            status: 'in_progress'
        };

        // Analyser les clauses du contrat
        const analysis = await this.analyzeContractClauses(contract);
        review.findings = analysis.findings;
        review.recommendations = analysis.recommendations;
        review.complianceScore = analysis.score;
        review.status = 'completed';

        // Mettre à jour le statut de conformité du contrat
        contract.gdprCompliant = analysis.score >= 80;
        contract.reviewStatus = 'reviewed';
        contract.lastReviewDate = review.reviewDate;

        this.reviews.set(review.id, review);
        this.logAudit('GDPR_REVIEW_COMPLETED', contractId, analysis.score);

        return review;
    }

    // Analyser les clauses du contrat pour la conformité RGPD
    async analyzeContractClauses(contract) {
        const requiredClauses = [
            'data_processing_purpose',
            'data_categories',
            'data_retention',
            'data_security',
            'data_breach_notification',
            'data_subject_rights',
            'data_transfer_restrictions',
            'audit_rights',
            'subprocessor_management',
            'liability_limitations'
        ];

        let score = 0;
        const findings = [];
        const recommendations = [];

        for (const clauseType of requiredClauses) {
            const clause = contract.clauses[clauseType];
            const analysis = this.analyzeClause(clauseType, clause);
            
            score += analysis.score;
            if (analysis.finding) findings.push(analysis.finding);
            if (analysis.recommendation) recommendations.push(analysis.recommendation);
        }

        return {
            score: Math.round(score / requiredClauses.length),
            findings,
            recommendations
        };
    }

    // Analyser une clause spécifique
    analyzeClause(type, clause) {
        const analysis = { score: 0, finding: null, recommendation: null };

        if (!clause) {
            analysis.finding = `Clause manquante: ${type}`;
            analysis.recommendation = `Ajouter la clause ${type} conforme au RGPD`;
            return analysis;
        }

        switch (type) {
            case 'data_processing_purpose':
                if (clause.includes('purpose') && clause.includes('lawful basis')) {
                    analysis.score = 100;
                } else {
                    analysis.score = 50;
                    analysis.recommendation = 'Préciser la finalité et la base légale du traitement';
                }
                break;

            case 'data_security':
                if (clause.includes('encryption') && clause.includes('access control')) {
                    analysis.score = 100;
                } else {
                    analysis.score = 60;
                    analysis.recommendation = 'Renforcer les mesures de sécurité technique';
                }
                break;

            case 'data_breach_notification':
                if (clause.includes('72 hours') && clause.includes('notification')) {
                    analysis.score = 100;
                } else {
                    analysis.score = 30;
                    analysis.recommendation = 'Spécifier les délais de notification (72h)';
                }
                break;

            default:
                analysis.score = clause.length > 50 ? 80 : 40;
        }

        return analysis;
    }

    // Générer un rapport d'audit
    generateAuditReport(subcontractorId = null) {
        const report = {
            generatedDate: new Date().toISOString(),
            totalSubcontractors: this.subcontractors.size,
            totalContracts: this.contracts.size,
            compliantContracts: 0,
            nonCompliantContracts: 0,
            pendingReviews: 0,
            highRiskSubcontractors: 0,
            details: []
        };

        for (const [id, subcontractor] of this.subcontractors) {
            if (subcontractorId && id !== subcontractorId) continue;

            const subcontractorContracts = Array.from(this.contracts.values())
                .filter(c => c.subcontractorId === id);

            const detail = {
                subcontractor,
                contractsCount: subcontractorContracts.length,
                compliantContracts: subcontractorContracts.filter(c => c.gdprCompliant).length,
                lastReviewDate: this.getLastReviewDate(id),
                riskLevel: subcontractor.riskLevel,
                recommendations: this.getSubcontractorRecommendations(id)
            };

            report.details.push(detail);

            // Mise à jour des compteurs
            subcontractorContracts.forEach(contract => {
                if (contract.gdprCompliant) {
                    report.compliantContracts++;
                } else {
                    report.nonCompliantContracts++;
                }

                if (contract.reviewStatus === 'pending') {
                    report.pendingReviews++;
                }
            });

            if (subcontractor.riskLevel === 'high') {
                report.highRiskSubcontractors++;
            }
        }

        this.logAudit('AUDIT_REPORT_GENERATED', null, report.totalSubcontractors);
        return report;
    }

    // Calculer le niveau de risque d'un sous-traitant
    calculateRiskLevel(data) {
        let riskScore = 0;

        // Facteurs de risque
        if (data.dataAccess.includes('personal_data')) riskScore += 30;
        if (data.dataAccess.includes('sensitive_data')) riskScore += 50;
        if (data.location && data.location.country !== 'EU') riskScore += 20;
        if (!data.certifications || data.certifications.length === 0) riskScore += 25;
        if (data.type === 'sub-processor') riskScore += 15;

        if (riskScore >= 70) return 'high';
        if (riskScore >= 40) return 'medium';
        return 'low';
    }

    // Obtenir la checklist RGPD
    getGDPRChecklist() {
        return [
            { id: 1, item: 'Finalité du traitement définie', mandatory: true },
            { id: 2, item: 'Base légale spécifiée', mandatory: true },
            { id: 3, item: 'Catégories de données identifiées', mandatory: true },
            { id: 4, item: 'Durée de conservation définie', mandatory: true },
            { id: 5, item: 'Mesures de sécurité techniques', mandatory: true },
            { id: 6, item: 'Procédure de notification de violation', mandatory: true },
            { id: 7, item: 'Droits des personnes concernées', mandatory: true },
            { id: 8, item: 'Restrictions de transfert', mandatory: true },
            { id: 9, item: 'Droit d\'audit du responsable de traitement', mandatory: true },
            { id: 10, item: 'Gestion des sous-traitants ultérieurs', mandatory: false }
        ];
    }

    // Utilitaires
    generateId() {
        return 'SC_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    logAudit(action, entityId, details) {
        this.auditLogs.push({
            timestamp: new Date().toISOString(),
            action,
            entityId,
            details,
            user: 'system'
        });
    }

    getLastReviewDate(subcontractorId) {
        const contracts = Array.from(this.contracts.values())
            .filter(c => c.subcontractorId === subcontractorId);
        
        const dates = contracts
            .filter(c => c.lastReviewDate)
            .map(c => new Date(c.lastReviewDate));

        return dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;
    }

    getSubcontractorRecommendations(subcontractorId) {
        const recommendations = [];
        const subcontractor = this.subcontractors.get(subcontractorId);
        
        if (subcontractor.riskLevel === 'high') {
            recommendations.push('Effectuer un audit de sécurité approfondi');
        }

        const contracts = Array.from(this.contracts.values())
            .filter(c => c.subcontractorId === subcontractorId);

        const nonCompliant = contracts.filter(c => !c.gdprCompliant);
        if (nonCompliant.length > 0) {
            recommendations.push('Mettre à jour les contrats non conformes');
        }

        return recommendations;
    }
}

export default SubcontractorManager;
