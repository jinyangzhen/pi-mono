/**
 * System prompt builder for TianGong Agent
 */
import type { Skill } from "@mariozechner/pi-coding-agent";
import type { TaskTemplate, TianUser } from "./types.js";
export interface BuildSystemPromptParams {
    user: TianUser;
    taskName?: string;
    taskDescription?: string;
    taskTemplate?: TaskTemplate;
    skills: Skill[];
    workspaceDir?: string;
}
export declare function buildTianSystemPrompt(params: BuildSystemPromptParams): Promise<string>;
//# sourceMappingURL=system-prompt.d.ts.map