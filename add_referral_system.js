#!/usr/bin/env node
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;
if (!DATABASE_URL) { console.error('❌ EXPO_PUBLIC_DATABASE_URL not found'); process.exit(1); }

const sql = neon(DATABASE_URL);

async function migrate() {
    console.log('🚀 Adding referral system columns...');
    try {
        // Add referral columns to users table
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_code VARCHAR(10) UNIQUE`;
        console.log('✅ Added referral_code column');

        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by VARCHAR(10)`;
        console.log('✅ Added referred_by column');

        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_count INTEGER DEFAULT 0`;
        console.log('✅ Added referral_count column');

        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS referral_earnings INTEGER DEFAULT 0`;
        console.log('✅ Added referral_earnings column');

        // Generate referral codes for existing users who don't have one
        const usersWithoutCode = await sql`SELECT id, full_name FROM users WHERE referral_code IS NULL`;
        console.log(`Found ${usersWithoutCode.length} users without referral codes`);

        for (const user of usersWithoutCode) {
            // Generate a unique 6-character code
            const code = `EV${user.id.toString().padStart(4, '0')}`;
            try {
                await sql`UPDATE users SET referral_code = ${code} WHERE id = ${user.id}`;
                console.log(`  Generated code ${code} for user ${user.full_name}`);
            } catch (e) {
                console.log(`  Skipped user ${user.id} (code collision)`);
            }
        }

        console.log('\n🎉 Referral system migration complete!');
        console.log('Users now have: referral_code, referred_by, referral_count, referral_earnings');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

migrate();
