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


export const userSessions = pgTable('user_sessions', {
	id: uuid('id').primaryKey().defaultRandom(),
	user_id: varchar('user_id', { length: 255 }).notNull(),
	file_path: varchar('file_path', { length: 512 }).notNull(),
	mode: varchar('mode', { length: 50 }).notNull(),
	title: varchar('title', { length: 255 }),
	message_count: jsonb('message_count').default('0'),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow(),
	last_active_at: timestamp('last_active_at').defaultNow(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
