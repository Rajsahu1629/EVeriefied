/**
 * Quick migration: Add missing columns to job_posts table
 */
const { Pool } = require('pg');
require('dotenv').config();

// Remove sslmode from URL to avoid pg driver warning, set SSL manually
const dbUrl = process.env.DATABASE_URL.replace('?sslmode=require', '');
const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🔧 Adding missing columns to job_posts...');

        await client.query(`
            ALTER TABLE job_posts 
            ADD COLUMN IF NOT EXISTS vehicle_category VARCHAR(10),
            ADD COLUMN IF NOT EXISTS training_role VARCHAR(100);
        `);
        console.log('✅ Added vehicle_category and training_role to job_posts');

        // Verify
        const res = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'job_posts' ORDER BY ordinal_position;
        `);
        console.log('📋 job_posts columns:', res.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('❌ Migration error:', err.message);
    } finally {
        client.release();
        pool.end();
    }
}

migrate();
