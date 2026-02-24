import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const userSettings = pgTable('user_settings', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: varchar('user_id', { length: 255 }).notNull().unique(),
	api_keys: jsonb('api_keys').default('{}').$type<Record<string, string>>(),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
