import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(DATABASE_URL);

/**
 * Execute a query with optional parameters
 * Neon serverless uses tagged template literals, so we need to handle parameters differently
 */
export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
    try {
        if (params && params.length > 0) {
            // Replace $1, $2, etc with actual values for the tagged template
            const result = await sql.transaction([
                sql(queryText, params)
            ]);
            return result[0] as T[];
        } else {
            const result = await sql(queryText);
            return result as T[];
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}

export { sql };
