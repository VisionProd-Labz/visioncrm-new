const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const DB_PATH = process.env.DB_PATH || './data/visioncrm.db';

// Créer le dossier data s'il n'existe pas
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    logger.error('Erreur connexion base de données:', err);
  } else {
    logger.info('Connexion à la base de données SQLite établie');
  }
});

async function initDatabase() {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Table des utilisateurs
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        active INTEGER DEFAULT 1
      )`);

      // Table des contacts (avec champs RGPD)
      db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        position TEXT,
        address TEXT,
        notes TEXT,
        source TEXT,
        status TEXT DEFAULT 'active',
        assigned_to INTEGER,
        consent_marketing INTEGER DEFAULT 0,
        consent_data_processing INTEGER DEFAULT 1,
        consent_date DATETIME,
        consent_ip TEXT,
        last_contact_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_retention_until DATETIME,
        is_anonymized INTEGER DEFAULT 0,
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )`);

      // Table des activités
      db.run(`CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        date DATETIME NOT NULL,
        status TEXT DEFAULT 'completed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Table des logs RGPD
      db.run(`CREATE TABLE IF NOT EXISTS gdpr_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        user_id INTEGER,
        action TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )`);

      // Table des demandes RGPD
      db.run(`CREATE TABLE IF NOT EXISTS gdpr_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER,
        email TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reason TEXT,
        processed_by INTEGER,
        processed_at DATETIME,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id),
        FOREIGN KEY (processed_by) REFERENCES users (id)
      )`);

      // Table des consentements
      db.run(`CREATE TABLE IF NOT EXISTS consents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contact_id INTEGER NOT NULL,
        consent_type TEXT NOT NULL,
        granted INTEGER NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        source TEXT,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
      )`);

      // Créer un utilisateur admin par défaut
      const bcrypt = require('bcryptjs');
      const adminPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
              VALUES ('admin', 'admin@visioncrm.com', ?, 'admin')`, 
              [adminPassword], (err) => {
        if (err) {
          logger.error('Erreur création admin:', err);
          reject(err);
        } else {
          logger.info('Base de données initialisée avec succès');
          resolve();
        }
      });
    });
  });
}

module.exports = { db, initDatabase };
