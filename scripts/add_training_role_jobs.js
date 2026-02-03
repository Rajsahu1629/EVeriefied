require('dotenv').config();
const { Pool } = require('pg');

async function migrate() {
    const connectionString = process.env.EXPO_PUBLIC_DATABASE_URL;

    if (!connectionString) {
        console.error('EXPO_PUBLIC_DATABASE_URL not found in environment');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        console.log('Adding training_role column to job_posts...');
        await pool.query(`
            ALTER TABLE job_posts 
            ADD COLUMN IF NOT EXISTS training_role VARCHAR(100) DEFAULT NULL
        `);
        console.log('Migration successful');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await pool.end();
    }
}

migrate();
