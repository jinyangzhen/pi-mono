/**
 * Example Tool - Simple greeting tool
 */

import type {
	AgentToolResult,
	AgentToolUpdateCallback,
	ExtensionContext,
	ToolDefinition,
} from "@mariozechner/pi-coding-agent";
import { type Static, Type } from "@sinclair/typebox";

const ExampleParams = Type.Object({
	name: Type.String({ description: "Your name" }),
});

export const exampleTool: ToolDefinition = {
	name: "example_greet",
	label: "Greet User",
	description: "A simple greeting tool that welcomes you by name.",
	parameters: ExampleParams,

	execute: async (
		_toolCallId: string,
		params: Static<typeof ExampleParams>,
		_signal: AbortSignal | undefined,
		onUpdate: AgentToolUpdateCallback<any> | undefined,
		_ctx: ExtensionContext,
	): Promise<AgentToolResult<any>> => {
		onUpdate?.({ content: [{ type: "text", text: `Hello, ${params.name}!` }], details: {} });

		return {
			content: [{ type: "text", text: `Welcome to TianGong, ${params.name}!` }],
			details: { name: params.name, timestamp: new Date().toISOString() },
		};
	},
};
