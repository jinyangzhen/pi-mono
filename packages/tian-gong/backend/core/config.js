/**
 * Configuration management for TianGong Agent
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";
// ============================================================================
// Default Configuration
// ============================================================================
export const DEFAULT_CONFIG = {
    port: 3000,
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
    apiKeys: [
        { provider: "openai", apiKey: "sk-system-openai-xxxx" },
        { provider: "anthropic", apiKey: "sk-system-anthropic-xxxx" },
    ],
    security: {
        auditLogging: true,
        rateLimit: 100,
        allowedOrigins: ["*"],
    },
};
export const DEFAULT_USER_PREFERENCES = {
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
        category: "policy_management",
        icon: "📋",
        estimatedTime: "15-30 minutes",
        skills: ["policy-lookup", "reporting"],
        defaultInput: "Review all policies expiring in the next 30 days and provide a summary.",
    },
    {
        id: "claims-batch",
        name: "Batch Claims Processing",
        description: "Process multiple claims from the queue with validation",
        category: "claims_processing",
        icon: "📝",
        estimatedTime: "30-60 minutes",
        skills: ["claims-processing"],
        approvalRequired: true,
    },
    {
        id: "report-generation",
        name: "Generate Compliance Report",
        description: "Create compliance or performance reports with data analysis",
        category: "reporting",
        icon: "📊",
        estimatedTime: "10-20 minutes",
        skills: ["reporting", "data-analysis"],
    },
    {
        id: "data-validation",
        name: "Customer Data Validation",
        description: "Validate customer records for accuracy and completeness",
        category: "data_validation",
        icon: "✅",
        estimatedTime: "15-30 minutes",
        skills: ["data-validation"],
    },
    {
        id: "document-generation",
        name: "Generate Policy Documents",
        description: "Create policy documents from templates with customer data",
        category: "document_generation",
        icon: "📄",
        estimatedTime: "5-15 minutes",
        skills: ["document-generation"],
    },
    {
        id: "custom",
        name: "Custom Task",
        description: "Describe your own task and let the assistant help you",
        category: "custom",
        icon: "🎯",
        estimatedTime: "Varies",
        skills: [],
    },
];
// ============================================================================
// Configuration Manager
// ============================================================================
export class ConfigManager {
    constructor(configPath) {
        this.configPath = configPath ?? join(homedir(), ".tian-gong", "config.json");
        this.config = { ...DEFAULT_CONFIG };
        this.load();
    }
    /**
     * Load configuration from file
     */
    load() {
        if (existsSync(this.configPath)) {
            try {
                const content = readFileSync(this.configPath, "utf-8");
                const loaded = JSON.parse(content);
                this.config = { ...DEFAULT_CONFIG, ...loaded };
            }
            catch (_error) {
                console.warn(`Failed to load config from ${this.configPath}, using defaults`);
            }
        }
        return this.config;
    }
    /**
     * Save configuration to file
     */
    save() {
        const dir = join(this.configPath, "..");
        if (!existsSync(dir)) {
            mkdirSync(dir, { recursive: true });
        }
        writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }
    /**
     * Get current configuration
     */
    get() {
        return { ...this.config };
    }
    /**
     * Update configuration
     */
    update(updates) {
        this.config = { ...this.config, ...updates };
        this.save();
    }
    /**
     * Ensure agent directory exists
     */
    ensureAgentDir() {
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
    constructor(basePath) {
        this.basePath = basePath;
    }
    /**
     * Get preferences file path for user
     */
    getPreferencesPath(userId) {
        return join(this.basePath, "users", `${userId}.json`);
    }
    /**
     * Load user preferences
     */
    load(userId) {
        const path = this.getPreferencesPath(userId);
        if (existsSync(path)) {
            try {
                const content = readFileSync(path, "utf-8");
                return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(content) };
            }
            catch {
                return { ...DEFAULT_USER_PREFERENCES };
            }
        }
        return { ...DEFAULT_USER_PREFERENCES };
    }
    /**
     * Save user preferences
     */
    save(userId, preferences) {
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
    update(userId, updates) {
        const current = this.load(userId);
        const updated = { ...current, ...updates };
        this.save(userId, updated);
        return updated;
    }
}
//# sourceMappingURL=config.js.map