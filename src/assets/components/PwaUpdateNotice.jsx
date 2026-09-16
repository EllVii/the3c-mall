import React, { useEffect, useState } from "react";
import "./PwaUpdateNotice.css";

const UPDATE_READY_EVENT = "3c:pwa-update-ready";
const APPLY_UPDATE_EVENT = "3c:pwa-apply-update";

export default function PwaUpdateNotice() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    const handleUpdateReady = () => setUpdateReady(true);
    window.addEventListener(UPDATE_READY_EVENT, handleUpdateReady);
    return () => window.removeEventListener(UPDATE_READY_EVENT, handleUpdateReady);
  }, []);

  if (!updateReady) return null;

  return (
    <aside className="pwa-update-notice" role="status" aria-live="polite">
      <div>
        <strong>3C Mall update ready</strong>
        <span>Finish what you’re doing, then refresh when you’re ready.</span>
      </div>
      <div className="pwa-update-actions">
        <button
          type="button"
          className="pwa-update-later"
          onClick={() => setUpdateReady(false)}
        >
          Later
        </button>
        <button
          type="button"
          className="pwa-update-now"
          onClick={() => window.dispatchEvent(new Event(APPLY_UPDATE_EVENT))}
        >
          Update now
        </button>
      </div>
    </aside>
  );
}
