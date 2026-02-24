/**
 * TianGong Agent Server
 *
 * Supports two modes:
 * - TUI Mode: Full terminal UI via xterm.js + node-pty
 * - Web Mode: Chat-based UI using pi-web-ui components
 */

import { getEnvApiKey, getModels, getProviders } from "@mariozechner/pi-ai";
import express from "express";
import { existsSync } from "fs";
import { createServer } from "http";
import * as pty from "node-pty";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { WebSocket, WebSocketServer } from "ws";
import { agentRunner } from "../core/agent-runner.js";
import { ConfigManager, TASK_TEMPLATES, UserPreferencesManager } from "../core/config.js";
import type { TianTask, TianUser, UserPreferences, WSMessage } from "../core/types.js";

// ESM __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Types
// ============================================================================

interface TerminalSession {
	id: string;
	userId: string;
	uiMode: "tui" | "web";
	pty?: pty.IPty;
	ws: Set<WebSocket>;
	createdAt: Date;
	lastActivity: Date;
	metadata: {
		taskName?: string;
		workspaceDir: string;
	};
}

// ============================================================================
// Server Class
// ============================================================================

export class TianGongServer {
	private app = express();
	private server = createServer(this.app);
	private wss: WebSocketServer;
	private config: ConfigManager;
	private userPrefs: UserPreferencesManager;
	private sessions = new Map<string, TerminalSession>();
	private tasks = new Map<string, TianTask>();

	constructor(configPath?: string) {
		this.config = new ConfigManager(configPath);
		this.config.ensureAgentDir();

		const cfg = this.config.get();
		this.userPrefs = new UserPreferencesManager(cfg.agentDir);

		this.wss = new WebSocketServer({ server: this.server });

		this.setupMiddleware();
		this.setupRoutes();
		this.setupWebSocket();
	}

	// ============================================================================
	// Middleware
	// ============================================================================

	private setupMiddleware(): void {
		this.app.use(express.json());

		// Serve static files - check for fronts dist in dist folder
		const webUiDist = join(__dirname, "..", "..", "fronts");
		const publicDir = join(__dirname, "public");

		// Use web-ui dist if it exists, otherwise fall back to public
		if (existsSync(webUiDist)) {
			this.app.use(express.static(webUiDist));
			// SPA fallback - serve index.html for all non-API routes that don't have a file extension
			this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
				const hasExtension = /\.[^/]+$/.test(req.path);
				if (!req.path.startsWith("/api") && !req.path.startsWith("/ws") && !hasExtension) {
					res.sendFile(join(webUiDist, "index.html"));
				} else {
					next();
				}
			});
		} else {
			this.app.use(express.static(publicDir));
		}

		// CORS
		this.app.use((req, res, next) => {
			const origins = this.config.get().security.allowedOrigins;
			const origin = req.headers.origin;
			if (origin && (origins.includes("*") || origins.includes(origin))) {
				res.setHeader("Access-Control-Allow-Origin", origin);
			}
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
			res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
			if (req.method === "OPTIONS") {
				return res.sendStatus(200);
			}
			next();
		});

		// Simulated auth (replace with real auth in production)
		this.app.use((req, _res, next) => {
			req.user = this.getMockUser(req.headers["x-user-id"] as string);
			next();
		});
	}

	// ============================================================================
	// REST API Routes
	// ============================================================================

	private setupRoutes(): void {
		// Health check
		this.app.get("/api/health", (_req, res) => {
			res.json({ status: "ok", timestamp: new Date().toISOString() });
		});

		// Get current user
		this.app.get("/api/me", (req, res) => {
			res.json(req.user);
		});

		// Update user preferences
		this.app.put("/api/me/preferences", (req, res) => {
			const updates = req.body as Partial<UserPreferences>;
			const updated = this.userPrefs.update(req.user!.id, updates);
			res.json(updated);
		});

		// Get merged API keys (system + user overrides)
		this.app.get("/api/me/api-keys", (req, res) => {
			const userPrefs = this.userPrefs.load(req.user!.id);
			const systemConfig = this.config.get();

			// Start with system API keys
			const merged: Record<string, string> = {};
			if (systemConfig.apiKeys) {
				for (const key of systemConfig.apiKeys) {
					merged[key.provider] = key.apiKey;
				}
			}

			// User keys override system keys
			if (userPrefs.apiKeys) {
				for (const [provider, apiKey] of Object.entries(userPrefs.apiKeys)) {
					if (apiKey) {
						merged[provider] = apiKey;
					}
				}
			}

			res.json({ apiKeys: merged, providers: Object.keys(merged) });
		});

		// Get available LLM providers
		this.app.get("/api/providers", (_req, res) => {
			const providers = getProviders();
			const providerLabels = {
				"amazon-bedrock": "AWS Bedrock",
				anthropic: "Anthropic",
				google: "Google",
				"google-gemini-cli": "Google Gemini CLI",
				"google-antigravity": "Google Antigravity",
				"google-vertex": "Google Vertex AI",
				openai: "OpenAI",
				"azure-openai-responses": "Azure OpenAI",
				"openai-codex": "OpenAI Codex",
				"github-copilot": "GitHub Copilot",
				xai: "xAI",
				groq: "Groq",
				cerebras: "Cerebras",
				openrouter: "OpenRouter",
				"vercel-ai-gateway": "Vercel AI Gateway",
				zai: "Zai",
				mistral: "Mistral",
				minimax: "MiniMax",
				"minimax-cn": "MiniMax CN",
				huggingface: "HuggingFace",
				opencode: "OpenCode",
				"kimi-coding": "Kimi Coding",
			} as Record<string, string>;

			const providersWithLabels = providers.map((provider) => ({
				id: provider,
				name: providerLabels[provider] || provider,
			}));

			// Get all models grouped by provider
			const modelsByProvider: Record<string, Array<{ id: string; name: string }>> = {};
			for (const provider of providers) {
				const models = getModels(provider);
				modelsByProvider[provider] = models.map((m) => ({ id: m.id, name: m.name }));
			}

			res.json({ providers: providersWithLabels, models: modelsByProvider });
		});

		// Get system API keys from environment variables (pi-ai detection)
		this.app.get("/api/system/env-keys", (_req, res) => {
			const providers = getProviders();
			const envKeys: Record<string, string> = {};

			for (const provider of providers) {
				const key = getEnvApiKey(provider);
				if (key) {
					envKeys[provider] = key;
				}
			}

			res.json({ apiKeys: envKeys });
		});

		// Get system API keys only
		this.app.get("/api/system/api-keys", (_req, res) => {
			const systemConfig = this.config.get();
			const systemKeys: Record<string, string> = {};
			if (systemConfig.apiKeys) {
				for (const key of systemConfig.apiKeys) {
					systemKeys[key.provider] = key.apiKey;
				}
			}

			res.json({ apiKeys: systemKeys });
		});

		// Update user API keys
		this.app.put("/api/me/api-keys", (req, res) => {
			const { apiKeys } = req.body as { apiKeys: Record<string, string> };
			const userPrefs = this.userPrefs.load(req.user!.id);

			// Merge with existing user preferences
			userPrefs.apiKeys = { ...userPrefs.apiKeys, ...apiKeys };
			this.userPrefs.save(req.user!.id, userPrefs);

			res.json({ success: true });
		});

		// Get task templates
		this.app.get("/api/tasks/templates", (_req, res) => {
			res.json(TASK_TEMPLATES);
		});

		// List user's tasks
		this.app.get("/api/tasks", (req, res) => {
			const userTasks = Array.from(this.tasks.values())
				.filter((t) => t.userId === req.user!.id)
				.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
			res.json({ tasks: userTasks, total: userTasks.length });
		});

		// Get single task
		this.app.get("/api/tasks/:taskId", (req, res) => {
			const task = this.tasks.get(req.params.taskId);
			if (!task) {
				return res.status(404).json({ error: "Task not found" });
			}
			res.json(task);
		});

		// Create new task
		this.app.post("/api/tasks", async (req, res) => {
			const { templateId, name, description } = req.body;
			const user = req.user!;

			const taskId = crypto.randomUUID();
			const sessionId = crypto.randomUUID();

			const task: TianTask = {
				id: taskId,
				name: name || "Untitled Task",
				description: description || "",
				status: "pending",
				progress: 0,
				userId: user.id,
				sessionId,
				createdAt: new Date(),
				updatedAt: new Date(),
				metadata: {
					templateId,
					department: user.department,
				},
			};

			this.tasks.set(taskId, task);

			res.json({
				task,
				sessionId,
				wsUrl: `/ws?session=${sessionId}&userId=${user.id}&mode=${user.preferences.uiMode}`,
			});
		});

		// Resume task
		this.app.post("/api/tasks/:taskId/resume", (req, res) => {
			const task = this.tasks.get(req.params.taskId);
			if (!task) {
				return res.status(404).json({ error: "Task not found" });
			}

			task.status = "running";
			task.updatedAt = new Date();

			res.json({
				task,
				wsUrl: `/ws?session=${task.sessionId}&userId=${req.user!.id}&mode=${req.user!.preferences.uiMode}`,
			});
		});

		// Get sessions
		this.app.get("/api/sessions", (req, res) => {
			const sessions = Array.from(this.sessions.values())
				.filter((s) => s.userId === req.user!.id)
				.map((s) => ({
					id: s.id,
					uiMode: s.uiMode,
					createdAt: s.createdAt,
					lastActivity: s.lastActivity,
					taskName: s.metadata.taskName,
				}));
			res.json({ sessions, total: sessions.length });
		});
	}

	// ============================================================================
	// WebSocket Handling
	// ============================================================================

	private setupWebSocket(): void {
		this.wss.on("connection", async (ws, req) => {
			const url = new URL(req.url!, `http://${req.headers.host}`);
			const sessionId = url.searchParams.get("session") || crypto.randomUUID();
			const userId = url.searchParams.get("userId") || "anonymous";
			const mode = (url.searchParams.get("mode") as "tui" | "web") || "web";
			const taskName = url.searchParams.get("task") || undefined;

			console.log(`WebSocket connected: session=${sessionId}, user=${userId}, mode=${mode}`);

			const user = this.getMockUser(userId);
			const _prefs = this.userPrefs.load(userId);

			// Create or get session
			let session = this.sessions.get(sessionId);
			if (!session) {
				session = await this.createSession(sessionId, userId, mode, taskName);
			}
			session.ws.add(ws);

			if (mode === "tui") {
				this.handleTUISession(ws, session, user);
			} else {
				this.handleWebSession(ws, session, user);
			}

			ws.on("close", () => {
				session!.ws.delete(ws);
				session!.lastActivity = new Date();
			});
		});
	}

	private async createSession(
		sessionId: string,
		userId: string,
		uiMode: "tui" | "web",
		taskName?: string,
	): Promise<TerminalSession> {
		const cfg = this.config.get();
		const session: TerminalSession = {
			id: sessionId,
			userId,
			uiMode,
			ws: new Set(),
			createdAt: new Date(),
			lastActivity: new Date(),
			metadata: {
				taskName,
				workspaceDir: cfg.workspaceDir,
			},
		};

		this.sessions.set(sessionId, session);
		return session;
	}

	// ============================================================================
	// TUI Mode Handling (xterm.js + node-pty)
	// ============================================================================

	private handleTUISession(ws: WebSocket, session: TerminalSession, user: TianUser): void {
		const cfg = this.config.get();

		// Build pi command - let pi auto-detect model from API keys or /login
		// Users can set their preferred model in settings or use /login command
		const shell = "/bin/bash";
		const nvmSetup = `source ~/.nvm/nvm.sh 2>/dev/null || true`;
		const piCommand = `cd ${cfg.workspaceDir} && pi`;

		try {
			// Spawn PTY with pi command using bash login shell
			const ptyProcess = pty.spawn(shell, ["-l", "-c", `${nvmSetup} && ${piCommand}`], {
				name: "xterm-256color",
				cols: 120,
				rows: 36,
				cwd: cfg.workspaceDir,
				env: {
					...process.env,
					TERM: "xterm-256color",
					COLORTERM: "truecolor",
					TianGong_USER_ID: user.id,
				},
			});

			session.pty = ptyProcess;

			// PTY output -> WebSocket
			ptyProcess.onData((data) => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send(JSON.stringify({ type: "output", payload: { data } }));
				}
			});

			// PTY exit
			ptyProcess.onExit(({ exitCode }) => {
				ws.send(JSON.stringify({ type: "exit", payload: { exitCode } }));
				session.pty = undefined;
			});

			// WebSocket messages -> PTY
			ws.on("message", (data) => {
				try {
					const msg = JSON.parse(data.toString());
					if (msg.type === "input") {
						ptyProcess.write(msg.payload.data);
					} else if (msg.type === "resize") {
						ptyProcess.resize(msg.payload.cols, msg.payload.rows);
					}
				} catch (e) {
					console.error("WebSocket message parse error:", e);
				}
			});

			// Handle close
			ws.on("close", () => {
				if (session.pty) {
					session.pty.kill();
					session.pty = undefined;
				}
			});

			// Send connected message
			ws.send(
				JSON.stringify({
					type: "connected",
					payload: {
						sessionId: session.id,
						cols: ptyProcess.cols,
						rows: ptyProcess.rows,
						uiMode: "tui",
					},
				}),
			);
		} catch (error) {
			console.error("Failed to start PTY:", error);
			ws.send(JSON.stringify({ type: "error", payload: { message: "Terminal unavailable in this environment" } }));
		}
	}

	// ============================================================================
	// Web Mode Handling (pi-web-ui via agent runner)
	// ============================================================================

	private handleWebSession(ws: WebSocket, session: TerminalSession, user: TianUser): void {
		const cfg = this.config.get();
		const _prefs = this.userPrefs.load(user.id);

		// Create agent session using pi-coding-agent SDK
		agentRunner
			.createSession({
				user,
				sessionId: session.id,
				taskName: session.metadata.taskName,
				workspaceDir: cfg.workspaceDir,
				agentDir: cfg.agentDir,
				onEvent: (event) => {
					if (ws.readyState === WebSocket.OPEN) {
						ws.send(
							JSON.stringify({
								type: "agent_event",
								payload: { sessionId: session.id, event: this.serializeEvent(event) },
							}),
						);
					}
				},
			})
			.then((result) => {
				ws.send(
					JSON.stringify({
						type: "connected",
						payload: {
							sessionId: result.sessionId,
							uiMode: "web",
						},
					}),
				);
			})
			.catch((error) => {
				ws.send(
					JSON.stringify({
						type: "error",
						payload: { message: error.message },
					}),
				);
			});

		// Handle WebSocket messages
		ws.on("message", async (data) => {
			try {
				const message = JSON.parse(data.toString()) as WSMessage;

				switch (message.type) {
					case "input":
						await agentRunner.prompt(session.id, (message as any).payload.data);
						ws.send(JSON.stringify({ type: "message_complete", payload: { sessionId: session.id } }));
						break;
				}
			} catch (error) {
				console.error("WebSocket message error:", error);
			}
		});
	}

	// ============================================================================
	// Helpers
	// ============================================================================

	private getMockUser(userId?: string): TianUser {
		const id = userId || "demo-user";
		return {
			id,
			email: `${id}@tian.com`,
			name: "Demo User",
			department: "Insurance Operations",
			role: "citizen_developer",
			preferences: this.userPrefs.load(id),
		};
	}

	private serializeEvent(event: any): any {
		// Simplified event serialization for WebSocket
		switch (event.type) {
			case "message_start":
				return { type: "message_start", role: event.message?.role };
			case "message_update":
				if (event.assistantMessageEvent?.type === "text_delta") {
					return { type: "text_delta", delta: event.assistantMessageEvent.delta };
				}
				return null;
			case "message_end":
				return { type: "message_end", role: event.message?.role };
			case "turn_end":
				return { type: "turn_end" };
			case "agent_end":
				return { type: "agent_end" };
			default:
				return event;
		}
	}

	// ============================================================================
	// Server Control
	// ============================================================================

	start(): void {
		const cfg = this.config.get();
		this.server.listen(cfg.port, cfg.host, () => {
			console.log(`
╔══════════════════════════════════════════════════════════════╗
║           TianGong Agent Server                              ║
╠══════════════════════════════════════════════════════════════╣
║  Server running at http://${cfg.host}:${cfg.port}
║  
║  Available:
║  • Chat UI:       http://localhost:${cfg.port}/
║  • Terminal UI:  http://localhost:${cfg.port}/terminal
║  
║  Press Ctrl+C to stop
╚══════════════════════════════════════════════════════════════╝
			`);
		});
	}

	stop(): void {
		// Cleanup PTY sessions
		for (const session of this.sessions.values()) {
			session.pty?.kill();
		}
		this.server.close();
	}
}

// Extend Express Request type
declare global {
	namespace Express {
		interface Request {
			user?: TianUser;
		}
	}
}
