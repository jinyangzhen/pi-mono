# Tian-gong (天工)

> Named after 《天工开物》 (Tiangong Kaiwu, 1637) - the ancient Chinese encyclopedia of crafts and technology, symbolizing universal craftsmanship across all domains.

**Open AI Agent Platform** with dual TUI/Web interface for engineers and citizen developers.

## Features

- **Dual Interface**: Switch between Terminal (TUI) and Chat (Web) modes
- **Open Platform**: Domain-agnostic - customize for any industry or use case
- **Task Templates**: Pre-defined templates for common workflows
- **Session Persistence**: Resume tasks across sessions
- **Skill System**: Extend capabilities with custom skills
- **Tool Framework**: Build domain-specific tools easily
- **Audit Logging**: Full compliance tracking
- **Multi-user Support**: Role-based access control

## Installation

```bash
npm install @mariozechner/tian-gong
```

## Quick Start

### Start the Server

```bash
# Start with default settings
tian-gong start

# Start with custom port
tian-gong start --port 8080

# Start with custom workspace
tian-gong start --workspace /path/to/workspace
```

### Access the UI

- **Chat Mode (Default)**: http://localhost:3000/?mode=chat
- **Terminal Mode**: http://localhost:3000/?mode=terminal

### Switch Modes

Users can switch between modes in Settings, or via URL:
- `/?mode=chat` - Chat interface for citizen developers
- `/?mode=terminal` - Full terminal interface for engineers

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web Browser                              │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Shell (Host)                         │  │
│  │                   Module Federation                       │  │
│  │  - Routing & Navigation                                   │  │
│  │  - Authentication & Session Mgmt                          │  │
│  │  - Mode Selection (?mode=chat|terminal)                   │  │
│  │  - Deep Linking & URL Params                             │  │
│  │  - Role-Based Access Control                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                  │
│         ┌────────────────────┴────────────────────┐            │
│         ▼                                         ▼            │
│  ┌──────────────────┐                  ┌───────────────────┐  │
│  │  Chat Remote     │                  │  Terminal Remote   │  │
│  │  (pi-web-ui)     │                  │  (xterm.js)        │  │
│  │                  │                  │                   │  │
│  │  Friendly UI     │                  │  Full pi TUI       │  │
│  │  for citizens    │                  │  for engineers     │  │
│  └──────────────────┘                  └───────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Tian-gong Server                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              pi-coding-agent SDK                          │  │
│  │  - AgentSession management                                │  │
│  │  - Tool execution                                         │  │
│  │  - Session persistence                                    │  │
│  │  - Extension system                                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Custom Tools Framework                       │  │
│  │  - Policy/Claims tools (example)                         │  │
│  │  - Document generation                                    │  │
│  │  - Reporting & analytics                                  │  │
│  │  - Build your own!                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Deep Linking

Share sessions or direct users to specific contexts using URL parameters:

### Mode Selection

```
http://localhost:3000/?mode=chat      # Chat interface
http://localhost:3000/?mode=terminal  # Terminal interface
```

### Session Sharing

```
http://localhost:3000/?mode=chat&sessionId=abc123
```

Users can share a direct link that loads a specific session, with the mode automatically selected. Session IDs are persisted in localStorage and can be shared via URL.

## Role-Based Access Control

Configure which modes are available to different user roles using the `allowedModes` configuration:

```json
{
  "users": [
    {
      "username": "citizen",
      "allowedModes": ["chat"]
    },
    {
      "username": "engineer",
      "allowedModes": ["chat", "terminal"]
    },
    {
      "username": "admin",
      "allowedModes": ["chat", "terminal"]
    }
  ]
}
```

- `allowedModes: ["chat"]` - User can only access Chat mode
- `allowedModes: ["terminal"]` - User can only access Terminal mode
- `allowedModes: ["chat", "terminal"]` - User can access both modes

The Shell enforces these restrictions and redirects users to their default mode if they attempt to access an unauthorized mode.

## Usage

### For Citizen Developers (Chat Mode)

1. Open http://localhost:3000/?mode=chat
2. Select a task template or describe your task
3. Chat with the agent to complete your task
4. Checkpoints are saved automatically

### For Engineers (Terminal Mode)

1. Open http://localhost:3000/?mode=terminal
2. Use full `pi` TUI commands
3. All coding agent features available
4. Switch to chat mode in settings if needed

## Extending with Custom Tools

Tian-gong is designed to be extended. Create custom tools for your domain:

```typescript
// src/tools/my-tools.ts
import { Type, type Static } from "@sinclair/typebox";
import type { ToolDefinition } from "@mariozechner/pi-coding-agent";
import type { TianToolsConfig } from "./index.js";

const MyActionParams = Type.Object({
	input: Type.String({ description: "Input parameter" }),
});

export function createMyTools(config: TianToolsConfig): ToolDefinition[] {
	return [
		{
			name: "my_action",
			label: "My Action",
			description: "Does something useful",
			parameters: MyActionParams,

			execute: async (toolCallId, params, onUpdate, ctx, signal) => {
				// Your implementation here
				return {
					content: [{ type: "text", text: `Result: ${params.input}` }],
					details: {},
				};
			},
		},
	];
}
```

## Example Tools Included

The package includes example tools demonstrating the framework:

| Category | Tools |
|----------|-------|
| Data Management | `search_record`, `get_details`, `update_record` |
| Documents | `list_templates`, `generate_document`, `generate_letter` |
| Reporting | `generate_report`, `export_data`, `analyze_data` |
| Workflow | `request_approval`, `check_status`, `create_checkpoint` |

## Configuration

Configuration is stored in `~/.tian-gong/config.json`:

```json
{
  "port": 3000,
  "host": "0.0.0.0",
  "agentDir": "~/.tian-gong",
  "workspaceDir": "./workspace",
  "defaultModel": {
    "provider": "azure-openai-responses",
    "modelId": "gpt-4o"
  },
  "session": {
    "timeoutMinutes": 30,
    "maxPerUser": 5,
    "persist": true
  },
  "security": {
    "auditLogging": true,
    "rateLimit": 100,
    "allowedOrigins": ["*"]
  }
}
```

## User Preferences

Users can customize their experience:

- **UI Mode**: Terminal (TUI) or Chat (Web)
- **Theme**: Light, Dark, or System
- **Auto-save**: Automatic session saving
- **Notifications**: Email and Slack alerts

## Development

```bash
# Clone and install
git clone https://github.com/badlogic/pi-mono.git
cd pi-mono/packages/tian-gong
npm install

# Development
npm run dev

# Build
npm run build

# Run tests
npm test
```

## Docker

```bash
# Build
docker build -t tian-gong .

# Run
docker run -p 3000:3000 \
  -e AZURE_OPENAI_API_KEY=your-key \
  -e AZURE_OPENAI_BASE_URL=your-url \
  tian-gong
```

## Docker Compose

```yaml
version: '3.8'
services:
  tian-gong:
    build: .
    ports:
      - "3000:3000"
    environment:
      - AZURE_OPENAI_API_KEY=${AZURE_OPENAI_API_KEY}
      - AZURE_OPENAI_BASE_URL=${AZURE_OPENAI_BASE_URL}
    volumes:
      - ./workspace:/app/workspace
      - ./data:/root/.tian-gong
```

## Etymology

**天工 (Tian-gong)** comes from **天工开物 (Tiangong Kaiwu)**, a Chinese encyclopedia published in 1637 by Song Yingxing. The title literally means "The Exploitation of the Works of Nature" and covers:

- Agriculture and farming
- Manufacturing and crafts
- Mining and metallurgy
- Paper and printing
- Ceramics and textiles
- And much more...

Just as the encyclopedia documented universal craftsmanship across all domains, the Tian-gong agent platform is designed to be **domain-agnostic** and **infinitely extensible**.

## License

MIT
