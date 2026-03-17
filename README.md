# DevTime for VS Code

VS Code extension for [devtime](https://github.com/arnaudhrt/devtime) — a local-first coding time tracker. No server, no account, just plain text files on disk.

This extension silently tracks your coding activity and writes events to `~/.devtime/`. The [devtime CLI](https://github.com/arnaudhrt/devtime) reads those events and gives you breakdowns by project, language, day, week, month, or year — all from your terminal.

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

Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=arnaudhrt.devtime-local), or build from source:

```sh
npm install
npm run build
```

Then install the generated `.vsix` file, or press `F5` to run in development mode.

## CLI

To visualize your coding time, install the devtime CLI:

```bash
# Mac (Apple Silicon)
mkdir -p ~/.local/bin && curl -sSL https://github.com/arnaudhrt/devtime/releases/latest/download/devtime_darwin_arm64.tar.gz | tar xz -C ~/.local/bin devtime

# From source
go install github.com/arnaudhrt/devtime@latest
```

Then run `devtime` to see today's breakdown, or `devtime all` for your full history.

```
$ devtime

  Today: 4h 23m

  Projects:
    my-app   2h 45m  ██████████████░░░░░░   63%
    devtime  1h 12m  ██████░░░░░░░░░░░░░░   27%
    my-proj  0h 26m  ██░░░░░░░░░░░░░░░░░░   10%

  Languages:
    TypeScript  2h 50m  █████████████░░░░░░░   65%
    Go          1h 07m  █████░░░░░░░░░░░░░░░   26%
    CSS         0h 26m  ██░░░░░░░░░░░░░░░░░░    9%
```

See the full CLI documentation and all available commands at [github.com/arnaudhrt/devtime](https://github.com/arnaudhrt/devtime).

## Data

All data is stored locally in `~/.devtime/` as plain text JSONL files, one per month. Nothing is sent anywhere.
