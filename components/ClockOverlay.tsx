"use client";

import { useEffect, useState } from "react";
import { ClockFormat } from "@/lib/types";

interface ClockOverlayProps {
  show: boolean;
  format: ClockFormat;
  textColor?: string;
}

export default function ClockOverlay({
  show,
  format,
  textColor = "#ffffff",
}: ClockOverlayProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [dateStr, setDateStr] = useState<string>("");

  useEffect(() => {
    if (!show) return;

    const updateClock = () => {
      const now = new Date();

      const timeFormatted = now.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
        second: undefined,
        hour12: format === "12h",
      });

      const dateFormatted = now.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      setTimeStr(timeFormatted);
      setDateStr(dateFormatted);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [show, format]);

  if (!show || !timeStr) return null;

  return (
    <div
      aria-label="Current time and date"
      className="pointer-events-none fixed top-6 left-8 z-30 flex flex-col items-start select-none opacity-80 backdrop-blur-xs transition-opacity duration-500"
      style={{ color: textColor }}
    >
      <span className="font-mono text-2xl font-light tracking-wider drop-shadow-sm sm:text-3xl">
        {timeStr}
      </span>
      <span className="text-xs uppercase tracking-widest opacity-60 drop-shadow-sm">
        {dateStr}
      </span>
    </div>
  );
}
