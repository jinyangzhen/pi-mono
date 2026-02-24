import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
const { Pool } = pg;

// Database URL from environment variable or default to localhost
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://tguser:tgpass@127.0.0.1:5432/tian_gong';

// Singleton connection pool
let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getConnection() {
	if (!pool) {
		pool = new Pool({
			connectionString: DATABASE_URL,
		});
	}

	if (!db) {
		db = drizzle(pool);
	}

	return { pool, db };
}

// Export the drizzle client for use throughout the application
export const { pool: connectionPool, db: drizzleClient } = getConnection();

// Default export is the drizzle client
export default drizzleClient;

// Close all connections (useful for tests or graceful shutdown)
export async function closeConnection() {
	if (pool) {
		await pool.end();
		pool = null;
		db = null;
	}
}
