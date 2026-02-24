/**
 * TianGong Agent Server
 *
 * Supports two modes:
 * - TUI Mode: Full terminal UI via xterm.js + node-pty
 * - Web Mode: Chat-based UI using pi-web-ui components
 */
import type { TianUser } from "../core/types.js";
export declare class TianGongServer {
    private app;
    private server;
    private wss;
    private config;
    private userPrefs;
    private sessions;
    private tasks;
    constructor(configPath?: string);
    private setupMiddleware;
    private setupRoutes;
    private setupWebSocket;
    private createSession;
    private handleTUISession;
    private handleWebSession;
    private getMockUser;
    private serializeEvent;
    start(): void;
    stop(): void;
}
declare global {
    namespace Express {
        interface Request {
            user?: TianUser;
        }
    }
}
//# sourceMappingURL=index.d.ts.map