"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export interface DraggableSplitProps {
  left: ReactNode;
  right: ReactNode;
  /** Percent width of the left pane (0–100). */
  defaultLeftPercent?: number;
  minLeftPercent?: number;
  maxLeftPercent?: number;
  className?: string;
}

export function DraggableSplit({
  left,
  right,
  defaultLeftPercent = 55,
  minLeftPercent = 25,
  maxLeftPercent = 75,
  className,
}: DraggableSplitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftPercent, setLeftPercent] = useState(defaultLeftPercent);
  const draggingRef = useRef(false);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      if (!draggingRef.current || !containerRef.current) {
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();
      const next = ((event.clientX - rect.left) / rect.width) * 100;
      setLeftPercent(Math.min(maxLeftPercent, Math.max(minLeftPercent, next)));
    },
    [maxLeftPercent, minLeftPercent],
  );

  const stopDragging = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", stopDragging);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopDragging);
    };
  }, [onPointerMove, stopDragging]);

  return (
    <div ref={containerRef} className={`flex h-full min-h-0 w-full ${className ?? ""}`}>
      <div className="min-h-0 min-w-0 overflow-hidden" style={{ width: `${leftPercent}%` }}>
        {left}
      </div>
      <button
        type="button"
        aria-label="Resize panes"
        className="w-1.5 shrink-0 cursor-col-resize bg-slate-800 hover:bg-violet-500"
        onPointerDown={() => {
          draggingRef.current = true;
        }}
      />
      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">{right}</div>
    </div>
  );
}
