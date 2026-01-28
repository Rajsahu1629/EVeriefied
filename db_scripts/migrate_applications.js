#!/usr/bin/env node

/**
 * Database Migration Script - Application Features
 * 
 * Adds job_applications table and updates existing tables if needed.
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ Error: EXPO_PUBLIC_DATABASE_URL not found in .env file');
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🚀 Starting application schema migration...\n');

    try {
        // Create job_applications table
        console.log('📝 Creating job_applications table...');
        await sql`
      CREATE TABLE IF NOT EXISTS job_applications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        job_post_id INTEGER NOT NULL REFERENCES job_posts(id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, job_post_id)
      )
    `;
        console.log('✅ Job applications table created\n');

        // Create index for faster lookups
        console.log('📝 Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_applications_user ON job_applications(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_applications_job ON job_applications(job_post_id)`;
        console.log('✅ Indexes created\n');

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
