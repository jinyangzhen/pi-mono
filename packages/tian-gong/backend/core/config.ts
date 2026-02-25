/**
 * Configuration management for TianGong Agent
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
import type { TianConfig, UserPreferences } from "./types.js";

// ============================================================================
// Default Configuration
// ============================================================================

export const DEFAULT_CONFIG: TianConfig = {
	port: 5000,
	host: "0.0.0.0",
	agentDir: join(homedir(), ".tian-gong"),
	workspaceDir: process.cwd(),
	defaultModel: {
		provider: "azure-openai-responses",
		modelId: "gpt-4o",
	},
	session: {
		timeoutMinutes: 30,
		maxPerUser: 5,
		persist: true,
	},
	apiKeys: [],
	security: {
		auditLogging: true,
		rateLimit: 100,
		allowedOrigins: ["*"],
	},
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
	uiMode: "web",
	defaultModel: "gpt-4o",
	defaultProvider: "azure-openai-responses",
	thinkingLevel: "medium",
	persistSessions: true,
	autoCheckpointInterval: 5,
	notifications: {
		email: false,
		slack: false,
	},
	apiKeys: {},
};

// ============================================================================
// Task Templates
// ============================================================================

export const TASK_TEMPLATES = [
	{
		id: "policy-review",
		name: "Monthly Policy Review",
		description: "Review policies expiring in the next 30 days and generate summary report",
		category: "policy_management" as const,
		icon: "📋",
		estimatedTime: "15-30 minutes",
		skills: ["policy-lookup", "reporting"],
		defaultInput: "Review all policies expiring in the next 30 days and provide a summary.",
	},
	{
		id: "claims-batch",
		name: "Batch Claims Processing",
		description: "Process multiple claims from the queue with validation",
		category: "claims_processing" as const,
		icon: "📝",
		estimatedTime: "30-60 minutes",
		skills: ["claims-processing"],
		approvalRequired: true,
	},
	{
		id: "report-generation",
		name: "Generate Compliance Report",
		description: "Create compliance or performance reports with data analysis",
		category: "reporting" as const,
		icon: "📊",
		estimatedTime: "10-20 minutes",
		skills: ["reporting", "data-analysis"],
	},
	{
		id: "data-validation",
		name: "Customer Data Validation",
		description: "Validate customer records for accuracy and completeness",
		category: "data_validation" as const,
		icon: "✅",
		estimatedTime: "15-30 minutes",
		skills: ["data-validation"],
	},
	{
		id: "document-generation",
		name: "Generate Policy Documents",
		description: "Create policy documents from templates with customer data",
		category: "document_generation" as const,
		icon: "📄",
		estimatedTime: "5-15 minutes",
		skills: ["document-generation"],
	},
	{
		id: "custom",
		name: "Custom Task",
		description: "Describe your own task and let the assistant help you",
		category: "custom" as const,
		icon: "🎯",
		estimatedTime: "Varies",
		skills: [],
	},
];

// ============================================================================
// Configuration Manager
// ============================================================================

export class ConfigManager {
	private configPath: string;
	private config: TianConfig;

	constructor(configPath?: string) {
		this.configPath = configPath ?? join(homedir(), ".tian-gong", "config.json");
		this.config = { ...DEFAULT_CONFIG };
		this.load();
	}

	/**
	 * Load configuration from file
	 */
	load(): TianConfig {
		if (existsSync(this.configPath)) {
			try {
				const content = readFileSync(this.configPath, "utf-8");
				const loaded = JSON.parse(content);
				this.config = { ...DEFAULT_CONFIG, ...loaded };
			} catch (_error) {
				console.warn(`Failed to load config from ${this.configPath}, using defaults`);
			}
		}
		return this.config;
	}

	/**
	 * Save configuration to file
	 */
	save(): void {
		const dir = join(this.configPath, "..");
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
	}

	/**
	 * Get current configuration
	 */
	get(): TianConfig {
		return { ...this.config };
	}

	/**
	 * Update configuration
	 */
	update(updates: Partial<TianConfig>): void {
		this.config = { ...this.config, ...updates };
		this.save();
	}

	/**
	 * Ensure agent directory exists
	 */
	ensureAgentDir(): void {
		const dirs = [
			this.config.agentDir,
			join(this.config.agentDir, "sessions"),
			join(this.config.agentDir, "users"),
			join(this.config.agentDir, "logs"),
			join(this.config.agentDir, "skills"),
		];

		for (const dir of dirs) {
			if (!existsSync(dir)) {
				mkdirSync(dir, { recursive: true });
			}
		}
	}
}

// ============================================================================
// User Preferences Manager
// ============================================================================

export class UserPreferencesManager {
	private basePath: string;

	constructor(basePath: string) {
		this.basePath = basePath;
	}

	/**
	 * Get preferences file path for user
	 */
	private getPreferencesPath(userId: string): string {
		return join(this.basePath, "users", `${userId}.json`);
	}

	/**
	 * Load user preferences
	 */
	load(userId: string): UserPreferences {
		const path = this.getPreferencesPath(userId);
		if (existsSync(path)) {
			try {
				const content = readFileSync(path, "utf-8");
				return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(content) };
			} catch {
				return { ...DEFAULT_USER_PREFERENCES };
			}
		}
		return { ...DEFAULT_USER_PREFERENCES };
	}

	/**
	 * Save user preferences
	 */
	save(userId: string, preferences: UserPreferences): void {
		const path = this.getPreferencesPath(userId);
		const dir = join(path, "..");
		if (!existsSync(dir)) {
			mkdirSync(dir, { recursive: true });
		}
		writeFileSync(path, JSON.stringify(preferences, null, 2));
	}

	/**
	 * Update specific preference
	 */
	update(userId: string, updates: Partial<UserPreferences>): UserPreferences {
		const current = this.load(userId);
		const updated = { ...current, ...updates };
		this.save(userId, updated);
		return updated;
	}
}
