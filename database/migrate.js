const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

async function runMigrations() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true
    });

    try {
        console.log('🔄 Exécution des migrations...');

        // Créer la table de migrations si elle n'existe pas
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Lire les migrations exécutées
        const [executedMigrations] = await connection.execute(
            'SELECT filename FROM migrations'
        );
        const executed = executedMigrations.map(row => row.filename);

        // Lire les fichiers de migration
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = await fs.readdir(migrationsDir);
        const migrationFiles = files
            .filter(file => file.endsWith('.sql'))
            .sort();

        for (const file of migrationFiles) {
            if (!executed.includes(file)) {
                console.log(`📋 Exécution de la migration: ${file}`);
                
                const migrationSQL = await fs.readFile(
                    path.join(migrationsDir, file), 
                    'utf8'
                );
                
                await connection.execute(migrationSQL);
                await connection.execute(
                    'INSERT INTO migrations (filename) VALUES (?)',
                    [file]
                );
                
                console.log(`✅ Migration ${file} exécutée avec succès`);
            }
        }

        console.log('✅ Toutes les migrations ont été exécutées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'exécution des migrations:', error);
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    runMigrations().catch(console.error);
}

module.exports = runMigrations;
