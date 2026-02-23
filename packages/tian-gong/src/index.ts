/**
 * TianGong Agent
 *
 * AI-powered automation for TianGong
 * Supports both TUI mode (for engineers) and Web UI mode (for citizen developers)
 */

// Core
export { agentRunner, TianGongAgentRunner } from "./core/agent-runner.js";
export {
	ConfigManager,
	DEFAULT_CONFIG,
	DEFAULT_USER_PREFERENCES,
	TASK_TEMPLATES,
	UserPreferencesManager,
} from "./core/config.js";
export { buildTianSystemPrompt } from "./core/system-prompt.js";

// Types
export type {
	APIErrorResponse,
	APISessionListResponse,
	APITaskListResponse,
	SessionMetadata,
	TaskCategory,
	TaskCheckpoint,
	TaskMetadata,
	TaskStatus,
	TaskTemplate,
	TianConfig,
	TianSession,
	TianTask,
	TianToolConfig,
	TianUser,
	UserPreferences,
	WSConnectedMessage,
	WSErrorMessage,
	WSExitMessage,
	WSInputMessage,
	WSMessage,
	WSOutputMessage,
	WSResizeMessage,
} from "./core/types.js";

// Server
export { TianGongServer } from "./server/index.js";
export type { TianToolsConfig, TianToolsResult } from "./tools/index.js";
// Tools
export { createTianTools } from "./tools/index.js";
