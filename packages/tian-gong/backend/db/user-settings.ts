import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import drizzleClient from './index.js';
import { userSettings, type UserSettings, type NewUserSettings } from './schema.js';

export class UserSettingsDB {
	private db: ReturnType<typeof drizzle>;

	constructor(db: ReturnType<typeof drizzle> = drizzleClient) {
		this.db = db;
	}

	async getByUserId(userId: string): Promise<UserSettings | undefined> {
		const result = await this.db
			.select()
			.from(userSettings)
			.where(eq(userSettings.user_id, userId))
			.limit(1);

		return result[0];
	}

	async upsert(userId: string, apiKeys: Record<string, string>): Promise<UserSettings> {
		const existing = await this.getByUserId(userId);

		if (existing) {
			return this.update(userId, apiKeys);
		}

		const newUserSettings: NewUserSettings = {
			user_id: userId,
			api_keys: apiKeys,
		};

		const result = await this.db
			.insert(userSettings)
			.values(newUserSettings)
			.returning();

		return result[0]!;
	}

	async update(userId: string, apiKeys: Record<string, string>): Promise<UserSettings> {
		const result = await this.db
			.update(userSettings)
			.set({ api_keys: apiKeys })
			.where(eq(userSettings.user_id, userId))
			.returning();

		if (!result[0]) {
			throw new Error(`User settings not found for user_id: ${userId}`);
		}

		return result[0];
	}

	async delete(userId: string): Promise<void> {
		await this.db
			.delete(userSettings)
			.where(eq(userSettings.user_id, userId));
	}
}


export const userSettingsDB = new UserSettingsDB();
