import { AgentSession, type AgentSessionEvent } from "@mariozechner/pi-coding-agent";
import { AuthStorage, ModelRegistry, SessionManager } from "@mariozechner/pi-coding-agent";
import type { SettingsManager } from "@mariozechner/pi-coding-agent";
import type { ResourceLoader } from "@mariozechner/pi-coding-agent";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import { join } from "node:path";
import { SessionService } from "./session-service.js";

/**
 * Service for creating and managing AgentSession instances.
 *
 * This service handles:
 * - Creating AgentSession instances for user sessions
 * - Managing lifecycle of active sessions
 * - Routing prompts and aborts to the correct session
 * - Event subscription for session events
 */
export class AgentService {
	private sessions: Map<string, AgentSession> = new Map();
	private sessionService: SessionService;
	private agentDir: string;
	private workspaceDir: string;
	private authStorage: AuthStorage;
	private modelRegistry: ModelRegistry;
	private settingsManager: SettingsManager;
	private resourceLoader: ResourceLoader;
	private customTools?: ToolDefinition[];

	constructor(
		sessionService: SessionService,
		agentDir: string,
		workspaceDir: string,
		authStorage: AuthStorage,
		modelRegistry: ModelRegistry,
		settingsManager: SettingsManager,
		resourceLoader: ResourceLoader,
		customTools?: ToolDefinition[],
	) {
		this.sessionService = sessionService;
		this.agentDir = agentDir;
		this.workspaceDir = workspaceDir;
		this.authStorage = authStorage;
		this.modelRegistry = modelRegistry;
		this.settingsManager = settingsManager;
		this.resourceLoader = resourceLoader;
		this.customTools = customTools;
	}

	/**
	 * Get or create an AgentSession for a user session.
	 *
	 * @param userId - The user ID
	 * @param sessionId - The session ID
	 * @returns The AgentSession instance
	 */
	async getOrCreateAgentSession(userId: string, sessionId: string): Promise<AgentSession> {
		const existingSession = this.sessions.get(sessionId);
		if (existingSession) {
			return existingSession;
		}

		const sessionPath = await this.sessionService.getSessionPath(sessionId, userId);

		// Open the session file (should now exist after session creation)
		const sessionManager = SessionManager.open(sessionPath);

		const { createAgentSession } = await import("@mariozechner/pi-coding-agent");

		const { session } = await createAgentSession({
			cwd: this.workspaceDir,
			agentDir: this.agentDir,
			authStorage: this.authStorage,
			modelRegistry: this.modelRegistry,
			sessionManager,
			settingsManager: this.settingsManager,
			resourceLoader: this.resourceLoader,
			customTools: this.customTools,
		});

		this.sessions.set(sessionId, session);

		return session;
	}

	/**
	 * Send a prompt to a session.
	 *
	 * @param sessionId - The session ID
	 * @param input - The user input
	 * @throws Error if session not found
	 */
	async prompt(sessionId: string, input: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		await session.prompt(input);
	}

	/**
	 * Abort the current operation for a session.
	 *
	 * @param sessionId - The session ID
	 * @throws Error if session not found
	 */
	async abort(sessionId: string): Promise<void> {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		await session.abort();
	}

	/**
	 * Subscribe to session events.
	 *
	 * @param sessionId - The session ID
	 * @param callback - The event callback
	 * @returns Unsubscribe function
	 * @throws Error if session not found
	 */
	subscribe(sessionId: string, callback: (event: AgentSessionEvent) => void): () => void {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error(`Session ${sessionId} not found`);
		}

		return session.subscribe(callback);
	}

	/**
	 * Close a session and remove it from cache.
	 *
	 * @param sessionId - The session ID
	 */
	closeSession(sessionId: string): void {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.dispose();
			this.sessions.delete(sessionId);
		}
	}

	/**
	 * Close all active sessions.
	 */
	closeAllSessions(): void {
		for (const [sessionId, session] of this.sessions.entries()) {
			session.dispose();
		}
		this.sessions.clear();
	}
}
