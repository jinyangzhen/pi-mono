/**
 * Tools Index - Export all available tools
 */
import type { ExtensionContext, ToolDefinition } from "@mariozechner/pi-coding-agent";
export { exampleTool } from "./example.js";
/**
 * Create all TianGong tools
 */
export declare function createTianTools(_ctx?: ExtensionContext): ToolDefinition[];
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
//# sourceMappingURL=index.d.ts.map