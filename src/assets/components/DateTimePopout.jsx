import React, { useMemo, useState } from "react";
import "./DateTimePopout.css";

function pad(n) {
  return String(n).padStart(2, "0");
}

function toISODate(d) {
  if (!(d instanceof Date) || isNaN(d.getTime())) {
    return null;
  }
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function DateTimePopout({
  label,
  valueISO, // YYYY-MM-DD
  onChangeISO,
  mode = "date", // "date" | "time"
  valueTime, // "HH:MM"
  onChangeTime,
}) {
  const [open, setOpen] = useState(false);

  const today = new Date();

  const [cursor, setCursor] = useState(() => {
    if (valueISO && typeof valueISO === "string") {
      try {
        const [y, m] = valueISO.split("-").map(Number);
        if (y && m) {
          return new Date(y, (m || 1) - 1, 1);
        }
      } catch (e) {
        console.warn("Invalid valueISO:", valueISO, e);
      }
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  
  // Safe cursor update wrapper
  const safeCursorUpdate = (updater) => {
    setCursor((prev) => {
      if (!(prev instanceof Date) || isNaN(prev.getTime())) {
        prev = new Date(today.getFullYear(), today.getMonth(), 1);
      }
      const next = updater(prev);
      if (!(next instanceof Date) || isNaN(next.getTime())) {
        return new Date(today.getFullYear(), today.getMonth(), 1);
      }
      return next;
    });
  };

  const monthLabel = useMemo(() => {
    let validCursor = cursor;
    if (!(validCursor instanceof Date) || isNaN(validCursor.getTime())) {
      validCursor = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    return validCursor.toLocaleString(undefined, { month: "long", year: "numeric" });
  }, [cursor, today]);

  const calendar = useMemo(() => {
    let validCursor = cursor;
    if (!(validCursor instanceof Date) || isNaN(validCursor.getTime())) {
      validCursor = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    const year = validCursor.getFullYear();
    const month = validCursor.getMonth();
    const first = new Date(year, month, 1);
    const startDow = first.getDay(); // 0..6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(year, month, day));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor, today]);

  const times = useMemo(() => {
    const out = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        out.push(`${pad(h)}:${pad(m)}`);
      }
    }
    return out;
  }, []);

  const displayValue = mode === "date"
    ? (valueISO || "Select date")
    : (valueTime || "Select time");

  return (
    <div className="dtp-wrap">
      <label className="dtp-label">{label}</label>

      <button
        type="button"
        className="dtp-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="dtp-value">{displayValue}</span>
        <span className="dtp-icon">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="dtp-pop">
          {mode === "date" ? (
            <>
              <div className="dtp-head">
                <button
                  type="button"
                  className="dtp-nav"
                  onClick={() =>
                    safeCursorUpdate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
                  }
                >
                  ‹
                </button>
                <div className="dtp-month">{monthLabel}</div>
                <button
                  type="button"
                  className="dtp-nav"
                  onClick={() =>
                    safeCursorUpdate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
                  }
                >
                  ›
                </button>
              </div>

              <div className="dtp-dow">
                {["S","M","T","W","T","F","S"].map((x) => (
                  <div key={x} className="dtp-dow-cell">{x}</div>
                ))}
              </div>

              <div className="dtp-grid">
                {calendar.map((d, idx) => {
                  if (!d) return <div key={idx} className="dtp-cell empty" />;
                  const iso = toISODate(d);
                  if (!iso) return <div key={idx} className="dtp-cell empty" />;
                  const todayISO = toISODate(today);
                  const active = iso === valueISO;
                  const isToday = iso === todayISO;

                  return (
                    <button
                      key={iso}
                      type="button"
                      className={"dtp-cell" + (active ? " active" : "") + (isToday ? " today" : "")}
                      onClick={() => {
                        onChangeISO?.(iso);
                        setOpen(false);
                      }}
                    >
                      {d.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="dtp-foot">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-blue"
                  onClick={() => {
                    const todayISO = toISODate(today);
                    if (todayISO) {
                      onChangeISO?.(todayISO);
                      setOpen(false);
                    }
                  }}
                >
                  Today
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="dtp-head">
                <div className="dtp-month">Pick a time</div>
                <button type="button" className="dtp-x" onClick={() => setOpen(false)}>
                  ✕
                </button>
              </div>

              <div className="dtp-time-list">
                {times.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={"dtp-time" + (t === valueTime ? " active" : "")}
                    onClick={() => {
                      onChangeTime?.(t);
                      setOpen(false);
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
