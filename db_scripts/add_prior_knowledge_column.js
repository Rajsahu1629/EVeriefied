const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);

async function addPriorKnowledgeColumn() {
    try {
        console.log('Adding prior_knowledge column to users table...');
        await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS prior_knowledge TEXT`;
        console.log('✅ Successfully added prior_knowledge column.');
    } catch (error) {
        console.error('Error adding column:', error);
    }
}

addPriorKnowledgeColumn();
