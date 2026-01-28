const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function createQuizTable() {
    const sql = neon(process.env.EXPO_PUBLIC_DATABASE_URL);
    
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                score INTEGER NOT NULL DEFAULT 0,
                played_at DATE DEFAULT CURRENT_DATE,
                UNIQUE(user_id, played_at)
            )
        `;
        console.log('✅ quiz_scores table created');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

createQuizTable();
