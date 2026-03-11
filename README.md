# devtime-vscode

VS Code extension that tracks your coding time locally. No server, no account — just JSONL files on disk.

## How it works

The extension writes events to `~/.devtime/events-YYYY-MM.jsonl`:

```json
{"ts":"2026-03-11T09:00:00+01:00","event":"heartbeat","project":"my-app","lang":"typescript","editor":"vscode"}
```

**Events:**
- `focus` — VS Code gains focus or activates
- `blur` — VS Code loses focus or deactivates
- `heartbeat` — every 30s while editing, plus on editor/document changes

## Install

Build the extension and install from VSIX, or run in development with `F5`.

```sh
npm install
npm run build
```
