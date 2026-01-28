const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('DB URL Loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
console.log('DB URL Start:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 15) : 'N/A');

async function migrate() {
    try {
        console.log('Adding preferred_salary column to users table...');
        await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS preferred_salary TEXT;
    `);
        console.log('✅ Successfully added preferred_salary column');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
