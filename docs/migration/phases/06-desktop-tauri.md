# Phase 6 — Desktop (Tauri)

**Prerequisites:** Phase 2 complete (LiveKit video works); Phase 5 recommended for full parity  
**Branch:** `cursor/phase-06-desktop-e8a0`  
**Next phase:** None (migration complete)

---

## PROMPT START

You are a senior full-stack engineer executing **Phase 6: Desktop (Tauri)** of the corgi-chat migration.

### Context

Read before writing any code:
- `docs/migration/reference/target-architecture.md`
- `packages/ui/` and `packages/core/` — reuse these in desktop; do not duplicate room UI

The web app (`apps/web`) is the reference implementation. The desktop app is a **thin native shell** around shared `packages/ui` and `packages/core`.

### Objective

Ship a Tauri 2 desktop app for macOS and Windows that joins corgi-chat rooms with full video + chat, plus native desktop features.

### Scope

**In scope:**
- `apps/desktop` — Tauri 2 + Vite + React 19
- Import `packages/ui` and `packages/core` (same room, chat, video components as web)
- `packages/core/platform.ts` — platform adapter interface:
  ```ts
  interface Platform {
    openExternal(url: string): Promise<void>;
    showNotification(title: string, body: string): Promise<void>;
    onDeepLink(callback: (url: string) => void): void;
    setBadgeCount?(count: number): void;
  }
  ```
- Web implementation in `apps/web/src/platform.ts`
- Tauri implementation in `apps/desktop/src/platform.ts` (Rust commands + JS bridge)
- Deep links: `corgi-chat://r/[slug]` opens app and navigates to room
- System tray: icon, "Open", recent rooms (from local storage), quit
- Native notifications: new chat message when app is unfocused
- Global shortcut: Cmd/Ctrl+Shift+M toggles mute (via Tauri plugin)
- Auto-updater: Tauri updater checking `GET /api/releases/latest`
- Build scripts: `pnpm desktop:build` produces `.dmg` / `.msi` / `.AppImage`
- GitHub Actions: build + release artifacts on tag `desktop-v*`

**Out of scope:**
- Linux ARM builds (unless trivial)
- Mac App Store / Windows Store distribution
- Offline mode (cache messages locally — future)
- Custom iframe sandboxing beyond Tauri WebView defaults

### Tasks (execute in order)

1. **Inspect** `packages/ui` and `packages/core` — confirm they have no Next.js-specific imports. Refactor if needed (e.g. move `next/navigation` usage to app layer).
2. **Scaffold** `apps/desktop`:
   ```bash
   pnpm create tauri-app --name desktop
   ```
   Configure Vite to resolve workspace packages.
3. **Routing** — use `react-router` in desktop (not Next.js router):
   - `/` — home / recent rooms
   - `/r/:slug` — room (reuse `packages/ui` room components)
4. **Auth** — Clerk works in Tauri via `@clerk/clerk-react` + external browser OAuth callback OR embedded browser. Document chosen approach.
5. **Platform adapter** — implement `Platform` for Tauri:
   - `openExternal` → `tauri-plugin-shell`
   - `showNotification` → `tauri-plugin-notification`
   - `onDeepLink` → `tauri-plugin-deep-link`
6. **Deep link** — register `corgi-chat://` scheme in `tauri.conf.json`; parse `/r/[slug]` and navigate.
7. **Tray** — system tray with: Open, Recent rooms (last 5 from localStorage), Quit.
8. **Global shortcut** — register mute toggle; call into LiveKit room via `packages/core` event bus.
9. **Shared iframe activities** — in desktop, open SharedIframe/Twitch in Tauri `WebviewWindow` instead of inline iframe if inline has CSP issues.
10. **Updater** — `apps/web/src/app/api/releases/latest/route.ts` returns `{ version, url, notes }`.
11. **CI** — `.github/workflows/desktop-release.yml`:
    - Trigger on `desktop-v*` tags
    - Build macOS (universal) + Windows
    - Upload to GitHub Releases
12. **Test** on macOS and/or Windows:
    - Launch app → sign in → join room → video works
    - Deep link opens correct room
    - Notification on background chat message
13. **Commit**, push, update PR.

### Constraints

- Desktop must not fork `packages/ui` — fix shared packages if platform-specific code is needed.
- LiveKit WebView: test on WebView2 (Windows) and WKWebView (macOS) early; document known limitations.
- Code signing: document steps for Apple notarization and Windows Authenticode; do not commit certificates.
- Keep desktop bundle <30MB if possible (Tauri advantage over Electron).

### Verification checklist

- [ ] `pnpm desktop:dev` launches Tauri app
- [ ] User can sign in (Clerk flow documented and working)
- [ ] User can create/join room with video + chat
- [ ] Deep link `corgi-chat://r/test-slug` opens app to that room
- [ ] System tray icon visible with working menu
- [ ] Notification appears when chat message received and app unfocused
- [ ] Global mute shortcut works during call
- [ ] `pnpm desktop:build` produces installable artifact
- [ ] CI workflow file exists for desktop release
- [ ] PR updated with Phase 6 summary and build instructions

### Deliverables

1. PR URL
2. Platform adapter design summary
3. Build instructions for macOS and Windows
4. Code signing checklist for user
5. Verification checklist pass/fail
6. Known WebView/LiveKit limitations per OS

### Handoff

Migration complete. Suggested follow-ups (out of scope):
- Self-host LiveKit on Fly.io
- Offline message cache (SQLite via Tauri plugin)
- Mobile app (React Native + LiveKit)

## PROMPT END
