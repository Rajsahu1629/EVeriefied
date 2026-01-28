#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ EXPO_PUBLIC_DATABASE_URL not found'); process.exit(1); }

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🚀 Adding job status column for approval system...');
    try {
        // Add status column
        await sql`ALTER TABLE job_posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'`;
        console.log('✅ Added status column');

        // Set all existing jobs to approved (so they remain visible)
        await sql`UPDATE job_posts SET status = 'approved' WHERE status IS NULL OR status = 'pending'`;
        console.log('✅ Set existing jobs to approved');

        // Verify
        const result = await sql`SELECT status, COUNT(*) as cnt FROM job_posts GROUP BY status`;
        console.log('📊 Job status counts:', result);

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
