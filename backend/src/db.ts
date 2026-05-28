import { Pool, type PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

/** Remove sslmode from URL — pg v8+ maps require → verify-full and breaks AWS RDS. */
function connectionStringWithoutSslParams(url: string): string {
    try {
        const parsed = new URL(url);
        parsed.searchParams.delete('sslmode');
        parsed.searchParams.delete('ssl');
        parsed.searchParams.delete('uselibpqcompat');
        const out = parsed.toString();
        return out.endsWith('?') ? out.slice(0, -1) : out;
    } catch {
        return url
            .replace(/([?&])sslmode=[^&]*/gi, '$1')
            .replace(/([?&])ssl=[^&]*/gi, '$1')
            .replace(/\?&/g, '?')
            .replace(/[?&]$/, '');
    }
}

function buildPoolConfig(): PoolConfig {
    const connectionString = connectionStringWithoutSslParams(DATABASE_URL!);
    const isLocalDb =
        DATABASE_URL!.includes('localhost') ||
        DATABASE_URL!.includes('127.0.0.1') ||
        process.env.DATABASE_SSL === 'false';

    if (isLocalDb) {
        return { connectionString };
    }

    // AWS RDS: encrypt connection but accept Amazon's CA chain in dev
    return {
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    };
}

const pool = new Pool(buildPoolConfig());

/**
 * Execute a query with optional parameters
 */
export async function query<T>(queryText: string, params?: unknown[]): Promise<T[]> {
    const client = await pool.connect();
    try {
        const result = await client.query(queryText, params);
        return result.rows as T[];
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    } finally {
        client.release();
    }
}

export { pool as sql };
