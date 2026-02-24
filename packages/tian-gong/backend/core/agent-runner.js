/**
 * TianGong Agent Runner - Simplified wrapper for pi-coding-agent SDK
 */
import { buildTianSystemPrompt } from "./system-prompt.js";
// ============================================================================
// Agent Runner
// ============================================================================
export class TianGongAgentRunner {
    constructor() {
        this.sessions = new Map();
    }
    /**
     * Create a new agent session using pi-coding-agent SDK
     */
    async createSession(params) {
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
        const mockSession = {
            id: params.sessionId || crypto.randomUUID(),
            systemPrompt: systemPrompt,
            setSystemPrompt: (prompt) => {
                mockSession.systemPrompt = prompt;
            },
            prompt: async (input) => {
                params.onEvent?.({ type: "text_delta", payload: { delta: `[TianGong] Processing: ${input}\n` } });
            },
            subscribe: (callback) => {
                // Store callback for later use
                mockSession._callback = callback;
            },
            waitForIdle: async () => { },
            abort: () => { },
        };
        const result = {
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
    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }
    /**
     * Send a prompt to the session
     */
    async prompt(sessionId, input) {
        const result = this.sessions.get(sessionId);
        if (!result) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        await result.session.prompt(input);
    }
    /**
     * Wait for session to complete current operation
     */
    async waitForIdle(sessionId) {
        const result = this.sessions.get(sessionId);
        if (!result) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        await result.session.waitForIdle();
    }
    /**
     * Abort current operation
     */
    abort(sessionId) {
        const result = this.sessions.get(sessionId);
        if (!result) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        result.session.abort();
    }
    /**
     * Close and cleanup session
     */
    close(sessionId) {
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
    subscribe(sessionId, callback) {
        const result = this.sessions.get(sessionId);
        if (!result) {
            throw new Error(`Session not found: ${sessionId}`);
        }
        result.session.subscribe(callback);
    }
    /**
     * Resolve session file path
     */
    resolveSessionFile(agentDir, userId, sessionId) {
        const sessionsDir = `${agentDir}/sessions/${userId}`;
        if (sessionId) {
            return `${sessionsDir}/${sessionId}.jsonl`;
        }
        return `${sessionsDir}/${crypto.randomUUID()}.jsonl`;
    }
}
// Create singleton instance
export const agentRunner = new TianGongAgentRunner();
//# sourceMappingURL=agent-runner.js.map