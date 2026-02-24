/**
 * TianGong Agent Runner - Simplified wrapper for pi-coding-agent SDK
 */
import type { TaskTemplate, TianUser } from "./types.js";
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
export declare class TianGongAgentRunner {
    private sessions;
    /**
     * Create a new agent session using pi-coding-agent SDK
     */
    createSession(params: RunAgentParams): Promise<AgentSessionResult>;
    /**
     * Get existing session
     */
    getSession(sessionId: string): AgentSessionResult | undefined;
    /**
     * Send a prompt to the session
     */
    prompt(sessionId: string, input: string): Promise<void>;
    /**
     * Wait for session to complete current operation
     */
    waitForIdle(sessionId: string): Promise<void>;
    /**
     * Abort current operation
     */
    abort(sessionId: string): void;
    /**
     * Close and cleanup session
     */
    close(sessionId: string): void;
    /**
     * Subscribe to session events
     */
    subscribe(sessionId: string, callback: (event: any) => void): void;
    /**
     * Resolve session file path
     */
    private resolveSessionFile;
}
export declare const agentRunner: TianGongAgentRunner;
//# sourceMappingURL=agent-runner.d.ts.map