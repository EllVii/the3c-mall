import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * One-screen horizontal pager (app feel).
 * - no vertical scrolling
 * - swipe left/right
 * - also supports dots + programmatic jump
 */
export default function ScreenPager({ pages, initialIndex = 0, onIndexChange }) {
  const wrapRef = useRef(null);
  const [idx, setIdx] = useState(initialIndex);

  useEffect(() => { onIndexChange?.(idx); }, [idx, onIndexChange]);

  // swipe
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let isDown = false;

    function onDown(e) {
      isDown = true;
      const p = e.touches?.[0] || e;
      startX = p.clientX;
      startY = p.clientY;
    }

    function onMove(e) {
      if (!isDown) return;
      const p = e.touches?.[0] || e;
      const dx = p.clientX - startX;
      const dy = p.clientY - startY;

      // ignore vertical gesture
      if (Math.abs(dy) > Math.abs(dx)) return;

      // prevent the browser from trying to scroll
      e.preventDefault?.();
    }

    function onUp(e) {
      if (!isDown) return;
      isDown = false;
      const p = e.changedTouches?.[0] || e;
      const dx = p.clientX - startX;

      if (dx < -60 && idx < pages.length - 1) setIdx((v) => v + 1);
      if (dx > 60 && idx > 0) setIdx((v) => v - 1);
    }

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointermove", onMove, { passive: false });

    el.addEventListener("touchstart", onDown, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onUp, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointermove", onMove);

      el.removeEventListener("touchstart", onDown);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onUp);
    };
  }, [idx, pages.length]);

  const trackStyle = useMemo(
    () => ({ transform: `translateX(${-idx * 100}%)` }),
    [idx]
  );

  return (
    <div className="pager" ref={wrapRef}>
      <div className="pager-track" style={trackStyle}>
        {pages.map((p) => (
          <div className="pager-page" key={p.key}>
            {p.node}
          </div>
        ))}
      </div>

      <div className="pager-dots">
        {pages.map((p, i) => (
          <button
            key={p.key}
            className={"pager-dot " + (i === idx ? "active" : "")}
            onClick={() => setIdx(i)}
            aria-label={`Go to ${p.key}`}
          />
        ))}
      </div>
    </div>
  );
}
