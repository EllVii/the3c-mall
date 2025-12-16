import { useEffect, useMemo, useState } from "react";
import { applyThemeToDom, getSettings, setSettings } from "./store.js";

export function useSettings() {
  const [settings, setLocal] = useState(() => getSettings());

  useEffect(() => {
    applyThemeToDom(settings.theme);
    setSettings(settings);
  }, [settings]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === "3c-settings") {
        setLocal(getSettings());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const api = useMemo(() => {
    return {
      settings,
      updateSettings: (patch) => setLocal((prev) => ({ ...prev, ...patch })),
      resetSettings: () => setLocal(getSettings(true)),
    };
  }, [settings]);

  return api;
}
