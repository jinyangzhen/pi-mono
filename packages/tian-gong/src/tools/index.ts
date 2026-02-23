/**
 * Tools Index - Export all available tools
 */

import type { ExtensionContext, ToolDefinition } from "@mariozechner/pi-coding-agent";
import { exampleTool } from "./example.js";

export { exampleTool } from "./example.js";

/**
 * Create all TianGong tools
 */
export function createTianTools(_ctx?: ExtensionContext): ToolDefinition[] {
	return [exampleTool];
}

/**
 * Tool configuration
 */
export interface TianToolsConfig {
	enabled: boolean;
	workspaceDir?: string;
}

/**
 * Tool result
 */
export interface TianToolsResult {
	content: any[];
	details?: Record<string, any>;
}
