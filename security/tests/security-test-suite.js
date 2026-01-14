/**
 * Suite de tests de sécurité pour VisionCRM
 * Tests automatisés pour identifier les vulnérabilités
 */

const request = require('supertest');
const app = require('../../src/server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

describe('Security Test Suite', () => {
    
    describe('Authentication Security', () => {
        
        test('Should prevent SQL injection in login', async () => {
            const maliciousPayload = {
                email: "admin' OR '1'='1' --",
                password: "anything"
            };
            
            const response = await request(app)
                .post('/api/auth/login')
                .send(maliciousPayload);
            
            expect(response.status).not.toBe(200);
            expect(response.body.token).toBeUndefined();
        });
        
        test('Should enforce rate limiting on login attempts', async () => {
            const loginPayload = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            
            // Faire 10 tentatives de connexion rapides
            const promises = Array(10).fill().map(() => 
                request(app)
                    .post('/api/auth/login')
                    .send(loginPayload)
            );
            
            const responses = await Promise.all(promises);
            const tooManyRequests = responses.some(r => r.status === 429);
            
            expect(tooManyRequests).toBe(true);
        });
        
        test('Should validate JWT token properly', async () => {
            const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid';
            
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${invalidToken}`);
            
            expect(response.status).toBe(401);
        });
        
        test('Should require strong passwords', async () => {
            const weakPasswords = ['123', 'password', '12345678'];
            
            for (const weakPassword of weakPasswords) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        email: 'test@example.com',
                        password: weakPassword,
                        name: 'Test User'
                    });
                
                expect(response.status).toBe(400);
                expect(response.body.error).toContain('password');
            }
        });
    });
    
    describe('Input Validation Security', () => {
        
        test('Should prevent XSS in user inputs', async () => {
            const xssPayloads = [
                '<script>alert("xss")</script>',
                'javascript:alert("xss")',
                '<img src="x" onerror="alert(\'xss\')">'
            ];
            
            for (const payload of xssPayloads) {
                const response = await request(app)
                    .post('/api/clients')
                    .send({
                        name: payload,
                        email: 'test@example.com'
                    });
                
                expect(response.status).toBe(400);
            }
        });
        
        test('Should validate email formats strictly', async () => {
            const invalidEmails = [
                'notanemail',
                '@example.com',
                'test@',
                'test..test@example.com'
            ];
            
            for (const email of invalidEmails) {
                const response = await request(app)
                    .post('/api/clients')
                    .send({
                        name: 'Test Client',
                        email: email
                    });
                
                expect(response.status).toBe(400);
            }
        });
        
        test('Should prevent directory traversal in file operations', async () => {
            const maliciousPaths = [
                '../../../etc/passwd',
                '..\\..\\windows\\system32\\config\\sam',
                '/etc/shadow'
            ];
            
            for (const path of maliciousPaths) {
                const response = await request(app)
                    .get(`/api/files/${encodeURIComponent(path)}`);
                
                expect(response.status).toBe(400);
            }
        });
    });
    
    describe('Authorization Security', () => {
        
        test('Should prevent unauthorized access to admin endpoints', async () => {
            const userToken = jwt.sign({ id: 1, role: 'user' }, process.env.JWT_SECRET);
            
            const response = await request(app)
                .get('/api/admin/users')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(403);
        });
        
        test('Should prevent users from accessing other users data', async () => {
            const userToken = jwt.sign({ id: 1, role: 'user' }, process.env.JWT_SECRET);
            
            const response = await request(app)
                .get('/api/users/2/profile')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(response.status).toBe(403);
        });
    });
    
    describe('File Upload Security', () => {
        
        test('Should reject dangerous file types', async () => {
            const dangerousFiles = ['test.exe', 'malware.bat', 'script.php'];
            
            for (const filename of dangerousFiles) {
                const response = await request(app)
                    .post('/api/upload')
                    .attach('file', Buffer.from('malicious content'), filename);
                
                expect(response.status).toBe(400);
            }
        });
        
        test('Should limit file sizes', async () => {
            const largeBuffer = Buffer.alloc(50 * 1024 * 1024); // 50MB
            
            const response = await request(app)
                .post('/api/upload')
                .attach('file', largeBuffer, 'large.txt');
            
            expect(response.status).toBe(413);
        });
    });
    
    describe('API Security Headers', () => {
        
        test('Should include security headers', async () => {
            const response = await request(app).get('/');
            
            expect(response.headers['x-frame-options']).toBe('DENY');
            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-xss-protection']).toBe('1; mode=block');
            expect(response.headers['strict-transport-security']).toBeDefined();
        });
    });
});
