import React from "react";
import { useLocation } from "react-router-dom";

export default function AlphaRouteChip() {
  const { pathname } = useLocation();
  const isAlpha = import.meta.env.VITE_ALPHA === "1";
  if (!isAlpha) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        zIndex: 60,
        padding: ".38rem .6rem",
        borderRadius: 999,
        fontSize: ".7rem",
        fontWeight: 900,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        background: "rgba(8,12,24,.55)",
        border: "1px solid rgba(126,224,255,.18)",
        color: "rgba(244,246,255,.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      title="Alpha-only route indicator"
    >
      ALPHA · {pathname.replace("/app", "") || "/"}
    </div>
  );
}
