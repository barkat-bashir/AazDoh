import readline from "readline";
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { spawn, exec, execFile } from "child_process";
import chalk from "chalk";
import notifier from "node-notifier";
import { confirm, select } from "@inquirer/prompts";
import { isConfigured, getConfig } from "../config.js";
import { AazDohApiClient } from "../client.js";
import { printBanner } from "../ui/banner.js";

const TIMER_STATE_FILE = path.join(os.homedir(), ".aazdoh", "timer.json");
const COMPLETED_FOCUS_FILE = path.join(os.homedir(), ".aazdoh", "completed_focus.json");

export interface BackgroundTimerState {
  pid: number;
  taskName: string;
  startTime: string;
  targetEndTime: string;
  totalDurationSeconds: number;
  notify: boolean;
  sound: boolean;
}

export interface CompletedFocusReceipt {
  taskName: string;
  durationSeconds: number;
  completedAt: string;
}

export interface FocusOptions {
  notify?: boolean;
  sound?: boolean;
  live?: boolean;
  popup?: boolean;
  window?: boolean;
}

export function saveCompletedReceipt(receipt: CompletedFocusReceipt): void {
  try {
    const dir = path.dirname(COMPLETED_FOCUS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(COMPLETED_FOCUS_FILE, JSON.stringify(receipt, null, 2), "utf-8");
  } catch {}
}

export function checkAndDisplayCompletedFocus(reprompt: boolean = false): boolean {
  try {
    if (fs.existsSync(COMPLETED_FOCUS_FILE)) {
      const content = fs.readFileSync(COMPLETED_FOCUS_FILE, "utf-8");
      const receipt = JSON.parse(content) as CompletedFocusReceipt;
      fs.unlinkSync(COMPLETED_FOCUS_FILE);

      const timeStr = formatTime(receipt.durationSeconds);
      if (reprompt) {
        readline.cursorTo(process.stdout, 0);
        readline.clearLine(process.stdout, 0);
      }
      console.log("");
      console.log(
        chalk.bgHex("#10B981").hex("#FFFFFF").bold(" 🎉 FOCUS SESSION COMPLETED ") +
        chalk.hex("#E2953B").bold(` "${receipt.taskName}"`) +
        chalk.gray(` (${timeStr}) — Great job!`)
      );
      console.log("");
      if (reprompt) {
        process.stdout.write(chalk.hex("#E2953B").bold("az> "));
      }
      return true;
    }
  } catch {}
  return false;
}

export function getTimerState(): BackgroundTimerState | null {
  try {
    if (fs.existsSync(TIMER_STATE_FILE)) {
      const content = fs.readFileSync(TIMER_STATE_FILE, "utf-8");
      const state = JSON.parse(content) as BackgroundTimerState;
      const endTime = new Date(state.targetEndTime).getTime();
      if (Date.now() < endTime) {
        return state;
      } else {
        clearTimerState();
      }
    }
  } catch {}
  return null;
}

export function saveTimerState(state: BackgroundTimerState): void {
  const dir = path.dirname(TIMER_STATE_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(TIMER_STATE_FILE, JSON.stringify(state, null, 2), "utf-8");
}

export function clearTimerState(): void {
  try {
    if (fs.existsSync(TIMER_STATE_FILE)) {
      fs.unlinkSync(TIMER_STATE_FILE);
    }
  } catch {}
}

function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function parseDurationToSeconds(input?: string): number {
  if (!input || !input.trim()) {
    return 25 * 60;
  }

  const clean = input.trim().toLowerCase();
  
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return Math.max(1, Math.round(parseFloat(clean) * 60));
  }

  const hourMatch = clean.match(/^(\d+(\.\d+)?)\s*(h|hr|hours?)$/);
  if (hourMatch) {
    return Math.max(1, Math.round(parseFloat(hourMatch[1]) * 3600));
  }

  const minMatch = clean.match(/^(\d+(\.\d+)?)\s*(m|min|mins|minutes?)$/);
  if (minMatch) {
    return Math.max(1, Math.round(parseFloat(minMatch[1]) * 60));
  }

  const secMatch = clean.match(/^(\d+(\.\d+)?)\s*(s|sec|secs|seconds?)$/);
  if (secMatch) {
    return Math.max(1, Math.round(parseFloat(secMatch[1])));
  }

  return 25 * 60;
}

function isDurationToken(token: string): boolean {
  return /^\d+(\.\d+)?(h|hr|hours?|m|min|mins|minutes?|s|sec|secs|seconds?)?$/i.test(token.trim());
}

function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function renderProgressBar(percentage: number, width: number = 24): string {
  const clamped = Math.min(100, Math.max(0, percentage));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;

  let barColor = chalk.hex("#E2953B");
  if (clamped >= 90) barColor = chalk.green.bold;
  else if (clamped >= 50) barColor = chalk.hex("#F59E0B");

  return barColor("█".repeat(filled)) + chalk.gray("░".repeat(empty));
}

const BIG_FONT: Record<string, string[]> = {
  "0": ["████", "█  █", "█  █", "█  █", "████"],
  "1": ["  ██", "   █", "   █", "   █", "  ███"],
  "2": ["████", "   █", "████", "█   ", "████"],
  "3": ["████", "   █", "████", "   █", "████"],
  "4": ["█  █", "█  █", "████", "   █", "   █"],
  "5": ["████", "█   ", "████", "   █", "████"],
  "6": ["████", "█   ", "████", "█  █", "████"],
  "7": ["████", "   █", "  █ ", " █  ", " █  "],
  "8": ["████", "█  █", "████", "█  █", "████"],
  "9": ["████", "█  █", "████", "   █", "████"],
  ":": ["    ", " ▄▄ ", "    ", " ▄▄ ", "    "],
  " ": ["    ", "    ", "    ", "    ", "    "],
};

function renderBigClockLines(timeStr: string, isPaused: boolean): string[] {
  const chars = timeStr.split("");
  const lines: string[] = ["", "", "", "", ""];

  for (const ch of chars) {
    const glyph = BIG_FONT[ch] || BIG_FONT[" "];
    for (let row = 0; row < 5; row++) {
      lines[row] += glyph[row] + "  ";
    }
  }

  const colorFn = isPaused ? chalk.hex("#F59E0B").bold : chalk.hex("#E2953B").bold;
  return lines.map((l) => "   " + colorFn(l));
}

/**
 * Generates an ultra-sleek, standalone Kashmir Harud HTML5 Popup Clock
 * with persistent distraction buffer and flexible 1-click commitment harvesting.
 */
export function generatePopupClockHtml(
  taskName: string,
  totalDurationSeconds: number,
  targetEndTimeMs: number,
  apiUrl: string = "https://aazdoh.onrender.com",
  apiKey: string = ""
): string {
  const safeTaskName = taskName.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚡ AazDoh Focus — ${safeTaskName.replace(/"/g, '&quot;')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    body {
      background: #120E0B;
      color: #F5EFEB;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      min-height: 100vh;
      padding: 16px;
      user-select: none;
      overflow-y: auto;
      background-image: radial-gradient(circle at 50% 15%, rgba(226, 149, 59, 0.15), transparent 75%);
    }
    body::-webkit-scrollbar {
      width: 5px;
    }
    body::-webkit-scrollbar-track {
      background: transparent;
    }
    body::-webkit-scrollbar-thumb {
      background: rgba(226, 149, 59, 0.25);
      border-radius: 4px;
    }
    .card {
      background: #1C1510;
      border: 1px solid rgba(226, 149, 59, 0.3);
      border-radius: 20px;
      padding: 20px 16px;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.85), 0 0 40px rgba(226, 149, 59, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
    }
    .brand-icon {
      color: #E2953B;
      font-size: 15px;
    }
    .brand-text {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #E2953B;
    }
    .task-badge {
      background: rgba(226, 149, 59, 0.12);
      border: 1px solid rgba(226, 149, 59, 0.25);
      color: #F5EFEB;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 999px;
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 16px;
      text-align: center;
    }
    .clock-container {
      position: relative;
      width: 190px;
      height: 190px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg.progress-ring {
      transform: rotate(-90deg);
      transform-origin: 50% 50%;
    }
    .ring-bg {
      stroke: rgba(255, 255, 255, 0.05);
    }
    .ring-circle {
      stroke: url(#saffronGrad);
      stroke-linecap: round;
      transition: stroke-dashoffset 0.4s ease;
    }
    .clock-inner {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .time-digits {
      font-size: 40px;
      font-weight: 800;
      letter-spacing: -1px;
      font-variant-numeric: tabular-nums;
      color: #FFFFFF;
      text-shadow: 0 0 25px rgba(226, 149, 59, 0.4);
    }
    .status-tag {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #10B981;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #10B981;
      box-shadow: 0 0 8px #10B981;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
    .controls {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      align-items: center;
      width: 100%;
      justify-content: center;
    }
    .btn {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #F5EFEB;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn:hover {
      background: rgba(226, 149, 59, 0.2);
      border-color: #E2953B;
      transform: translateY(-1px);
    }
    .btn-main {
      background: #E2953B;
      color: #120E0B;
      border: none;
      font-weight: 700;
      padding: 9px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(226, 149, 59, 0.35);
    }
    .btn-main:hover {
      background: #F59E0B;
      box-shadow: 0 6px 20px rgba(226, 149, 59, 0.5);
    }
    
    /* Distraction & Parking Lot UI */
    .distraction-box {
      width: 100%;
      margin-top: 16px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.07);
      border-radius: 14px;
      padding: 10px;
    }
    .distraction-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 12px;
      color: #F5EFEB;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .distraction-input:focus {
      border-color: #E2953B;
      box-shadow: 0 0 10px rgba(226, 149, 59, 0.25);
    }
    .distraction-input::placeholder {
      color: #8C827A;
    }
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 10px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 6px;
      transition: background 0.15s;
    }
    .drawer-header:hover {
      background: rgba(255, 255, 255, 0.04);
    }
    .drawer-title {
      font-size: 11px;
      font-weight: 700;
      color: #8C827A;
      display: flex;
      align-items: center;
      gap: 6px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .count-badge {
      background: rgba(226, 149, 59, 0.2);
      color: #E2953B;
      font-size: 10px;
      padding: 2px 6px;
      border-radius: 999px;
      font-weight: 800;
    }
    .drawer-arrow {
      font-size: 10px;
      color: #8C827A;
      transition: transform 0.2s ease;
    }
    .drawer-arrow.open {
      transform: rotate(180deg);
    }
    .distractions-drawer {
      margin-top: 8px;
      max-height: 200px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-right: 2px;
    }
    .distractions-drawer::-webkit-scrollbar {
      width: 4px;
    }
    .distractions-drawer::-webkit-scrollbar-thumb {
      background: rgba(226, 149, 59, 0.2);
      border-radius: 2px;
    }
    .empty-state {
      font-size: 11px;
      color: #6B625B;
      text-align: center;
      padding: 10px 0 4px 0;
      font-style: italic;
    }
    .distraction-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 8px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      animation: fadeIn 0.2s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .item-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .item-text {
      font-size: 11.5px;
      color: #F5EFEB;
      line-height: 1.35;
      word-break: break-word;
      user-select: text;
    }
    .btn-del {
      background: none;
      border: none;
      color: #8C827A;
      cursor: pointer;
      font-size: 11px;
      padding: 0 2px;
      line-height: 1;
      transition: color 0.15s;
    }
    .btn-del:hover {
      color: #EF4444;
    }
    .item-bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 6px;
      padding-top: 4px;
      border-top: 1px solid rgba(255, 255, 255, 0.04);
    }
    .item-time {
      font-size: 10px;
      color: #8C827A;
    }
    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .action-pill {
      background: rgba(226, 149, 59, 0.1);
      border: 1px solid rgba(226, 149, 59, 0.25);
      color: #E2953B;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .action-pill:hover {
      background: #E2953B;
      color: #120E0B;
    }
    .converted-tag {
      font-size: 10px;
      font-weight: 700;
      color: #10B981;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .custom-date-box {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 4px;
      width: 100%;
    }
    .date-input {
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #F5EFEB;
      font-size: 10px;
      padding: 3px 6px;
      border-radius: 6px;
      outline: none;
      flex: 1;
    }
    .date-input:focus {
      border-color: #E2953B;
    }
    .footer {
      margin-top: 12px;
      font-size: 10.5px;
      color: #8C827A;
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
    
    /* Sleek Floating Toast */
    .toast {
      position: fixed;
      top: 10px;
      left: 50%;
      transform: translateX(-50%) translateY(-35px);
      background: rgba(28, 21, 16, 0.95);
      border: 1px solid #E2953B;
      color: #F5EFEB;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      box-shadow: 0 8px 24px rgba(0,0,0,0.8), 0 0 12px rgba(226, 149, 59, 0.35);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000;
      white-space: nowrap;
      backdrop-filter: blur(10px);
    }
    .toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  </style>
</head>
<body>
  <div id="toast" class="toast">✨ Action confirmed</div>

  <div class="card">
    <div class="brand">
      <span class="brand-icon">⚡</span>
      <span class="brand-text">AazDoh Focus Sprint</span>
    </div>

    <div class="task-badge" id="taskTitle">${safeTaskName}</div>

    <div class="clock-container">
      <svg class="progress-ring" width="190" height="190">
        <defs>
          <linearGradient id="saffronGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E2953B" />
            <stop offset="100%" stop-color="#C05330" />
          </linearGradient>
        </defs>
        <circle class="ring-bg" stroke-width="7" fill="transparent" r="82" cx="95" cy="95" />
        <circle class="ring-circle" id="progressCircle" stroke-width="7" fill="transparent" r="82" cx="95" cy="95" stroke-dasharray="515.22" stroke-dashoffset="0" />
      </svg>
      <div class="clock-inner">
        <div class="time-digits" id="timeDisplay">--:--</div>
        <div class="status-tag" id="statusTag">
          <span class="status-dot" id="statusDot"></span>
          <span id="statusText">FOCUSING</span>
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="btn" onclick="adjustTime(-300)">-5m</button>
      <button class="btn btn-main" id="playPauseBtn" onclick="togglePause()">Pause</button>
      <button class="btn" onclick="adjustTime(300)">+5m</button>
    </div>

    <div class="distraction-box">
      <input type="text" class="distraction-input" id="distractionInput" placeholder="💭 Park stray thought & hit Enter..." onkeydown="handleDistraction(event)" />
      
      <div class="drawer-header" onclick="toggleDrawer()">
        <div class="drawer-title">
          <span>💭 Parked Buffer</span>
          <span class="count-badge" id="distractionCountBadge">0</span>
        </div>
        <span class="drawer-arrow open" id="drawerArrow">▾</span>
      </div>

      <div class="distractions-drawer" id="distractionsDrawer">
        <div id="distractionList"></div>
      </div>
    </div>

    <div class="footer">
      <span id="finishTimeText">Finish: --:--</span>
      <span id="percentText">0% done</span>
    </div>
  </div>

  <script>
    const API_URL = ${JSON.stringify(apiUrl)};
    const API_KEY = ${JSON.stringify(apiKey)};
    const TASK_NAME = ${JSON.stringify(taskName)};
    const STORAGE_KEY = 'aazdoh_distraction_buffer';

    let totalDuration = ${totalDurationSeconds};
    let targetEndTimeMs = ${targetEndTimeMs};
    let isPaused = false;
    let pauseStartedAt = null;
    let isDrawerOpen = true;
    let distractions = [];

    const circle = document.getElementById('progressCircle');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;

    // Toast helper
    function showToast(msg, isWarn = false) {
      const toast = document.getElementById('toast');
      toast.innerText = msg;
      toast.style.borderColor = isWarn ? '#F59E0B' : '#E2953B';
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 2400);
    }

    // Audio chime on completion
    function playChime() {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.12);
          osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
        });
      } catch(e) {}
    }

    function formatTime(secs) {
      const m = Math.floor(secs / 60);
      const s = secs % 60;
      return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function update() {
      const now = Date.now();
      let remaining = isPaused && pauseStartedAt 
        ? Math.max(0, Math.round((targetEndTimeMs - pauseStartedAt) / 1000))
        : Math.max(0, Math.round((targetEndTimeMs - now) / 1000));

      const elapsed = Math.max(0, totalDuration - remaining);
      const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

      document.getElementById('timeDisplay').innerText = formatTime(remaining);
      document.getElementById('percentText').innerText = percent + '% done';
      document.title = formatTime(remaining) + ' — AazDoh Focus';

      const offset = circumference - (percent / 100) * circumference;
      circle.style.strokeDashoffset = offset;

      const finishDate = new Date(targetEndTimeMs);
      document.getElementById('finishTimeText').innerText = 'Finish: ' + finishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (remaining <= 0 && !isPaused) {
        document.getElementById('timeDisplay').innerText = "00:00";
        document.getElementById('statusText').innerText = "COMPLETED";
        document.getElementById('statusTag').style.color = "#E2953B";
        document.getElementById('statusDot').style.background = "#E2953B";
        playChime();
        clearInterval(timer);
        recordTelemetryOnComplete();
      }
    }

    function togglePause() {
      if (!isPaused) {
        isPaused = true;
        pauseStartedAt = Date.now();
        document.getElementById('playPauseBtn').innerText = 'Resume';
        document.getElementById('statusText').innerText = 'PAUSED';
        document.getElementById('statusTag').style.color = '#F59E0B';
        document.getElementById('statusDot').style.background = '#F59E0B';
      } else {
        if (pauseStartedAt) {
          targetEndTimeMs += (Date.now() - pauseStartedAt);
          pauseStartedAt = null;
        }
        isPaused = false;
        document.getElementById('playPauseBtn').innerText = 'Pause';
        document.getElementById('statusText').innerText = 'FOCUSING';
        document.getElementById('statusTag').style.color = '#10B981';
        document.getElementById('statusDot').style.background = '#10B981';
      }
      update();
    }

    function adjustTime(secs) {
      targetEndTimeMs += secs * 1000;
      totalDuration = Math.max(60, totalDuration + secs);
      update();
    }

    // Date Utilities
    function getTodayDateStr() {
      const d = new Date();
      return d.toISOString().split('T')[0];
    }

    function getTomorrowDateStr() {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().split('T')[0];
    }

    function escapeHtml(str) {
      return (str || '')
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Persistence & Buffer Logic
    function loadDistractions() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        distractions = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(distractions)) distractions = [];
      } catch (e) {
        distractions = [];
      }
      renderDistractions();
    }

    function saveDistractions() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(distractions));
      } catch (e) {}
      renderDistractions();
    }

    function toggleDrawer() {
      isDrawerOpen = !isDrawerOpen;
      const drawer = document.getElementById('distractionsDrawer');
      const arrow = document.getElementById('drawerArrow');
      drawer.style.display = isDrawerOpen ? 'flex' : 'none';
      if (isDrawerOpen) {
        arrow.classList.add('open');
      } else {
        arrow.classList.remove('open');
      }
    }

    function renderDistractions() {
      document.getElementById('distractionCountBadge').innerText = distractions.length;
      const container = document.getElementById('distractionList');
      
      if (distractions.length === 0) {
        container.innerHTML = '<div class="empty-state">No parked thoughts yet. Unload your mind here!</div>';
        return;
      }

      const todayStr = getTodayDateStr();
      const tomorrowStr = getTomorrowDateStr();

      container.innerHTML = distractions.map((item) => {
        const timeStr = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const isConverted = item.converted;
        
        return \`
          <div class="distraction-item" id="item_\${item.id}">
            <div class="item-top">
              <span class="item-text">\${escapeHtml(item.text)}</span>
              <button class="btn-del" onclick="deleteDistraction('\${item.id}')" title="Delete">✕</button>
            </div>
            <div class="item-bottom">
              <span class="item-time">\${timeStr}</span>
              \${isConverted ? \`
                <span class="converted-tag">✓ Added to \${item.convertedTarget || 'Plan'} (\${item.convertedDate || ''})</span>
              \` : \`
                <div class="action-group">
                  <button class="action-pill" onclick="convertDistraction('\${item.id}', '\${todayStr}', 'Today')">⚡ Today</button>
                  <button class="action-pill" onclick="convertDistraction('\${item.id}', '\${tomorrowStr}', 'Tomorrow')">📅 Tomorrow</button>
                  <button class="action-pill" onclick="toggleCustomDatePicker('\${item.id}')">🗓️ Pick</button>
                </div>
              \`}
            </div>
            <div class="custom-date-box" id="dateBox_\${item.id}" style="display: none;">
              <input type="date" class="date-input" id="customDate_\${item.id}" value="\${tomorrowStr}" />
              <button class="action-pill" onclick="commitCustomDate('\${item.id}')">Save</button>
            </div>
          </div>
        \`;
      }).join('');
    }

    function handleDistraction(e) {
      if (e.key === 'Enter') {
        const input = document.getElementById('distractionInput');
        const text = input.value.trim();
        if (text) {
          const newDistraction = {
            id: 'd_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            text: text,
            taskName: TASK_NAME,
            createdAt: new Date().toISOString(),
            converted: false,
            convertedDate: null,
            convertedTarget: null
          };
          distractions.unshift(newDistraction);
          saveDistractions();

          input.value = '';
          input.placeholder = '✨ Parked! Added to your distraction buffer.';
          showToast('💭 Thought parked to local buffer');
          setTimeout(() => {
            input.placeholder = '💭 Park another fleeting thought...';
          }, 2200);

          if (!isDrawerOpen) {
            toggleDrawer();
          }
        }
      }
    }

    function deleteDistraction(id) {
      distractions = distractions.filter(d => d.id !== id);
      saveDistractions();
      showToast('🗑️ Thought removed');
    }

    function toggleCustomDatePicker(id) {
      const box = document.getElementById('dateBox_' + id);
      if (box) {
        box.style.display = box.style.display === 'none' ? 'flex' : 'none';
      }
    }

    function commitCustomDate(id) {
      const input = document.getElementById('customDate_' + id);
      if (input && input.value) {
        convertDistraction(id, input.value, input.value);
      }
    }

    async function convertDistraction(id, dateStr, label) {
      const item = distractions.find(d => d.id === id);
      if (!item) return;

      const payload = {
        title: item.text,
        description: 'Captured from AazDoh Focus Sprint: ' + TASK_NAME,
        commitmentDate: dateStr,
        estimatedMinutes: 30,
        priority: 'MEDIUM',
        category: 'DEEP_WORK',
        visibility: 'SHARED_WITH_PARTNER'
      };

      try {
        const headers = { 'Content-Type': 'application/json' };
        if (API_KEY) {
          headers['X-API-Key'] = API_KEY;
          headers['Authorization'] = 'Bearer ' + API_KEY;
        }

        const response = await fetch(API_URL + '/api/v1/commitments', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          item.converted = true;
          item.convertedDate = dateStr;
          item.convertedTarget = label;
          saveDistractions();
          showToast('✨ Commitment scheduled for ' + label + '!');
        } else {
          // If unauthenticated or backend rejects, still mark locally
          item.converted = true;
          item.convertedDate = dateStr;
          item.convertedTarget = label + ' (Local)';
          saveDistractions();
          showToast('⚠️ Saved locally (Log in via CLI to sync)', true);
        }
      } catch (err) {
        item.converted = true;
        item.convertedDate = dateStr;
        item.convertedTarget = label + ' (Offline)';
        saveDistractions();
        showToast('⚠️ Offline: Saved in local buffer', true);
      }
    }

    async function recordTelemetryOnComplete() {
      if (!API_KEY) return;
      try {
        const payload = {
          durationMinutes: Math.round(totalDuration / 60),
          actualSecondsSpent: totalDuration,
          mode: 'FOCUS',
          status: 'COMPLETED',
          distractionsCount: distractions.length,
          distractionNotes: distractions.map(d => d.text),
          startedAt: new Date(Date.now() - totalDuration * 1000).toISOString(),
          completedAt: new Date().toISOString()
        };

        await fetch(API_URL + '/api/v1/focus/record', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': API_KEY,
            'Authorization': 'Bearer ' + API_KEY
          },
          body: JSON.stringify(payload)
        });
      } catch(e) {}
    }

    // Initialize
    loadDistractions();
    const timer = setInterval(update, 500);
    update();
  </script>
</body>
</html>`;
}

/**
 * Launches the floating desktop popup clock window
 */
export function launchPopupClock(
  taskName: string,
  totalDurationSeconds: number,
  targetEndTimeMs: number
): void {
  try {
    const config = getConfig();
    const htmlContent = generatePopupClockHtml(
      taskName,
      totalDurationSeconds,
      targetEndTimeMs,
      config.apiUrl,
      config.apiKey
    );
    const popupFile = path.join(os.homedir(), ".aazdoh", "popup_clock.html");
    const dir = path.dirname(popupFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(popupFile, htmlContent, "utf-8");

    if (process.platform === "win32") {
      const fileUrl = `file:///${popupFile.replace(/\\/g, "/")}`;
      exec(`start msedge --app="${fileUrl}" --window-size=430,720`, (err) => {
        if (err) {
          exec(`start chrome --app="${fileUrl}" --window-size=430,720`, (err2) => {
            if (err2) {
              exec(`start "" "${popupFile}"`);
            }
          });
        }
      });
    } else if (process.platform === "darwin") {
      exec(`open "${popupFile}"`);
    } else {
      exec(`xdg-open "${popupFile}"`);
    }
  } catch (err: any) {
    console.log(chalk.red(`Failed to launch popup clock: ${err.message}`));
  }
}

/**
 * Shows current active timer status (always computed from real wall-clock time)
 */
export function handleFocusStatus(): void {
  checkAndDisplayCompletedFocus();
  const state = getTimerState();
  if (!state) {
    console.log(chalk.gray("   No active background focus timer running."));
    console.log(chalk.gray('   Start one with: ') + chalk.hex("#E2953B")('az focus 25m "Your Task"') + "\n");
    return;
  }

  const endTime = new Date(state.targetEndTime).getTime();
  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.round((endTime - now) / 1000));
  const elapsedSeconds = state.totalDurationSeconds - remainingSeconds;
  const percent = Math.min(100, Math.round((elapsedSeconds / state.totalDurationSeconds) * 100));
  const formattedEndTime = new Date(endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  printBanner();
  console.log(`   ${chalk.bgHex("#C05330").hex("#FFFFFF").bold(" ⏳ ACTIVE FOCUS SESSION ")} ${chalk.hex("#E2953B").bold(state.taskName)}`);
  console.log(`   [${renderProgressBar(percent, 25)}] ${chalk.bold(formatTime(remainingSeconds))} remaining (${percent}%)`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime)}  |  ${chalk.gray("Total:")} ${chalk.cyan(formatTime(state.totalDurationSeconds))}`);
  console.log(chalk.gray(`\n   Run `) + chalk.cyan(`az focus stop`) + chalk.gray(` to cancel.\n`));
}

/**
 * Stops/cancels any active background timer
 */
export function handleFocusStop(): void {
  const state = getTimerState();
  if (!state) {
    console.log(chalk.gray("\n   No active focus timer to stop.\n"));
    return;
  }

  if (state.pid && isProcessAlive(state.pid)) {
    try {
      process.kill(state.pid);
    } catch {}
  }

  clearTimerState();
  console.log(chalk.hex("#8C827A")(`\n   🛑 Focus session cancelled: "${state.taskName}"\n`));
}

/**
 * Dispatches cross-platform desktop notification and system chime with safe async wait
 */
export async function dispatchNotificationAsync(
  title: string,
  message: string,
  sound: boolean = true
): Promise<void> {
  if (sound) {
    if (process.platform === "win32") {
      try {
        const soundCmd = "$files = @('C:\\Windows\\Media\\Alarm01.wav', 'C:\\Windows\\Media\\notify.wav', 'C:\\Windows\\Media\\tada.wav'); $p = $false; foreach ($f in $files) { if (Test-Path $f) { (New-Object Media.SoundPlayer $f).PlaySync(); $p = $true; break; } } if (-not $p) { [System.Media.SystemSounds]::Exclamation.Play(); }";
        execFile(
          "powershell.exe",
          ["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", soundCmd],
          { windowsHide: true },
          () => {}
        );
      } catch {}
    } else if (process.platform === "darwin") {
      try {
        exec("afplay /System/Library/Sounds/Glass.aiff", () => {});
      } catch {}
    } else {
      try {
        process.stdout.write("\u0007");
      } catch {}
    }
  }

  return new Promise<void>((resolve) => {
    let resolved = false;
    const finish = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    const timer = setTimeout(finish, 4000);

    try {
      notifier.notify(
        {
          title,
          message,
          sound: false,
          wait: false,
          appID: "AazDoh Focus",
        },
        () => {
          clearTimeout(timer);
          finish();
        }
      );
    } catch {
      clearTimeout(timer);
      finish();
    }
  });
}

/**
 * Internal background worker entry point with sleep-resilient wall-clock polling
 */
export async function handleFocusWorker(
  seconds: number,
  taskName: string,
  notify: boolean,
  sound: boolean
): Promise<void> {
  const targetEndTimeMs = Date.now() + seconds * 1000;

  while (Date.now() < targetEndTimeMs) {
    const remainingMs = targetEndTimeMs - Date.now();
    const sleepChunk = Math.min(1000, Math.max(100, remainingMs));
    await new Promise((resolve) => setTimeout(resolve, sleepChunk));
  }

  clearTimerState();

  saveCompletedReceipt({
    taskName,
    durationSeconds: seconds,
    completedAt: new Date().toISOString(),
  });

  if (notify) {
    await dispatchNotificationAsync("⚡ AazDoh Focus Completed", `Time's up for: ${taskName}!`, sound);
  }

  process.exit(0);
}

/**
 * Main dispatcher for `aazdoh focus` / `aazdoh timer`
 */
export async function handleFocusCommand(args: string[], options: FocusOptions = {}): Promise<void> {
  const mergedOptions: FocusOptions = { ...options };
  const cleanTokens: string[] = [];

  for (const token of args) {
    const t = token.trim();
    if (t === "--live" || t === "-l" || t.toLowerCase() === "live") {
      mergedOptions.live = true;
    } else if (t === "--popup" || t === "-p" || t === "--window" || t === "-w" || t.toLowerCase() === "popup" || t.toLowerCase() === "window") {
      mergedOptions.popup = true;
    } else if (t === "--no-notify") {
      mergedOptions.notify = false;
    } else if (t === "--no-sound") {
      mergedOptions.sound = false;
    } else if (t) {
      cleanTokens.push(t);
    }
  }

  const firstArg = (cleanTokens[0] || "").toLowerCase().trim();

  if (firstArg === "status") {
    handleFocusStatus();
    return;
  }

  if (firstArg === "stop" || firstArg === "cancel") {
    handleFocusStop();
    return;
  }

  const existing = getTimerState();
  if (existing && !mergedOptions.live && !mergedOptions.popup) {
    const endTime = new Date(existing.targetEndTime).getTime();
    const remainingSeconds = Math.max(0, Math.round((endTime - Date.now()) / 1000));
    console.log(chalk.yellow(`\n   ⚠️  A focus timer is already running in the background:`));
    console.log(`   🎯 ${chalk.hex("#E2953B").bold(existing.taskName)} (${formatTime(remainingSeconds)} remaining)`);
    console.log(chalk.gray(`   Run `) + chalk.cyan(`az focus status`) + chalk.gray(` to inspect or `) + chalk.cyan(`az focus stop`) + chalk.gray(` to cancel.\n`));
    return;
  }

  let durationSeconds = 25 * 60;
  let taskName = "Deep Focus Session";

  if (cleanTokens.length > 0) {
    if (isDurationToken(cleanTokens[0])) {
      durationSeconds = parseDurationToSeconds(cleanTokens[0]);
      if (cleanTokens.length > 1) {
        taskName = cleanTokens.slice(1).join(" ").trim() || taskName;
      }
    } else {
      const durationIndex = cleanTokens.findIndex(isDurationToken);
      if (durationIndex !== -1) {
        durationSeconds = parseDurationToSeconds(cleanTokens[durationIndex]);
        const otherTokens = cleanTokens.filter((_, i) => i !== durationIndex);
        if (otherTokens.length > 0) {
          taskName = otherTokens.join(" ").trim() || taskName;
        }
      } else {
        taskName = cleanTokens.join(" ").trim() || taskName;
      }
    }
  }

  // If popup window requested directly
  if (mergedOptions.popup || mergedOptions.window) {
    const targetEndTimeMs = Date.now() + durationSeconds * 1000;
    launchPopupClock(taskName, durationSeconds, targetEndTimeMs);
    console.log(`   ${chalk.bgHex("#10B981").hex("#FFFFFF").bold(" ⚡ FLOATING CLOCK POPUP OPENED ")} ${chalk.hex("#E2953B").bold(taskName)}`);
    console.log(`   ${chalk.gray("Duration:")} ${chalk.cyan(formatTime(durationSeconds))}  |  ${chalk.gray("A sleek floating focus timer is running on your desktop.")}\n`);
    return;
  }

  // If live mode requested, run the interactive foreground TUI with Big ASCII Clock
  if (mergedOptions.live) {
    await runLiveTimerTUI(durationSeconds, taskName, mergedOptions);
    return;
  }

  // Default: Start in background & free the terminal immediately
  const targetEndTime = new Date(Date.now() + durationSeconds * 1000);
  const formattedEndTime = targetEndTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const entryScript = path.resolve(currentDir, "../index.js");

  const notifyFlag = options.notify !== false ? "1" : "0";
  const soundFlag = options.sound !== false ? "1" : "0";

  const child = spawn(
    process.execPath,
    [entryScript, "__focus_worker", String(durationSeconds), taskName, notifyFlag, soundFlag],
    {
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    }
  );

  child.unref();

  saveTimerState({
    pid: child.pid || 0,
    taskName,
    startTime: new Date().toISOString(),
    targetEndTime: targetEndTime.toISOString(),
    totalDurationSeconds: durationSeconds,
    notify: options.notify !== false,
    sound: options.sound !== false,
  });

  printBanner();
  console.log(`   ${chalk.bgHex("#10B981").hex("#FFFFFF").bold(" ⚡ FOCUS STARTED IN BACKGROUND ")} ${chalk.hex("#E2953B").bold(taskName)}`);
  console.log(`   ${chalk.gray("Target finish:")} ${chalk.hex("#FDFBF7")(formattedEndTime)}  |  ${chalk.gray("Duration:")} ${chalk.cyan(formatTime(durationSeconds))}`);
  console.log(`   ${chalk.gray("🔔 Native desktop notification will alert you when time expires.")}`);
  console.log(
    chalk.gray("\n   💡 Commands: ") +
      chalk.cyan("az focus status") +
      chalk.gray(" (check time)  •  ") +
      chalk.cyan("az focus stop") +
      chalk.gray(" (cancel)  •  ") +
      chalk.cyan("az focus --live") +
      chalk.gray(" (Big ASCII clock)  •  ") +
      chalk.cyan("az focus --popup") +
      chalk.gray(" (floating popout)\n")
  );
}

/**
 * Interactive Live TUI with Big ASCII Digital Clock and Popup Hotkey
 */
async function runLiveTimerTUI(
  durationSeconds: number,
  taskName: string,
  options: FocusOptions
): Promise<void> {
  let totalDuration = durationSeconds;
  let targetEndTimeMs = Date.now() + durationSeconds * 1000;
  let isPaused = false;
  let pauseStartedAt: number | null = null;
  let timerInterval: NodeJS.Timeout | null = null;

  console.clear();
  printBanner();

  process.stdout.write("\u001B[?25l"); // Hide cursor

  let keyListener: ((key: string) => void) | null = null;

  const cleanup = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    process.stdout.write("\u001B[?25h"); // Show cursor
    if (keyListener) {
      process.stdin.removeListener("data", keyListener);
      keyListener = null;
    }
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(false);
    }
    if (process.stdin.isPaused()) {
      process.stdin.resume();
    }
  };

  const getRemainingSeconds = (): number => {
    if (isPaused && pauseStartedAt) {
      return Math.max(0, Math.round((targetEndTimeMs - pauseStartedAt) / 1000));
    }
    return Math.max(0, Math.round((targetEndTimeMs - Date.now()) / 1000));
  };

  const renderTimerFrame = () => {
    const remainingSeconds = getRemainingSeconds();
    const elapsed = Math.max(0, totalDuration - remainingSeconds);
    const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));
    const progressBar = renderProgressBar(percent, 28);
    const timeFormatted = formatTime(remainingSeconds);

    const statusBadge = isPaused
      ? chalk.bgHex("#F59E0B").hex("#1A0E08").bold(" ⏸ PAUSED ")
      : chalk.bgHex("#10B981").hex("#FFFFFF").bold(" ▶ FOCUSING ");

    const finishFormatted = new Date(targetEndTimeMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    readline.cursorTo(process.stdout, 0, 8);
    readline.clearScreenDown(process.stdout);

    console.log(`   ${statusBadge}  ${chalk.hex("#E2953B").bold(taskName)}  ${chalk.gray(`[Target: ${finishFormatted}]`)}`);
    console.log("");

    const bigLines = renderBigClockLines(timeFormatted, isPaused);
    for (const line of bigLines) {
      console.log(line);
    }

    console.log("");
    console.log(`   [${progressBar}] ${chalk.bold(timeFormatted)} (${percent}%)`);
    console.log("");
    console.log(
      chalk.gray("   Controls: ") +
      chalk.cyan("[Space]") + chalk.gray(" Pause/Resume  ") +
      chalk.cyan("[+]") + chalk.gray(" +5m  ") +
      chalk.cyan("[-]") + chalk.gray(" -5m  ") +
      chalk.cyan("[w/p]") + chalk.hex("#E2953B")(" Popout Window  ") +
      chalk.cyan("[q]") + chalk.gray(" Stop & Exit")
    );
  };

  return new Promise<void>((resolve) => {
    if (process.stdin.isTTY && process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.setEncoding("utf8");

      keyListener = (key: string) => {
        if (key === "\u0003" || key === "q" || key === "Q") {
          cleanup();
          console.log(`\n   ${chalk.hex("#8C827A")("🛑 Focus session stopped.")}\n`);
          resolve();
          return;
        }

        if (key === " " || (key === "p" && isPaused)) {
          if (!isPaused) {
            isPaused = true;
            pauseStartedAt = Date.now();
          } else {
            if (pauseStartedAt) {
              const pausedDurationMs = Date.now() - pauseStartedAt;
              targetEndTimeMs += pausedDurationMs;
              pauseStartedAt = null;
            }
            isPaused = false;
          }
          renderTimerFrame();
          return;
        }

        if (key === "w" || key === "W" || key === "o" || key === "O" || (key === "p" && !isPaused)) {
          launchPopupClock(taskName, totalDuration, targetEndTimeMs);
          renderTimerFrame();
          console.log(`\n   ${chalk.green("✨ Opened sleek floating clock popup window!")}`);
          return;
        }

        if (key === "+" || key === "=") {
          targetEndTimeMs += 5 * 60 * 1000;
          totalDuration += 5 * 60;
          renderTimerFrame();
          return;
        }

        if (key === "-" || key === "_") {
          const remaining = getRemainingSeconds();
          if (remaining > 5 * 60) {
            targetEndTimeMs -= 5 * 60 * 1000;
            totalDuration = Math.max(300, totalDuration - 5 * 60);
          }
          renderTimerFrame();
          return;
        }
      };

      process.stdin.on("data", keyListener);
    }

    renderTimerFrame();

    timerInterval = setInterval(async () => {
      if (!isPaused) {
        const remainingSeconds = getRemainingSeconds();
        renderTimerFrame();

        if (remainingSeconds <= 0) {
          cleanup();
          process.stdout.write("\u0007");

          console.log(`\n   ${chalk.bgGreen.black.bold(" 🎉 TIME'S UP! ")} ${chalk.green.bold("Great focus session completed!")}`);
          console.log(`   ${chalk.gray("Completed:")} ${chalk.hex("#E2953B").bold(taskName)} (${formatTime(totalDuration)})\n`);

          if (options.notify !== false) {
            await dispatchNotificationAsync("⚡ AazDoh Focus Completed", `Time's up for: ${taskName}!`, options.sound !== false);
          }

          if (isConfigured()) {
            try {
              const shouldSync = await confirm({
                message: "Would you like to mark a commitment as completed in AazDoh?",
                default: false,
              });

              if (shouldSync) {
                const client = new AazDohApiClient();
                const todayCommitments = await client.getTodayCommitments();
                const pending = todayCommitments.filter((c: any) => c.status === "PENDING" || c.status === "IN_PROGRESS");

                if (pending.length === 0) {
                  console.log(chalk.gray("   No pending commitments found for today."));
                } else {
                  const selectedId = await select({
                    message: "Select the commitment to complete:",
                    choices: pending.map((c: any) => ({
                      name: `${c.title} (${c.estimatedMinutes}m) [${c.priority}]`,
                      value: c.id,
                    })),
                  });

                  if (selectedId) {
                    await client.completeCommitment(selectedId, { notes: `Completed in ${Math.round(totalDuration / 60)}m focus timer.` });
                    console.log(chalk.green("   ✅ Commitment marked as completed in AazDoh!\n"));
                  }
                }
              }
            } catch {}
          }

          resolve();
        }
      }
    }, 1000);
  });
}
