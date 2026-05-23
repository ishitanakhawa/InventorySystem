"use client";

import { useEffect, useRef, useCallback } from "react";

export function usePolling(callback, intervalMs = 5000, enabled = true) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const tick = useCallback(() => {
    savedCallback.current?.();
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled, tick]);
}
