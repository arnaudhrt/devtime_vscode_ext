import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

const HEARTBEAT_INTERVAL = 30_000;
const DEVTIME_DIR = path.join(os.homedir(), ".devtime");

let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
let lastHeartbeatTs = 0;

function getProject(): string {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return "unknown";
  return folders[0].name;
}

const LANGUAGE_NORMALIZE: Record<string, string> = {
  "go.mod": "go",
  "go.sum": "go",
  "go.work": "go",
  "go.asm": "go",
  "gotmpl": "go",
};

function getLanguage(): string {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return "unknown";
  const id = editor.document.languageId;
  return LANGUAGE_NORMALIZE[id] ?? id;
}

function hasContext(): boolean {
  return getProject() !== "unknown" && getLanguage() !== "unknown";
}

function localISOString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const offsetMin = -date.getTimezoneOffset();
  const sign = offsetMin >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMin);
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`
  );
}

function writeEvent(eventType: "heartbeat" | "focus" | "blur"): void {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `events-${yyyy}-${mm}.jsonl`;

  const line = JSON.stringify({
    ts: localISOString(now),
    event: eventType,
    project: getProject(),
    lang: getLanguage(),
    editor: "vscode",
  });

  try {
    fs.mkdirSync(DEVTIME_DIR, { recursive: true });
    fs.appendFileSync(path.join(DEVTIME_DIR, filename), line + "\n");
  } catch (err) {
    console.error("devtime: failed to write event", err);
  }
}

function sendHeartbeat(): void {
  const now = Date.now();
  if (now - lastHeartbeatTs < HEARTBEAT_INTERVAL) return;
  if (vscode.window.activeTextEditor && hasContext()) {
    lastHeartbeatTs = now;
    writeEvent("heartbeat");
  }
}

function startHeartbeat(): void {
  stopHeartbeat();
  heartbeatTimer = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
}

function stopHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = undefined;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("devtime: activated");

  if (hasContext()) {
    writeEvent("focus");
  }
  startHeartbeat();

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => sendHeartbeat()),
  );

  context.subscriptions.push(
    vscode.window.onDidChangeWindowState((state) => {
      if (state.focused) {
        if (hasContext()) {
          writeEvent("focus");
        }
        startHeartbeat();
      } else {
        if (hasContext()) {
          writeEvent("blur");
        }
        stopHeartbeat();
      }
    }),
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(() => sendHeartbeat()),
  );
}

export function deactivate(): void {
  if (hasContext()) {
    writeEvent("blur");
  }
  stopHeartbeat();
  console.log("devtime: deactivated");
}
