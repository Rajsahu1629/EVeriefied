const { Pool } = require('pg');
require('dotenv').config({ path: require('path').join(__dirname, '..', 'backend', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL not found in backend/.env');
    process.exit(1);
}

const pool = new Pool({
    connectionString: DATABASE_URL.replace('sslmode=require', ''),
    ssl: { rejectUnauthorized: false },
});

async function addLocationColumns() {
    console.log('🚀 Starting location columns migration...');
    const client = await pool.connect();

    try {
        // 1. Add latitude/longitude to users table
        console.log('📝 Adding latitude and longitude columns to users table...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
        `);
        console.log('✅ Users table updated');

        // 2. Add latitude/longitude to job_posts table
        console.log('📝 Adding latitude and longitude columns to job_posts table...');
        await client.query(`
            ALTER TABLE job_posts 
            ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
            ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
        `);
        console.log('✅ Job_posts table updated');

        // 3. Add index for location-based queries on job_posts
        console.log('📝 Adding location index on job_posts...');
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_jobs_location ON job_posts (latitude, longitude);
        `);
        console.log('✅ Index created');

        // 4. Normalize existing city values to lowercase
        console.log('📝 Normalizing city values to lowercase...');
        await client.query(`UPDATE users SET city = LOWER(TRIM(city)) WHERE city IS NOT NULL;`);
        await client.query(`UPDATE job_posts SET city = LOWER(TRIM(city)) WHERE city IS NOT NULL;`);
        console.log('✅ City values normalized');

        // Verify columns
        const userCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('latitude', 'longitude');
        `);
        console.log('🔍 Users columns:', userCols.rows);

        const jobCols = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'job_posts' 
            AND column_name IN ('latitude', 'longitude');
        `);
        console.log('🔍 Job_posts columns:', jobCols.rows);

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

addLocationColumns();
