import React, { useState, useEffect } from 'react';
import SubcontractorManager from './SubcontractorManager.js';

const ContractReviewUI = () => {
    const [manager] = useState(new SubcontractorManager());
    const [subcontractors, setSubcontractors] = useState([]);
    const [selectedSubcontractor, setSelectedSubcontractor] = useState(null);
    const [auditReport, setAuditReport] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadSubcontractors();
    }, []);

    const loadSubcontractors = () => {
        const data = Array.from(manager.subcontractors.values());
        setSubcontractors(data);
    };

    const handlePerformReview = async (contractId) => {
        try {
            const review = await manager.performGDPRReview(contractId);
            alert(`Revue terminée. Score de conformité: ${review.complianceScore}%`);
            loadSubcontractors();
        } catch (error) {
            alert(`Erreur lors de la revue: ${error.message}`);
        }
    };

    const generateAuditReport = () => {
        const report = manager.generateAuditReport();
        setAuditReport(report);
        setActiveTab('audit');
    };

    const getRiskLevelColor = (level) => {
        switch (level) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gestion des Sous-traitants RGPD
                </h1>
                <p className="text-gray-600">
                    Revue et gestion des contrats sous-traitants pour la conformité RGPD
                </p>
            </div>

            {/* Navigation */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { id: 'overview', label: 'Vue d\'ensemble' },
                        { id: 'subcontractors', label: 'Sous-traitants' },
                        { id: 'contracts', label: 'Contrats' },
                        { id: 'audit', label: 'Audit' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Sous-traitants</h3>
                        <p className="text-3xl font-bold text-blue-600">{manager.subcontractors.size}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Contrats</h3>
                        <p className="text-3xl font-bold text-green-600">{manager.contracts.size}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">Conformes RGPD</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {Array.from(manager.contracts.values()).filter(c => c.gdprCompliant).length}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium text-gray-900">À risque élevé</h3>
                        <p className="text-3xl font-bold text-red-600">
                            {Array.from(manager.subcontractors.values()).filter(s => s.riskLevel === 'high').length}
                        </p>
                    </div>
                </div>
            )}

            {/* Liste des sous-traitants */}
            {activeTab === 'subcontractors' && (
                <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Liste des Sous-traitants
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Nom
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Risque
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Localisation
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {subcontractors.map(subcontractor => (
                                        <tr key={subcontractor.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {subcontractor.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {subcontractor.type}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(subcontractor.riskLevel)}`}>
                                                    {subcontractor.riskLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {subcontractor.location?.country || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => setSelectedSubcontractor(subcontractor)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    Détails
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Rapport d'audit */}
            {activeTab === 'audit' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                            Rapport d'Audit RGPD
                        </h3>
                        <button
                            onClick={generateAuditReport}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Générer le Rapport
                        </button>
                    </div>

                    {auditReport && (
                        <div className="bg-white shadow rounded-lg p-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">
                                        {auditReport.totalSubcontractors}
                                    </p>
                                    <p className="text-sm text-gray-500">Sous-traitants</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">
                                        {auditReport.compliantContracts}
                                    </p>
                                    <p className="text-sm text-gray-500">Contrats conformes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">
                                        {auditReport.nonCompliantContracts}
                                    </p>
                                    <p className="text-sm text-gray-500">Non conformes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {auditReport.pendingReviews}
                                    </p>
                                    <p className="text-sm text-gray-500">En attente</p>
                                </div>
                            </div>

                            <h4 className="font-medium text-gray-900 mb-4">Détails par Sous-traitant</h4>
                            <div className="space-y-4">
                                {auditReport.details.map((detail, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h5 className="font-medium text-gray-900">
                                                {detail.subcontractor.name}
                                            </h5>
                                            <span className={`px-2 py-1 text-xs rounded-full ${getRiskLevelColor(detail.riskLevel)}`}>
                                                {detail.riskLevel}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Contrats: </span>
                                                <span className="font-medium">{detail.contractsCount}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Conformes: </span>
                                                <span className="font-medium text-green-600">
                                                    {detail.compliantContracts}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Dernière revue: </span>
                                                <span className="font-medium">
                                                    {detail.lastReviewDate ? 
                                                        new Date(detail.lastReviewDate).toLocaleDateString() : 
                                                        'Jamais'
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        {detail.recommendations.length > 0 && (
                                            <div className="mt-3">
                                                <p className="text-sm text-gray-500 mb-1">Recommandations:</p>
                                                <ul className="text-sm text-orange-700 space-y-1">
                                                    {detail.recommendations.map((rec, i) => (
                                                        <li key={i}>• {rec}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContractReviewUI;
