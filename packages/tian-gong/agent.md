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
