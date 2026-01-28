require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: EXPO_PUBLIC_DATABASE_URL not found in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🚀 Adding current_salary column...');
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS current_salary TEXT`;
        console.log('✅ Successfully added current_salary column!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
