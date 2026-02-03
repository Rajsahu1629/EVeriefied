const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: EXPO_PUBLIC_DATABASE_URL not found in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addBS6Columns() {
    console.log('🚀 Starting BS6 columns migration...');

    try {
        console.log('📝 Adding domain and vehicle_category columns to users table...');

        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS domain TEXT,
      ADD COLUMN IF NOT EXISTS vehicle_category TEXT;
    `;

        console.log('✅ Columns added successfully');

        // Verify columns
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('domain', 'vehicle_category');
    `;

        console.log('🔍 Verified columns:', columns);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addBS6Columns();
