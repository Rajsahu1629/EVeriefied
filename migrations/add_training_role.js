const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: EXPO_PUBLIC_DATABASE_URL not found in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addTrainingRoleColumn() {
    console.log('🚀 Starting Training Role column migration...');

    try {
        console.log('📝 Adding training_role column to users table...');

        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS training_role TEXT;
    `;

        console.log('✅ Column added successfully');

        // Verify columns
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'training_role';
    `;

        console.log('🔍 Verified columns:', columns);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

addTrainingRoleColumn();
