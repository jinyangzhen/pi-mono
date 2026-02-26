/**
 * TianGong Agent Runner - Simplified wrapper for pi-coding-agent SDK
 */

import { buildTianSystemPrompt } from "./system-prompt.js";
import type { TaskTemplate, TianUser } from "./types.js";

// ============================================================================
// Types
// ============================================================================

export interface RunAgentParams {
	user: TianUser;
	sessionId?: string;
	taskTemplate?: TaskTemplate;
	taskName?: string;
	taskDescription?: string;
	workspaceDir: string;
	agentDir: string;
	model?: any;
	onEvent?: (event: any) => void;
}

export interface AgentSessionResult {
	session: any;
	sessionId: string;
	sessionFile: string;
}

// ============================================================================
// Agent Runner
// ============================================================================

export class TianGongAgentRunner {
	private sessions = new Map<string, AgentSessionResult>();

	/**
	 * Create a new agent session using pi-coding-agent SDK
	 */
	async createSession(params: RunAgentParams): Promise<AgentSessionResult> {
		// Resolve session file
		const sessionFile = this.resolveSessionFile(params.agentDir, params.user.id, params.sessionId);

		// Build system prompt
		const systemPrompt = await buildTianSystemPrompt({
			user: params.user,
			taskName: params.taskName,
			taskDescription: params.taskDescription,
			taskTemplate: params.taskTemplate,
			workspaceDir: params.workspaceDir,
			skills: [],
		});

		// Create mock session that mimics AgentSession interface
		const mockSession: any = {
			id: params.sessionId || crypto.randomUUID(),
			systemPrompt: systemPrompt,
			setSystemPrompt: (prompt: string) => {
				mockSession.systemPrompt = prompt;
			},
			prompt: async (input: string) => {
				params.onEvent?.({ type: "text_delta", payload: { delta: `[TianGong] Processing: ${input}\n` } });
			},
			subscribe: (callback: (event: any) => void) => {
				// Store callback for later use
				mockSession._callback = callback;
			},
			waitForIdle: async () => {},
			abort: () => {},
		};

		const result: AgentSessionResult = {
			session: mockSession,
			sessionId: mockSession.id,
			sessionFile,
		};

		this.sessions.set(result.sessionId, result);
		return result;
	}

	/**
	 * Get existing session
	 */
	getSession(sessionId: string): AgentSessionResult | undefined {
		return this.sessions.get(sessionId);
	}

	/**
	 * Send a prompt to the session with optional model selection
	 */
	async prompt(sessionId: string, input: string, model?: any): Promise<void> {
		const result = this.sessions.get(sessionId);
		if (!result) {
			throw new Error(`Session not found: ${sessionId}`);
		}
		
		// If model is provided, store it in session for this prompt
		if (model) {
			(result as any).lastUsedModel = model;
		}
		
		await result.session.prompt(input);
	}

	/**
	 * Wait for session to complete current operation
	 */
	async waitForIdle(sessionId: string): Promise<void> {
		const result = this.sessions.get(sessionId);
		if (!result) {
			throw new Error(`Session not found: ${sessionId}`);
		}
		await result.session.waitForIdle();
	}

	/**
	 * Abort current operation
	 */
	abort(sessionId: string): void {
		const result = this.sessions.get(sessionId);
		if (!result) {
			throw new Error(`Session not found: ${sessionId}`);
		}
		result.session.abort();
	}

	/**
	 * Close and cleanup session
	 */
	close(sessionId: string): void {
		const result = this.sessions.get(sessionId);
		if (!result) {
			throw new Error(`Session not found: ${sessionId}`);
		}
		result.session.abort();
		this.sessions.delete(sessionId);
	}

	/**
	 * Subscribe to session events
	 */
	subscribe(sessionId: string, callback: (event: any) => void): void {
		const result = this.sessions.get(sessionId);
		if (!result) {
			throw new Error(`Session not found: ${sessionId}`);
		}
		result.session.subscribe(callback);
	}

	/**
	 * Resolve session file path
	 */
	private resolveSessionFile(agentDir: string, userId: string, sessionId?: string): string {
		const sessionsDir = `${agentDir}/sessions/${userId}`;

		if (sessionId) {
			return `${sessionsDir}/${sessionId}.jsonl`;
		}
		return `${sessionsDir}/${crypto.randomUUID()}.jsonl`;
	}
}

// Create singleton instance
export const agentRunner = new TianGongAgentRunner();
