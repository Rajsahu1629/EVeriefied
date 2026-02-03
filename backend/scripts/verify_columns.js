const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function verify() {
    try {
        console.log('🔗 Connecting to:', process.env.DATABASE_URL.split('@')[1]); // Show usage host for confirmation

        const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recruiters';
    `);

        console.log('\n📊 Columns in "recruiters" table:');
        console.table(result.rows);

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        await pool.end();
    }
}

verify();
