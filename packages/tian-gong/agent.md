# TianGong Micro-Frontend Architecture Refactor

## TL;DR

> Refactor TianGong from static HTML pages to micro-frontend architecture with React TSX.
> Shell (host) manages routing, auth, session. Chat and Terminal apps are federated remotes.
> 
> **Deliverables**:
> - SPA shell with Module Federation
> - Chat remote (citizen developer UI)
> - Terminal remote (engineer UI)  
> - Server-side session management
> - Deep linking support
> 
> **Estimated Effort**: Medium | **Parallel Execution**: YES - 4 waves | **Critical Path**: Wave 1 → 2 → 3 → 4

---

## Context

### Original Request
User wants micro-frontend architecture for TianGong platform:
1. Micro-frontend architecture
2. Chat app for citizen developers
3. Terminal app for engineers
4. Users can switch between modes (role-based)
5. Session persistence in memory
6. Deep linking with session ID and mode
7. All client-side rendered TSX

### Interview Summary
**Key Discussions**:
- Session flow: Server-first (server creates session if not exists)
- Mode permissions: Role-based (user model has allowed modes)

**Research Findings**:
- Module Federation via @originjs/vite-plugin-federation is best for React
- Zustand with singleton pattern for state sharing
- Host-based routing (shell handles all routing)
- Centralized auth in shell

---

## Work Objectives

### Core Objective
Transform TianGong from static HTML serving to micro-frontend SPA architecture with Module Federation.

### Session Backend Architecture
- **Chat app**: Connects to server via WebSocket, server uses TianGongAgentRunner (tian-gong core) to manage chat sessions
- **Terminal app**: Connects to server via WebSocket, server spawns PTY with pi command using pi-coding-agent AgentSession
- **Sessions are separate**: Chat sessions and Terminal sessions are independent, cannot be shared
- **User model**: Same user with role-based permissions (allowedModes: ['chat', 'terminal', 'both'])

### Concrete Deliverables
- **Shell app** (host): Main entry point, handles routing, auth, session
- **Chat remote**: Citizen developer UI (exposed via Module Federation)
- **Terminal remote**: Engineer UI (exposed via Module Federation)
- **Server updates**: SPA routing, session management API, auth endpoints
- **Shared state**: Auth store, session store exposed to remotes

### Definition of Done
- [ ] `GET /` returns React app (index.html with script tag)
- [ ] `/terminal` returns same React app, mode in URL/params
- [ ] Deep link `/?session=xxx&mode=chat` restores session
- [ ] User can switch between chat/terminal if role allows both
- [ ] Terminal app connects to WebSocket with session ID

### Must Have
- SPA serving (single index.html for all routes)
- Module Federation config for host + remotes
- In-memory session management on server
- Role-based mode permissions
- Session persistence across page refreshes

### Must NOT Have
- Static HTML files for each page (no more terminal.html, chat.html)
- Server-side rendering (all client-side TSX)
- Iframe-based architecture (use Module Federation)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (no existing tests)
- **Automated tests**: None (manual verification)
- **Agent-Executed QA**: EVERY task includes QA scenarios

### QA Policy
Every task includes agent-executed verification:
- **Frontend**: Playwright - navigate, interact, assert DOM
- **API**: curl - request endpoints, assert responses
- **WebSocket**: curl + ws echo - verify connection

---

## Execution Strategy

### Architecture Overview

```
                    ┌─────────────────────────────────────┐
                    │         Browser                     │
                    │  ┌─────────────────────────────┐  │
                    │  │     Shell (Host)            │  │
                    │  │  - React Router             │  │
                    │  │  - Auth Store (Zustand)     │  │
                    │  │  - Session Store            │  │
                    │  └──────────┬──────────────────┘  │
                    │             │                     │
                    │  ┌──────────┴──────────┐         │
                    │  ▼                     ▼         │
                    │ ┌────────┐        ┌──────────┐  │
                    │ │  Chat  │        │ Terminal │  │
                    │ │ Remote │        │  Remote  │  │
                    │ └────────┘        └──────────┘  │
                    └─────────────────────────────────────┘
                              │ WebSocket
                              ▼
                    ┌─────────────────────┐
                    │    Express Server   │
                    │  - Session Mgmt    │
                    │  - Auth (mock)     │
                    │  - WebSocket      │
                    └─────────────────────┘
```

### Directory Structure

```
packages/tian-gong/
├── web-ui/                    # Shell (Host) - Main React app
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx          # Router + layout
│   │   ├── stores/
│   │   │   ├── authStore.ts # Auth state (exposed)
│   │   │   └── sessionStore.ts
│   │   ├── components/
│   │   │   ├── Layout.tsx
│   │   │   └── ModeSwitcher.tsx
│   │   ├── apps/
│   │   │   ├── chat/        # Chat remote app
│   │   │   │   ├── ChatApp.tsx
│   │   │   │   └── ChatPanel.tsx
│   │   │   └── terminal/    # Terminal remote app
│   │   │       ├── TerminalApp.tsx
│   │   │       └── TerminalView.tsx
│   │   └── hooks/
│   │       └── useSession.ts
│   ├── vite.config.ts        # Module Federation host config
│   └── index.html
├── src/
│   └── server/
│       └── index.ts          # Update for SPA routing
└── package.json
```

### Parallel Execution Waves

```
Wave 1 (Foundation - can run in parallel):
├── T1: Update vite.config.ts with Module Federation (host)
├── T2: Create auth store with role-based modes
├── T3: Create session store and hooks
├── T4: Update server for SPA routing (catch-all route)
└── T5: Set up index.html with bootstrap pattern

Wave 2 (Remotes - MAX PARALLEL):
├── T6: Create Chat remote app (exposes ChatApp)
├── T7: Create Terminal remote app (exposes TerminalApp)
├── T8: Configure Module Federation remotes in host
├── T9: Update App.tsx with dynamic route loading
└── T10: Implement mode switching component

Wave 3 (Integration):
├── T11: Implement deep linking (parse session/mode from URL)
├── T12: Add session persistence (localStorage + server sync)
├── T13: Connect Terminal remote to WebSocket with session
├── T14: Add role-based mode restrictions
└── T15: Test full flow (login → session → mode switch)

Wave 4 (QA & Polish):
├── T16: Remove old static HTML files
├── T17: Error boundaries and loading states
├── T18: Final integration testing
└── T19: Documentation update
```

---

## TODOs

- [ ] 1. **Update vite.config.ts with Module Federation (host)**

  **What to do**:
  - Install @originjs/vite-plugin-federation
  - Configure host to consume remote apps
  - Set up shared dependencies (react, react-dom, zustand)
  - Enable async boundary pattern

  **Must NOT do**:
  - Don't expose components yet (that's for remotes)

  **References**:
  - `web-ui/package.json` - check existing deps

  **QA Scenarios**:
  ```
  Scenario: Build succeeds without errors
    Tool: Bash
    Preconditions: npm install complete
    Steps:
      1. cd packages/tian-gong/web-ui && npm run build
    Expected Result: Build completes with no errors
    Evidence: .sisyphus/evidence/t1-build.log
  ```

- [ ] 2. **Create auth store with role-based modes**

  **What to do**:
  - Create stores/authStore.ts
  - Implement user type with allowedModes: ('chat' | 'terminal' | 'both')[]
  - Add login/logout methods (mock for now)
  - Export as singleton for Module Federation

  **References**:
  - Existing: `src/core/types.ts` - TianUser type

  **QA Scenarios**:
  ```
  Scenario: Auth store initializes with default user
    Tool: Bash
    Preconditions: Build succeeds
    Steps:
      1. node -e "import('./web-ui/src/stores/authStore.ts').then(m => console.log(m.useAuthStore.getState()))"
    Expected Result: Returns default state with user=null, isAuthenticated=false
    Evidence: .sisyphus/evidence/t2-auth-store.log
  ```

- [ ] 3. **Create session store and hooks**

  **What to do**:
  - Create stores/sessionStore.ts
  - Implement session state (id, createdAt, mode, userId)
  - Create useSession hook for session management
  - Add session sync with server

  **References**:
  - Server session handling: `src/server/index.ts` TerminalSession

  **QA Scenarios**:
  ```
  Scenario: Session store creates new session ID
    Tool: Bash
    Steps:
      1. node -e "import('./web-ui/src/stores/sessionStore.ts').then(m => { const s = m.useSessionStore.getState(); console.log('hasSession:', !!s.sessionId); })"
    Expected Result: sessionId is a valid UUID
    Evidence: .sisyphus/evidence/t3-session-store.log
  ```

- [ ] 4. **Update server for SPA routing**

  **What to do**:
  - Modify server/index.ts to serve index.html for all non-API routes
  - Remove explicit routes for /terminal, /chat (handled by React Router)
  - Keep API routes and WebSocket intact

  **Must NOT do**:
  - Don't break existing API endpoints
  - Don't remove WebSocket handling

  **References**:
  - Current: `src/server/index.ts` setupMiddleware(), setupRoutes()

  **QA Scenarios**:
  ```
  Scenario: Server serves index.html for any route
    Tool: Bash
    Steps:
      1. curl -s http://localhost:3000/ | grep -q "root"
      2. curl -s http://localhost:3000/terminal | grep -q "root"
      3. curl -s http://localhost:3000/chat | grep -q "root"
    Expected Result: All return same index.html
    Evidence: .sisyphus/evidence/t4-spa-routing.log
  ```

- [ ] 5. **Set up index.html with bootstrap pattern**

  **What to do**:
  - Update index.html to use async bootstrap
  - Add script type="module" loading main.tsx

  **References**:
  - `web-ui/index.html` - current structure

  **QA Scenarios**:
  ```
  Scenario: index.html loads React app
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000
      2. Wait for React to mount
      3. Check #root element has content
    Expected Result: App renders without errors
    Evidence: .sisyphus/evidence/t5-index-html.png
  ```

- [ ] 6. **Create Chat remote app**

  **What to do**:
  - Create apps/chat/ChatApp.tsx
  - Create apps/chat/ChatPanel.tsx
  - Expose via Module Federation: ./ChatApp
  - Use existing chat logic from pages/Chat.tsx

  **Must NOT do**:
  - Don't include terminal functionality

  **References**:
  - Existing: `web-ui/src/pages/Chat.tsx`

  **QA Scenarios**:
  ```
  Scenario: ChatApp renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/?mode=chat
      2. Verify chat panel is visible
    Expected Result: Chat UI loads
    Evidence: .sisyphus/evidence/t6-chat-remote.png
  ```

- [ ] 7. **Create Terminal remote app**

  **What to do**:
  - Create apps/terminal/TerminalApp.tsx
  - Create apps/terminal/TerminalView.tsx
  - Expose via Module Federation: ./TerminalApp
  - Include xterm.js integration

  **References**:
  - Existing: `web-ui/src/pages/Terminal.tsx`

  **QA Scenarios**:
  ```
  Scenario: TerminalApp renders correctly
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/?mode=terminal
      2. Verify terminal is visible
    Expected Result: Terminal UI loads with xterm
    Evidence: .sisyphus/evidence/t7-terminal-remote.png
  ```

- [ ] 8. **Configure Module Federation remotes in host**

  **What to do**:
  - Update vite.config.ts remotes section
  - Configure remote apps (could be same app initially with route-based code splitting)
  - Set up shared: react, react-dom, zustand as singletons

  **References**:
  - Research: Module Federation config examples

  **QA Scenarios**:
  ```
  Scenario: Host can load remote components
    Tool: Bash
    Steps:
      1. npm run build in web-ui
      2. Check for remoteEntry.js in dist
    Expected Result: Federation artifacts present
    Evidence: .sisyphus/evidence/t8-mf-config.log
  ```

- [ ] 9. **Update App.tsx with dynamic route loading**

  **What to do**:
  - Replace static Route components with lazy loading
  - Load Chat/Terminal based on URL mode param
  - Implement mode from URL query param or path

  **References**:
  - Existing: `web-ui/src/App.tsx`

  **QA Scenarios**:
  ```
  Scenario: Route loads correct component
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3000/?mode=chat
      2. Navigate to http://localhost:3000/?mode=terminal
    Expected Result: Correct component renders for each
    Evidence: .sisyphus/evidence/t9-routing.png
  ```

- [ ] 10. **Implement mode switching component**

  **What to do**:
  - Create ModeSwitcher component
  - Check user's allowedModes from auth store
  - Show switcher only if user has both modes
  - Persist mode choice to URL + session

  **References**:
  - Auth store from T2

  **QA Scenarios**:
  ```
  Scenario: Mode switcher appears for users with both modes
    Tool: Playwright
    Steps:
      1. Login as user with both modes
      2. Verify switcher is visible
      3. Click switch mode button
    Expected Result: UI switches between chat/terminal
    Evidence: .sisyphus/evidence/t10-mode-switch.gif
  ```

- [ ] 11. **Implement deep linking (parse session/mode from URL)**

  **What to do**:
  - Read session ID from URL query param
  - Read mode from URL query param or path
  - If session exists on server, restore it
  - If session doesn't exist, server creates new one

  **References**:
  - Session store from T3
  - Server session API

  **QA Scenarios**:
  ```
  Scenario: Deep link restores session
    Tool: Playwright
    Steps:
      1. Open http://localhost:3000/?session=test-session&mode=terminal
      2. Check terminal connects with session ID
    Expected Result: Session ID sent to server
    Evidence: .sisyphus/evidence/t11-deep-link.log
  ```

- [ ] 12. **Add session persistence (localStorage + server sync)**

  **What to do**:
  - Store session ID in localStorage
  - On page load, check localStorage for existing session
  - Sync with server to validate session

  **QA Scenarios**:
  ```
  Scenario: Session persists across refresh
    Tool: Playwright
    Steps:
      1. Open app, get session ID
      2. Refresh page
      3. Check session ID is same
    Expected Result: Same session ID retained
    Evidence: .sisyphus/evidence/t12-session-persist.log
  ```

- [ ] 13. **Connect Terminal remote to WebSocket with session**

  **What to do**:
  - Pass session ID to WebSocket connection
  - Include mode in WebSocket handshake
  - Handle reconnection with session

  **References**:
  - Existing: terminal.html/js WebSocket logic

  **QA Scenarios**:
  ```
  Scenario: Terminal connects to WebSocket with session
    Tool: Bash + Playwright
    Steps:
      1. Open terminal with session ID
      2. Check server logs for WebSocket connection
    Expected Result: Connection includes session ID
    Evidence: .sisyphus/evidence/t13-ws-session.log
  ```

- [ ] 14. **Add role-based mode restrictions**

  **What to do**:
  - Check user's allowedModes before rendering mode
  - Redirect to allowed mode if current mode not permitted
  - Show error/redirect if user has no modes

  **QA Scenarios**:
  ```
  Scenario: User with only chat mode cannot access terminal
    Tool: Playwright
    Steps:
      1. Login as chat-only user
      2. Navigate to /?mode=terminal
    Expected Result: Redirected to chat or shown error
    Evidence: .sisyphus/evidence/t14-role-restrict.log
  ```

- [ ] 15. **Test full flow (login → session → mode switch)**

  **What to do**:
  - End-to-end test of complete user flow
  - Login → Session created → Mode switch → Deep link restore

  **QA Scenarios**:
  ```
  Scenario: Complete user flow works
    Tool: Playwright
    Steps:
      1. Open app, login
      2. Switch to terminal
      3. Copy URL with session
      4. Open new tab with URL
    Expected Result: Session restored, same mode
    Evidence: .sisyphus/evidence/t15-e2e.log
  ```

- [ ] 16. **Remove old static HTML files**

  **What to do**:
  - Delete src/server/public/index.html
  - Delete src/server/public/terminal.html
  - Delete src/server/public/chat.html
  - Delete src/server/public/js/chat.js

  **Must NOT do**:
  - Don't delete CSS (still referenced by web-ui)

  **QA Scenarios**:
  ```
  Scenario: Static files removed, app still works
    Tool: Bash
    Steps:
      1. ls src/server/public/
      2. npm run build && npm run start
      3. Test all routes
    Expected Result: App works without static files
    Evidence: .sisyphus/evidence/t16-cleanup.log
  ```

- [ ] 17. **Error boundaries and loading states**

  **What to do**:
  - Add React error boundaries
  - Add loading states for lazy-loaded components
  - Handle remote load failures gracefully

  **QA Scenarios**:
  ```
  Scenario: Error boundary catches failures
    Tool: Playwright
    Steps:
      1. Simulate component error
      2. Check error UI is shown
    Expected Result: Friendly error message, no crash
    Evidence: .sisyphus/evidence/t17-error-boundary.png
  ```

- [ ] 18. **Final integration testing**

  **What to do**:
  - Test all routes and modes
  - Test WebSocket functionality
  - Test session management

  **QA Scenarios**:
  ```
  Scenario: All features work together
    Tool: Playwright
    Steps:
      1. Complete T1-T17 verification
      2. No failures
    Expected Result: All green
    Evidence: .sisyphus/evidence/t18-integration.log
  ```

- [ ] 19. **Documentation update**

  **What to do**:
  - Update README.md with new architecture
  - Document deep linking format
  - Document role-based access

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — Verify all features implemented
- [ ] F2. **Code Quality Review** — No TypeScript errors
- [ ] F3. **Integration Testing** — Full user flows work

---

## Success Criteria

### Verification Commands
```bash
# Build
cd packages/tian-gong/web-ui && npm run build

# Start server
cd packages/tian-gong && npm run start

# Test routes
curl http://localhost:3000/ | grep "root"  # Returns HTML
curl http://localhost:3000/?mode=chat | grep "root"
curl http://localhost:3000/?mode=terminal | grep "root"

# Test API
curl http://localhost:3000/api/sessions
curl http://localhost:3000/api/me
```

### Final Checklist
- [ ] All routes return React app (SPA)
- [ ] Deep linking works with session ID
- [ ] Mode switching works for authorized users
- [ ] WebSocket connects with session
- [ ] No static HTML files used
- [ ] TypeScript compiles without errors

---

## Lessons Learned

### 1. Bootstrap Pattern is REQUIRED for Host

**Problem**: Direct federation imports like `lazy(() => import('chat/ChatApp'))` fail during Vite's import analysis phase.

**Solution**: Use the bootstrap pattern:
```
src/main.tsx     → import('./bootstrap')  // Just imports bootstrap
src/bootstrap.tsx → Contains actual app with federation imports
```

**Why**: Vite analyzes imports before the federation plugin can resolve them. The dynamic `import('./bootstrap')` delays resolution until federation is ready.

---

### 2. Single Config with FEDERATION Flag

**Problem**: Need both standalone dev (with HMR) and federation build for host consumption.

**Solution**: Use a single config with conditional federation based on `FEDERATION` env flag:

```typescript
// vite.config.chat.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

const isFederation = process.env.FEDERATION === 'true'

export default defineConfig({
  plugins: [
    react(),
    isFederation && federation({
      name: 'chat',
      filename: 'remoteEntry.js',
      exposes: {
        './ChatApp': './src/apps/chat/ChatApp.tsx',
      },
      shared: ['react', 'react-dom', 'zustand'],
    }),
  ].filter(Boolean),
  // Only scan the standalone entry, exclude host files
  optimizeDeps: {
    entries: ['chat.html'],
  },
  build: {
    rollupOptions: isFederation
      ? { input: [], preserveEntrySignatures: 'strict' }  // Federation only
      : { input: ['chat.html'] },  // Standalone SPA build
  },
})
```

**Usage**:
```bash
# Standalone dev (no federation, full HMR)
npm run dev:chat          # FEDERATION=false (default)

# Build for federation
npm run build:chat        # FEDERATION=true
```

---

### 3. Dev Server Scans All Files

**Problem**: Running `npm run dev:chat` fails with "Failed to resolve import 'chat/ChatApp'" because Vite's dev server pre-bundles ALL files in `src/`, including `bootstrap.tsx` which contains federation imports.

**Root Cause**: By default, Vite scans the entire `src/` directory for dependencies.

**Solution**: Explicitly specify entry points in `optimizeDeps.entries`:
```typescript
optimizeDeps: {
  entries: ['chat.html'],  // Only scan this entry for dependencies
},
```

**Why**: This tells Vite to only analyze dependencies from the specified entry, excluding host-specific files like `bootstrap.tsx`.

---

### 4. Dev Mode Does NOT Support Federation Consumption

**Problem**: Running `vite` (dev mode) on the host cannot load remote apps - you get 404 or "Failed to resolve import" errors.

**Solution**: All apps must be **built** and served via **preview** for federated mode:

```bash
# Federated workflow - must build first
npm run build:all && npm run dev:all
```

**Why**: `@originjs/vite-plugin-federation` generates `remoteEntry.js` during build, not during dev. Preview servers serve the built artifacts.

---

### 5. Remote Entry Path Must Match Built Output

**Problem**: Configuring `remotes: { chat: 'http://localhost:4001/remoteEntry.js' }` returns 404.

**Solution**: The remote entry is built to `assets/remoteEntry.js`:
```typescript
// vite.config.ts (host)
remotes: {
  chat: 'http://localhost:4001/assets/remoteEntry.js',
  terminal: 'http://localhost:4002/assets/remoteEntry.js',
}
```

---

### 6. CORS Required for Cross-Origin Federation

**Problem**: Browser blocks remoteEntry.js requests due to CORS.

**Solution**: Enable CORS on all servers:
```typescript
server: { cors: true },
preview: { cors: true },
```

---

### 7. Session ID URL Sync

**Problem**: The `onSessionChange` callback was passed to components but not used to update URL.

**Solution**: Route components handle URL sync:
```tsx
function ChatRoute() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const handleSessionChange = useCallback((newSessionId: string) => {
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.set('session', newSessionId)
    setSearchParams(newSearchParams, { replace: true })
  }, [searchParams, setSearchParams])

  // Initialize from localStorage if not in URL
  useEffect(() => {
    if (!searchParams.has('session')) {
      const storedSessionId = localStorage.getItem('tian_session_id')
      if (storedSessionId) {
        const newSearchParams = new URLSearchParams(searchParams)
        newSearchParams.set('session', storedSessionId)
        setSearchParams(newSearchParams, { replace: true })
      }
    }
  }, [searchParams, setSearchParams])

  return <ChatApp onSessionChange={handleSessionChange} />
}
```

---

### Architecture Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEVELOPMENT MODES                             │
├─────────────────────────────────────────────────────────────────┤
│  STANDALONE (No Federation)      │  FEDERATED (With Host)        │
│  ────────────────────────        │  ─────────────────────        │
│  npm run dev:chat                 │  npm run build:remotes        │
│  → Port 4001 (chat only)          │  npm run dev:all              │
│  Full HMR, hot reload             │  → Port 3000 (host)           │
│                                   │  → Port 4001 (chat preview)   │
│  npm run dev:terminal             │  → Port 4002 (terminal prev)  │
│  → Port 4002 (terminal only)      │                               │
│                                   │                               │
│  FEDERATION=false (default)       │  FEDERATION=true (build only) │
│  Uses chat.html / terminal.html   │  Preview built artifacts      │
└─────────────────────────────────────────────────────────────────┘
```

---

### npm Scripts Reference

| Script | FEDERATION | Port | Description |
|--------|------------|------|-------------|
| `dev:chat` | false | 4001 | Standalone ChatApp with HMR |
| `dev:terminal` | false | 4002 | Standalone TerminalApp with HMR |
| `dev:standalone` | false | 4001, 4002 | Both apps standalone |
| `build:chat` | true | - | Build ChatApp for federation |
| `build:terminal` | true | - | Build TerminalApp for federation |
| `build:remotes` | true | - | Build both for federation |
| `build:all` | true | - | Build remotes + host |
| `dev:all` | true | 3000, 4001, 4002 | Full federated setup |

---

### Files Reference

| File | Purpose |
|------|--------|
| `src/main.tsx` | Bootstrap entry - just `import('./bootstrap')` |
| `src/bootstrap.tsx` | App logic with federation imports (host only) |
| `src/chat-entry.tsx` | Standalone entry for ChatApp |
| `src/terminal-entry.tsx` | Standalone entry for TerminalApp |
| `chat.html` | HTML entry for standalone ChatApp |
| `terminal.html` | HTML entry for standalone TerminalApp |
| `index.html` | HTML entry for host |
| `vite.config.ts` | Host config - consumes remotes |
| `vite.config.chat.ts` | ChatApp config - conditional federation |
| `vite.config.terminal.ts` | TerminalApp config - conditional federation |
| `src/types/federation.d.ts` | TypeScript declarations for federation imports |

---

### Key Insights

1. **One Config Per App**: No need for separate standalone/federation configs - use `FEDERATION` env flag
2. **FEDERATION=true for Build Only**: Dev mode doesn't support federation consumption
3. **Standalone = Full Dev Experience**: HMR, hot reload, all Vite features work
4. **Federated = Preview Only**: Must build first, then preview built artifacts
5. **optimizeDeps.entries**: Required to prevent Vite from scanning host files during standalone dev
6. **Different Ports**: Standalone uses 4001/4002, host uses 3000, preview uses same ports for built output
