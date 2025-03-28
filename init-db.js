const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function initDb() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await pool.connect();
    
    console.log('Running migrations...');
    const sql = fs.readFileSync(path.join(__dirname, 'db/migrations/init.sql'), 'utf8');
    
    await pool.query(sql);
    console.log('Database initialization complete');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDb();
