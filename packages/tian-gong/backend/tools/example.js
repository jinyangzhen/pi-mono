/**
 * Example Tool - Simple greeting tool
 */
import { Type } from "@sinclair/typebox";
const ExampleParams = Type.Object({
    name: Type.String({ description: "Your name" }),
});
export const exampleTool = {
    name: "example_greet",
    label: "Greet User",
    description: "A simple greeting tool that welcomes you by name.",
    parameters: ExampleParams,
    execute: async (_toolCallId, params, _signal, onUpdate, _ctx) => {
        onUpdate?.({ content: [{ type: "text", text: `Hello, ${params.name}!` }], details: {} });
        return {
            content: [{ type: "text", text: `Welcome to TianGong, ${params.name}!` }],
            details: { name: params.name, timestamp: new Date().toISOString() },
        };
    },
};
//# sourceMappingURL=example.js.map