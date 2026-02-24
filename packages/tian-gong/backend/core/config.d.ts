/**
 * Configuration management for TianGong Agent
 */
import type { TianConfig, UserPreferences } from "./types.js";
export declare const DEFAULT_CONFIG: TianConfig;
export declare const DEFAULT_USER_PREFERENCES: UserPreferences;
export declare const TASK_TEMPLATES: ({
    id: string;
    name: string;
    description: string;
    category: "policy_management";
    icon: string;
    estimatedTime: string;
    skills: string[];
    defaultInput: string;
    approvalRequired?: undefined;
} | {
    id: string;
    name: string;
    description: string;
    category: "claims_processing";
    icon: string;
    estimatedTime: string;
    skills: string[];
    approvalRequired: boolean;
    defaultInput?: undefined;
} | {
    id: string;
    name: string;
    description: string;
    category: "reporting";
    icon: string;
    estimatedTime: string;
    skills: string[];
    defaultInput?: undefined;
    approvalRequired?: undefined;
} | {
    id: string;
    name: string;
    description: string;
    category: "data_validation";
    icon: string;
    estimatedTime: string;
    skills: string[];
    defaultInput?: undefined;
    approvalRequired?: undefined;
} | {
    id: string;
    name: string;
    description: string;
    category: "document_generation";
    icon: string;
    estimatedTime: string;
    skills: string[];
    defaultInput?: undefined;
    approvalRequired?: undefined;
} | {
    id: string;
    name: string;
    description: string;
    category: "custom";
    icon: string;
    estimatedTime: string;
    skills: never[];
    defaultInput?: undefined;
    approvalRequired?: undefined;
})[];
export declare class ConfigManager {
    private configPath;
    private config;
    constructor(configPath?: string);
    /**
     * Load configuration from file
     */
    load(): TianConfig;
    /**
     * Save configuration to file
     */
    save(): void;
    /**
     * Get current configuration
     */
    get(): TianConfig;
    /**
     * Update configuration
     */
    update(updates: Partial<TianConfig>): void;
    /**
     * Ensure agent directory exists
     */
    ensureAgentDir(): void;
}
export declare class UserPreferencesManager {
    private basePath;
    constructor(basePath: string);
    /**
     * Get preferences file path for user
     */
    private getPreferencesPath;
    /**
     * Load user preferences
     */
    load(userId: string): UserPreferences;
    /**
     * Save user preferences
     */
    save(userId: string, preferences: UserPreferences): void;
    /**
     * Update specific preference
     */
    update(userId: string, updates: Partial<UserPreferences>): UserPreferences;
}
//# sourceMappingURL=config.d.ts.map