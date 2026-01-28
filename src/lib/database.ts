import { neon } from '@neondatabase/serverless';

// Neon PostgreSQL connection
// In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be accessible
const DATABASE_URL = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('EXPO_PUBLIC_DATABASE_URL environment variable is not set. Please check your .env file.');
}

export const sql = neon(DATABASE_URL);

/**
 * Helper function for type-safe queries.
 * According to Neon's error message, we must use sql.query() for conventional calls with placeholders.
 */
export async function query<T>(queryText: string, params?: any[]): Promise<T[]> {
  try {
    if (params && params.length > 0) {
      // For a conventional function call with value placeholders ($1, $2, etc.), use sql.query()
      const result = await (sql as any).query(queryText, params);
      return result as T[];
    } else {
      // Even for simple queries, using sql.query is clearer in this context
      const result = await (sql as any).query(queryText);
      return result as T[];
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
