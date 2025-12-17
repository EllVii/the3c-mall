import React, { useEffect, useMemo, useState } from "react";

const KEY = "3c.fast.v1";

function nowMs() {
  return Date.now();
}

function msToParts(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return { h, m, s };
}

function pad(n) {
  return String(n).padStart(2, "0");
}

export default function FastingTimer() {
  const [mode, setMode] = useState("fast"); // fast | eat
  const [isRunning, setIsRunning] = useState(false);
  const [startAt, setStartAt] = useState(null); // ms
  const [durationHrs, setDurationHrs] = useState(16);
  const [tick, setTick] = useState(0);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      setMode(saved.mode ?? "fast");
      setIsRunning(!!saved.isRunning);
      setStartAt(saved.startAt ?? null);
      setDurationHrs(saved.durationHrs ?? 16);
    } catch {
      // ignore
    }
  }, []);

  // Persist state
  useEffect(() => {
    const payload = { mode, isRunning, startAt, durationHrs };
    try {
      localStorage.setItem(KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }, [mode, isRunning, startAt, durationHrs]);

  // Tick
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  const durationMs = useMemo(() => durationHrs * 3600 * 1000, [durationHrs]);

  const elapsedMs = useMemo(() => {
    if (!isRunning || !startAt) return 0;
    return nowMs() - startAt;
  }, [isRunning, startAt, tick]);

  const remainingMs = useMemo(() => {
    if (!isRunning || !startAt) return durationMs;
    return Math.max(0, durationMs - elapsedMs);
  }, [durationMs, elapsedMs, isRunning, startAt]);

  const progress = useMemo(() => {
    if (!isRunning || !startAt) return 0;
    const p = Math.min(1, elapsedMs / durationMs);
    return Number.isFinite(p) ? p : 0;
  }, [elapsedMs, durationMs, isRunning, startAt]);

  const parts = msToParts(remainingMs);

  function start() {
    setStartAt(nowMs());
    setIsRunning(true);
  }

  function pause() {
    // keep elapsed by shifting startAt forward
    if (!startAt) return;
    const elapsed = nowMs() - startAt;
    const newStartAt = nowMs() - elapsed;
    setStartAt(newStartAt);
    setIsRunning(false);
  }

  function resume() {
    if (!startAt) setStartAt(nowMs());
    setIsRunning(true);
  }

  function reset() {
    setIsRunning(false);
    setStartAt(null);
  }

  const statusLabel =
    mode === "fast"
      ? "Fasting Window"
      : "Eating Window";

  const done = isRunning && remainingMs === 0;

  return (
    <div className="ft-card">
      <div className="ft-top">
        <div>
          <div className="card-tag">Metabolic</div>
          <div className="ft-title">{statusLabel}</div>
          <div className="ft-sub">
            Set your window, press start, and the timer survives refresh.
          </div>
        </div>

        <div className={"ft-pill " + (done ? "ft-pill-done" : "")}>
          <span>Status</span>
          <strong>{done ? "Complete" : isRunning ? "Running" : "Ready"}</strong>
        </div>
      </div>

      <div className="ft-controls">
        <div className="ft-mode">
          <button
            className={"btn " + (mode === "fast" ? "btn-primary" : "btn-secondary")}
            onClick={() => setMode("fast")}
          >
            Fast
          </button>
          <button
            className={"btn " + (mode === "eat" ? "btn-primary" : "btn-secondary")}
            onClick={() => setMode("eat")}
          >
            Eat
          </button>
        </div>

        <div className="ft-presets">
          {[12, 14, 16, 18, 20, 24].map((h) => (
            <button
              key={h}
              className={"btn " + (durationHrs === h ? "btn-primary" : "btn-secondary")}
              onClick={() => setDurationHrs(h)}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      <div className="ft-timer">
        <div className="ft-time">
          {pad(parts.h)}:{pad(parts.m)}:{pad(parts.s)}
        </div>
        <div className="ft-bar">
          <div className="ft-bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <div className="ft-hint small">
          {done
            ? "Window complete. Reset or start a new one."
            : isRunning
              ? "Running now. You can pause or reset."
              : "Choose a window and press Start."}
        </div>
      </div>

      <div className="nav-row">
        {!isRunning && !startAt && (
          <button className="btn btn-primary" onClick={start}>
            Start
          </button>
        )}

        {!isRunning && startAt && (
          <button className="btn btn-primary" onClick={resume}>
            Resume
          </button>
        )}

        {isRunning && (
          <button className="btn btn-secondary" onClick={pause}>
            Pause
          </button>
        )}

        <button className="btn btn-ghost" onClick={reset}>
          Reset
        </button>
      </div>
    </div>
  );
}
