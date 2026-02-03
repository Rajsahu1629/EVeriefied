
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('Error: EXPO_PUBLIC_DATABASE_URL is not defined');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function addAdminVerifiedColumn() {
    try {
        console.log('Adding is_admin_verified column to users table...');

        await sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS is_admin_verified BOOLEAN DEFAULT FALSE;
    `;

        console.log('✅ Successfully added is_admin_verified column!');
    } catch (error) {
        console.error('❌ Error adding column:', error);
    }
}

addAdminVerifiedColumn();
