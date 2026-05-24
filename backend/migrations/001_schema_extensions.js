#!/usr/bin/env node
/**
 * Incremental schema migration — safe to re-run on new or existing RDS.
 *
 * Run from backend/:
 *   node migrations/001_schema_extensions.js
 *   npm run migrate:schema
 *
 * Does NOT drop data or re-seed verification questions.
 * For a brand-new empty database, run migrate_rds.js first, then this script.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

function poolConfig() {
    const url = process.env.DATABASE_URL;
    if (!url) {
        throw new Error('DATABASE_URL is not set in backend/.env');
    }
    const isLocal =
        url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        process.env.DATABASE_SSL === 'false';
    if (isLocal) {
        return { connectionString: url };
    }
    return {
        connectionString: url.replace(/\?.*$/, ''),
        ssl: { rejectUnauthorized: false },
    };
}

async function run(client, label, sql) {
    console.log(`  → ${label}`);
    await client.query(sql);
}

async function migrate() {
    const pool = new Pool(poolConfig());
    const client = await pool.connect();

    try {
        console.log('🚀 EVeerified schema extensions (001)\n');

        // ── users ──────────────────────────────────────────────────────────
        console.log('📝 users');
        await run(client, 'profile & verification extras', `
            ALTER TABLE users
                ADD COLUMN IF NOT EXISTS current_salary VARCHAR(50),
                ADD COLUMN IF NOT EXISTS card_ordered BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS card_fulfillment_status VARCHAR(30) DEFAULT 'ordered',
                ADD COLUMN IF NOT EXISTS push_token TEXT,
                ADD COLUMN IF NOT EXISTS last_quiz_attempt TIMESTAMP,
                ADD COLUMN IF NOT EXISTS domain TEXT,
                ADD COLUMN IF NOT EXISTS vehicle_category TEXT,
                ADD COLUMN IF NOT EXISTS training_role TEXT;
        `);
        await client.query(`
            UPDATE users SET card_fulfillment_status = 'ordered'
            WHERE card_ordered = true
              AND (card_fulfillment_status IS NULL OR card_fulfillment_status = '');
        `);

        // ── recruiters ─────────────────────────────────────────────────────
        console.log('📝 recruiters');
        await run(client, 'address & push', `
            ALTER TABLE recruiters
                ADD COLUMN IF NOT EXISTS full_address TEXT,
                ADD COLUMN IF NOT EXISTS city VARCHAR(100),
                ADD COLUMN IF NOT EXISTS state VARCHAR(100),
                ADD COLUMN IF NOT EXISTS pincode VARCHAR(10),
                ADD COLUMN IF NOT EXISTS push_token TEXT;
        `);

        // ── job_posts ──────────────────────────────────────────────────────
        console.log('📝 job_posts');
        await run(client, 'admin & kapil_01 job fields', `
            ALTER TABLE job_posts
                ADD COLUMN IF NOT EXISTS vacancies_filled BOOLEAN DEFAULT FALSE,
                ADD COLUMN IF NOT EXISTS vehicle_category VARCHAR(10),
                ADD COLUMN IF NOT EXISTS training_role VARCHAR(100);
        `);

        // ── job_applications ───────────────────────────────────────────────
        console.log('📝 job_applications');
        await run(client, 'admin workflow', `
            ALTER TABLE job_applications
                ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
                ADD COLUMN IF NOT EXISTS admin_notes TEXT,
                ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;
        `);

        // ── verification_questions (i18n columns) ──────────────────────────
        console.log('📝 verification_questions');
        await run(client, 'regional question text', `
            ALTER TABLE verification_questions
                ADD COLUMN IF NOT EXISTS question_text_mr TEXT,
                ADD COLUMN IF NOT EXISTS question_text_kn TEXT,
                ADD COLUMN IF NOT EXISTS question_text_te TEXT,
                ADD COLUMN IF NOT EXISTS question_text_or TEXT;
        `);

        // ── quiz_scores ────────────────────────────────────────────────────
        console.log('📝 quiz_scores');
        await run(client, 'leaderboard table', `
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                score INTEGER NOT NULL DEFAULT 0,
                played_at DATE DEFAULT CURRENT_DATE
            );
        `);
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_scores_user_day
                ON quiz_scores (user_id, played_at);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id);
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_quiz_scores_played ON quiz_scores(played_at);
        `);

        // ── verify ─────────────────────────────────────────────────────────
        console.log('\n🔍 Verifying required columns...');
        const checks = [
            ['users', 'card_fulfillment_status'],
            ['users', 'push_token'],
            ['users', 'current_salary'],
            ['users', 'last_quiz_attempt'],
            ['recruiters', 'full_address'],
            ['recruiters', 'push_token'],
            ['job_posts', 'vacancies_filled'],
            ['job_posts', 'vehicle_category'],
            ['job_posts', 'training_role'],
            ['job_applications', 'rejection_reason'],
            ['job_applications', 'admin_notes'],
            ['job_applications', 'status_updated_at'],
        ];

        for (const [table, column] of checks) {
            const res = await client.query(
                `SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                [table, column]
            );
            if (res.rowCount === 0) {
                throw new Error(`Missing column ${table}.${column} after migration`);
            }
            console.log(`   ✓ ${table}.${column}`);
        }

        const tables = await client.query(
            `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`
        );
        console.log('\n📋 Tables:', tables.rows.map((r) => r.tablename).join(', '));
        console.log('\n✅ Schema extensions migration complete.\n');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
