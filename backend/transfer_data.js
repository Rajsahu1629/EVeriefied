#!/usr/bin/env node

/**
 * Transfer data from OLD Neon DB → NEW RDS DB
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { Pool } = require('pg');

// ── OLD Neon Database ──
const NEON_URL = 'postgresql://neondb_owner:npg_6HQ7hJAmESgU@ep-twilight-cell-ahbcjnik-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';
const neonSql = neon(NEON_URL);

// ── NEW RDS Database ──
const rdsPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function rdsQuery(text, params) {
    const client = await rdsPool.connect();
    try {
        const res = await client.query(text, params);
        return res.rows;
    } finally {
        client.release();
    }
}

async function transfer() {
    console.log('🚀 Starting Data Transfer: Neon → RDS\n');

    try {
        // ── 1. Transfer Users ──
        console.log('👤 Fetching users from Neon...');
        const users = await neonSql`SELECT * FROM users ORDER BY id`;
        console.log(`   Found ${users.length} users`);

        if (users.length > 0) {
            for (const u of users) {
                await rdsQuery(
                    `INSERT INTO users (id, full_name, phone_number, password, state, city, pincode, qualification, experience, current_workshop, brand_workshop, brands, role, verification_status, verification_step, quiz_score, total_questions, prior_knowledge, domain, vehicle_category, training_role, is_admin_verified, created_at, updated_at)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
                     ON CONFLICT (id) DO NOTHING`,
                    [u.id, u.full_name, u.phone_number, u.password, u.state, u.city, u.pincode, u.qualification, u.experience, u.current_workshop, u.brand_workshop, u.brands ? JSON.stringify(u.brands) : null, u.role, u.verification_status, u.verification_step, u.quiz_score, u.total_questions, u.prior_knowledge || null, u.domain || null, u.vehicle_category || null, u.training_role || null, u.is_admin_verified || false, u.created_at, u.updated_at]
                );
            }
            // Reset the sequence to the max ID
            await rdsQuery(`SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users))`);
            console.log(`✅ Transferred ${users.length} users\n`);
        }

        // ── 2. Transfer Recruiters ──
        console.log('🏢 Fetching recruiters from Neon...');
        const recruiters = await neonSql`SELECT * FROM recruiters ORDER BY id`;
        console.log(`   Found ${recruiters.length} recruiters`);

        if (recruiters.length > 0) {
            for (const r of recruiters) {
                await rdsQuery(
                    `INSERT INTO recruiters (id, company_name, entity_type, phone_number, password, created_at, updated_at)
                     VALUES ($1,$2,$3,$4,$5,$6,$7)
                     ON CONFLICT (id) DO NOTHING`,
                    [r.id, r.company_name, r.entity_type, r.phone_number, r.password, r.created_at, r.updated_at]
                );
            }
            await rdsQuery(`SELECT setval('recruiters_id_seq', (SELECT COALESCE(MAX(id), 1) FROM recruiters))`);
            console.log(`✅ Transferred ${recruiters.length} recruiters\n`);
        }

        // ── 3. Transfer Job Posts ──
        console.log('📋 Fetching job_posts from Neon...');
        const jobs = await neonSql`SELECT * FROM job_posts ORDER BY id`;
        console.log(`   Found ${jobs.length} job posts`);

        if (jobs.length > 0) {
            for (const j of jobs) {
                await rdsQuery(
                    `INSERT INTO job_posts (id, recruiter_id, brand, role_required, number_of_people, experience, salary_min, salary_max, has_incentive, pincode, city, stay_provided, urgency, status, is_active, job_description, created_at, updated_at)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
                     ON CONFLICT (id) DO NOTHING`,
                    [j.id, j.recruiter_id, j.brand, j.role_required, j.number_of_people, j.experience, j.salary_min, j.salary_max, j.has_incentive, j.pincode, j.city, j.stay_provided, j.urgency, j.status, j.is_active, j.job_description || null, j.created_at, j.updated_at]
                );
            }
            await rdsQuery(`SELECT setval('job_posts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM job_posts))`);
            console.log(`✅ Transferred ${jobs.length} job posts\n`);
        }

        // ── Summary ──
        console.log('═══════════════════════════════════════');
        console.log('📊 FINAL COUNTS IN RDS:');
        const uCount = await rdsQuery('SELECT COUNT(*) as count FROM users');
        const rCount = await rdsQuery('SELECT COUNT(*) as count FROM recruiters');
        const jCount = await rdsQuery('SELECT COUNT(*) as count FROM job_posts');
        const aCount = await rdsQuery('SELECT COUNT(*) as count FROM job_applications');
        const qCount = await rdsQuery('SELECT COUNT(*) as count FROM verification_questions');
        console.log(`   👤 Users:       ${uCount[0].count}`);
        console.log(`   🏢 Recruiters:  ${rCount[0].count}`);
        console.log(`   📋 Job Posts:   ${jCount[0].count}`);
        console.log(`   📝 Applications: ${aCount[0].count}`);
        console.log(`   ❓ Questions:   ${qCount[0].count}`);
        console.log('═══════════════════════════════════════');
        console.log('\n🎉 Data transfer complete! All your data is now in RDS! 🥳');

    } catch (error) {
        console.error('❌ Transfer failed:', error);
        process.exit(1);
    } finally {
        await rdsPool.end();
    }
}

transfer();
