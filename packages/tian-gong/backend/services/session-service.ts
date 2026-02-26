import { existsSync, mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { SessionManager, type SessionInfo } from "@mariozechner/pi-coding-agent";
import { userSessions, type UserSession, type NewUserSession } from "../db/schema.js";
import { drizzleClient } from "../db/index.js";
import { eq, and } from "drizzle-orm";

export interface SessionResult {
	id: string;
	userId: string;
	filePath: string;
	mode: string;
	title?: string;
	createdAt: Date | null;
	updatedAt: Date | null;
	lastActiveAt?: Date | null;
	messageCount: number;
}
export interface UpdateData {
	title?: string;
	lastActiveAt?: Date;
	messageCount?: number;
}

export class SessionService {
	private sessionDir: string;
	private db: typeof drizzleClient;

	constructor(sessionDir: string, db: typeof drizzleClient) {
		this.sessionDir = sessionDir;
		this.db = db;
	}

	/**
	 * Create a new session for a user
	 */
	async create(userId: string, mode: string): Promise<SessionResult> {
		const sessionManager = SessionManager.create(process.cwd(), this.sessionDir);
		const sessionFile = sessionManager.getSessionFile();

		if (!sessionFile) {
			throw new Error("Failed to create session file");
		}

		// Ensure the directory exists and create the session file
		const dir = dirname(sessionFile);
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		// Create empty session file with initial structure
		const sessionData = {
			version: "1.0",
			cwd: process.cwd(),
			createdAt: new Date().toISOString(),
			
		};
		writeFileSync(sessionFile, JSON.stringify(sessionData) + "\n", "utf-8");

		const now = new Date();

		const [newSession] = await this.db
			.insert(userSessions)
			.values({
				user_id: userId,
				file_path: sessionFile,
				mode,
				title: `Session ${new Date().toLocaleString()}`,
				created_at: now,
				updated_at: now,
				last_active_at: now,
				message_count: 0,
			} satisfies NewUserSession)
			.returning();

		if (!newSession) {
			throw new Error("Failed to create session record");
		}

		return this.mapToSessionResult(newSession);
	}

	/**
	 * Get a session by ID and user ID (ownership verification)
	 */
	async getById(sessionId: string, userId: string): Promise<SessionResult> {
		const [session] = await this.db
			.select()
			.from(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)))
			.limit(1);

		if (!session) {
			throw new Error(`Session ${sessionId} not found or access denied`);
		}

		return this.mapToSessionResult(session);
	}

	/**
	 * List all sessions for a user
	 */
	async listByUser(userId: string): Promise<SessionResult[]> {
		const sessions = await this.db
			.select()
			.from(userSessions)
			.where(eq(userSessions.user_id, userId));

		return sessions.map((session) => this.mapToSessionResult(session));
	}

	/**
	 * Delete a session by ID and user ID (ownership verification)
	 */
	async delete(sessionId: string, userId: string): Promise<void> {
		const [session] = await this.db
			.select()
			.from(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)))
			.limit(1);

		if (!session) {
			throw new Error(`Session ${sessionId} not found or access denied`);
		}

		try {
			const { unlink } = await import("fs/promises");
			await unlink(session.file_path);
		} catch (error) {
			console.error(`Failed to delete session file ${session.file_path}:`, error);
		}

		await this.db
			.delete(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)));
	}

	/**
	 * Update a session by ID and user ID (ownership verification)
	 */
	async update(sessionId: string, userId: string, data: Partial<UpdateData>): Promise<SessionResult> {
		const [existing] = await this.db

			.select()
			.from(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)))
			.limit(1);

		if (!existing) {
			throw new Error(`Session ${sessionId} not found or access denied`);
		}

		const updateValues: Partial<NewUserSession> = {

			updated_at: new Date(),
		};

		if (data.title !== undefined) {
			updateValues.title = data.title;
		}
		if (data.lastActiveAt !== undefined) {
			updateValues.last_active_at = data.lastActiveAt;
		}
		if (data.messageCount !== undefined) {
			updateValues.message_count = data.messageCount;
		}

		const [updated] = await this.db

			.update(userSessions)
			.set(updateValues)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)))
			.returning();

		if (!updated) {
			throw new Error("Failed to update session");
		}

		return this.mapToSessionResult(updated);
	}

	/**
	 * Get the session file path for a session ID and user ID (ownership verification)
	 * Internal method used by other parts of the application
	 */
	async getSessionPath(sessionId: string, userId: string): Promise<string> {
		const [session] = await this.db
			.select({ file_path: userSessions.file_path })
			.from(userSessions)
			.where(and(eq(userSessions.id, sessionId), eq(userSessions.user_id, userId)))
			.limit(1);

		if (!session) {
			throw new Error(`Session ${sessionId} not found or access denied`);
		}

		return session.file_path;
	}

	/**
	 * Map database record to SessionResult
	 */
	private mapToSessionResult(session: UserSession): SessionResult {
		return {
			id: session.id,
			userId: session.user_id,
			filePath: session.file_path,
			mode: session.mode,
			title: session.title ?? undefined,
			createdAt: session.created_at ?? null,
			updatedAt: session.updated_at ?? null,
			lastActiveAt: session.last_active_at ?? null,
			messageCount: (session.message_count as number) || 0,
		};
	}
}
