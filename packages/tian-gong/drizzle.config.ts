import type { Config } from 'drizzle-kit';

export default {
  schema: './backend/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: 'postgresql://tguser:tgpass@127.0.0.1:5432/tian_gong',
  },
} satisfies Config;
