#!/usr/bin/env node

/**
 * Database Migration Script
 * 
 * This script creates all required tables in the Neon PostgreSQL database.
 * Run with: node migrate.js
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
  console.log('🚀 Starting database migration...\n');

  try {
    // Create users table
    console.log('📝 Creating users table...');
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        city VARCHAR(100),
        pincode VARCHAR(10),
        qualification VARCHAR(50),
        experience VARCHAR(50),
        current_workshop VARCHAR(255),
        brand_workshop VARCHAR(255),
        brands JSONB,
        role VARCHAR(50) NOT NULL DEFAULT 'technician',
        verification_status VARCHAR(50) DEFAULT 'pending',
        verification_step INTEGER DEFAULT 0,
        quiz_score INTEGER,
        total_questions INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created\n');

    // Create recruiters table
    console.log('📝 Creating recruiters table...');
    await sql`
      CREATE TABLE IF NOT EXISTS recruiters (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        phone_number VARCHAR(15) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Recruiters table created\n');

    // Create job_posts table
    console.log('📝 Creating job_posts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS job_posts (
        id SERIAL PRIMARY KEY,
        recruiter_id INTEGER NOT NULL REFERENCES recruiters(id) ON DELETE CASCADE,
        brand VARCHAR(100) NOT NULL,
        role_required VARCHAR(100) NOT NULL,
        number_of_people VARCHAR(10),
        experience VARCHAR(50),
        salary_min INTEGER,
        salary_max INTEGER,
        has_incentive BOOLEAN DEFAULT FALSE,
        pincode VARCHAR(10),
        city VARCHAR(100),
        stay_provided BOOLEAN DEFAULT FALSE,
        urgency VARCHAR(50) DEFAULT 'within_7_days',
        status VARCHAR(50) DEFAULT 'received',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Job posts table created\n');

    // Create indexes
    console.log('📝 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_recruiters_phone ON recruiters(phone_number)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_posts_recruiter ON job_posts(recruiter_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_job_posts_active ON job_posts(is_active)`;
    console.log('✅ Indexes created\n');

    // Verify tables
    console.log('🔍 Verifying tables...');
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename
    `;

    console.log('✅ Database tables:');
    tables.forEach(t => console.log(`   - ${t.tablename}`));

    console.log('\n🎉 Migration completed successfully!');
    console.log('\nYou can now test your app registration flows.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
