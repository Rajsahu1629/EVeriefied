/**
 * Run: node migrations/admin_features.js
 * Adds columns for admin application workflow, card fulfillment, vacancy filled.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

async function migrate() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });
    const client = await pool.connect();
    try {
        console.log('Running admin_features migration...');

        await client.query(`
      ALTER TABLE job_applications
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS admin_notes TEXT,
        ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;
    `);

        await client.query(`
      ALTER TABLE job_posts
        ADD COLUMN IF NOT EXISTS vacancies_filled BOOLEAN DEFAULT FALSE;
    `);

        await client.query(`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS card_fulfillment_status VARCHAR(30) DEFAULT 'ordered';
    `);

        await client.query(`
      UPDATE users SET card_fulfillment_status = 'ordered'
      WHERE card_ordered = true AND (card_fulfillment_status IS NULL OR card_fulfillment_status = '');
    `);

        console.log('✅ admin_features migration complete');
    } finally {
        client.release();
        await pool.end();
    }
}

migrate().catch((e) => {
    console.error(e);
    process.exit(1);
});
