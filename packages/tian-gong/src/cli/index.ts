#!/usr/bin/env node

/**
 * TianGong (天工) Agent CLI
 *
 * Named after 《天工开物》 - the ancient Chinese encyclopedia of crafts.
 */

import chalk from "chalk";
import { Command } from "commander";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { ConfigManager, DEFAULT_CONFIG } from "../core/config.js";
import { TianGongServer } from "../server/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read version from package.json
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../..", "package.json"), "utf-8"));
const VERSION = pkg.version;
const BANNER = readFileSync(resolve(__dirname, "banner.txt"), "utf-8").replace("{{VERSION}}", VERSION);

const program = new Command();

program
	.name("tian-gong")
	.description("TianGong (天工) - Open AI agent platform with dual TUI/Web interface")
	.version(VERSION);

// ============================================================================
// Start Server Command
// ============================================================================

program
	.command("start")
	.description("Start the TianGong server")
	.option("-p, --port <port>", "Server port", String(DEFAULT_CONFIG.port))
	.option("-h, --host <host>", "Server host", DEFAULT_CONFIG.host)
	.option("-d, --agent-dir <dir>", "Agent directory for sessions and settings")
	.option("-w, --workspace <dir>", "Default workspace directory", process.cwd())
	.option("--no-persist", "Disable session persistence")
	.action(async (options) => {
		console.log(chalk.red.bold(BANNER));

		// Update config from CLI options
		const config = new ConfigManager();
		if (options.port) config.update({ port: parseInt(options.port, 10) });
		if (options.host) config.update({ host: options.host });
		if (options.agentDir) config.update({ agentDir: options.agentDir });
		if (options.workspace) config.update({ workspaceDir: options.workspace });

		// Create and start server
		const server = new TianGongServer();

		// Handle shutdown
		process.on("SIGINT", () => {
			console.log(chalk.yellow("\nShutting down..."));
			server.stop();
			process.exit(0);
		});

		process.on("SIGTERM", () => {
			server.stop();
			process.exit(0);
		});

		// Start server
		server.start();
	});

// ============================================================================
// Config Command
// ============================================================================

program
	.command("config")
	.description("Manage configuration")
	.command("show")
	.description("Show current configuration")
	.action(() => {
		const config = new ConfigManager();
		console.log(chalk.bold("\nCurrent Configuration:\n"));
		console.log(JSON.stringify(config.get(), null, 2));
	});

// ============================================================================
// Tasks Command
// ============================================================================

program
	.command("tasks")
	.description("Manage tasks")
	.command("list")
	.description("List all tasks")
	.option("-u, --user <userId>", "User ID")
	.action(async (_options) => {
		console.log(chalk.bold("\nTasks:\n"));
		// TODO: Implement task listing via API
		console.log("  No tasks found.");
		console.log("");
	});

// ============================================================================
// Version Command
// ============================================================================

program
	.command("version")
	.description("Show version information")
	.action(() => {
		console.log(`TianGong (天工) v${VERSION}`);
		console.log(`Node.js ${process.version}`);
	});

// ============================================================================
// Parse and Run
// ============================================================================

program.parse();
