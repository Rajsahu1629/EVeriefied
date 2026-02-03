const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('🔗 Connecting to database...');

        // Add columns if they don't exist
        const queries = [
            "ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS full_address TEXT;",
            "ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS city VARCHAR(100);",
            "ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS state VARCHAR(100);",
            "ALTER TABLE recruiters ADD COLUMN IF NOT EXISTS pincode VARCHAR(10);"
        ];

        for (const query of queries) {
            console.log(`Running: ${query}`);
            await pool.query(query);
        }

        console.log('✅ Migration connection successful! Columns added.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
