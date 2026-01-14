const fs = require('fs');
const https = require('https');

class TLSConfig {
    constructor() {
        this.options = {
            // Certificats SSL/TLS
            key: this.loadCertificate(process.env.TLS_PRIVATE_KEY_PATH),
            cert: this.loadCertificate(process.env.TLS_CERTIFICATE_PATH),
            ca: this.loadCertificate(process.env.TLS_CA_PATH),
            
            // Configuration de sécurité TLS
            secureProtocol: 'TLSv1_2_method',
            ciphers: [
                'ECDHE-RSA-AES128-GCM-SHA256',
                'ECDHE-RSA-AES256-GCM-SHA384',
                'ECDHE-RSA-AES128-SHA256',
                'ECDHE-RSA-AES256-SHA384'
            ].join(':'),
            honorCipherOrder: true,
            secureOptions: require('constants').SSL_OP_NO_SSLv2 | 
                          require('constants').SSL_OP_NO_SSLv3 |
                          require('constants').SSL_OP_NO_TLSv1 |
                          require('constants').SSL_OP_NO_TLSv1_1
        };
    }

    loadCertificate(path) {
        if (!path) return null;
        
        try {
            return fs.readFileSync(path);
        } catch (error) {
            console.error(`Failed to load certificate from ${path}:`, error);
            return null;
        }
    }

    createHTTPSServer(app) {
        if (!this.options.key || !this.options.cert) {
            console.warn('TLS certificates not found. Using HTTP instead of HTTPS.');
            return null;
        }
        
        return https.createServer(this.options, app);
    }

    // Configuration pour les requêtes HTTPS sortantes
    getHTTPSAgentConfig() {
        return {
            rejectUnauthorized: true,
            secureProtocol: 'TLSv1_2_method',
            ciphers: this.options.ciphers
        };
    }
}

module.exports = new TLSConfig();
