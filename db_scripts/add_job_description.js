// Add job_description column to job_posts table
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function addJobDescriptionColumn() {
    const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);
    
    try {
        // Add job_description column if not exists
        await sql`
            ALTER TABLE job_posts 
            ADD COLUMN IF NOT EXISTS job_description TEXT
        `;
        console.log('✅ Added job_description column to job_posts table');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

addJobDescriptionColumn();
