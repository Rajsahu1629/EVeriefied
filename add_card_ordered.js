#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ EXPO_PUBLIC_DATABASE_URL not found'); process.exit(1); }

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🚀 Adding card_ordered column to users table...');
    try {
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS card_ordered BOOLEAN DEFAULT FALSE`;
        console.log('✅ Successfully added card_ordered column!');

        // Verify
        const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'card_ordered'`;
        console.log('Column exists:', result.length > 0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
