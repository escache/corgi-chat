"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useActivityDataChannel } from "./use-activity-data-channel";
import type { ActivityProps } from "@corgi-chat/core";

const STROKE_WIDTH = 5;
const COLORS = ["#a78bfa", "#34d399", "#f472b6", "#38bdf8", "#fbbf24"];

interface StrokePoint {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  color: string;
}

function colorForUser(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i) * (i + 1)) % COLORS.length;
  }
  return COLORS[hash] ?? COLORS[0];
}

export function DrawActivity({ userId }: ActivityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const drawingRef = useRef(false);
  const currentRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<Record<string, StrokePoint[]>>({});
  const opacitiesRef = useRef<Record<string, number>>({});
  const fadeTimersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const [color] = useState(() => colorForUser(userId));

  const drawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    Object.entries(pointsRef.current).forEach(([id, points]) => {
      const opacity = opacitiesRef.current[id] ?? 1;
      for (const point of points) {
        context.beginPath();
        context.moveTo(point.x0, point.y0);
        context.lineTo(point.x1, point.y1);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.strokeStyle = point.color;
        context.globalAlpha = Math.max(opacity, 0);
        context.lineWidth = STROKE_WIDTH;
        context.stroke();
        context.closePath();
      }
    });
    context.globalAlpha = 1;
  }, []);

  const startFade = useCallback(
    (id: string) => {
      if (fadeTimersRef.current[id]) {
        clearInterval(fadeTimersRef.current[id]);
      }
      opacitiesRef.current[id] = 1;
      fadeTimersRef.current[id] = setInterval(() => {
        opacitiesRef.current[id] = (opacitiesRef.current[id] ?? 1) - 0.025;
        if ((opacitiesRef.current[id] ?? 0) <= 0) {
          clearInterval(fadeTimersRef.current[id]);
          delete fadeTimersRef.current[id];
          pointsRef.current[id] = [];
          opacitiesRef.current[id] = 1;
        }
        drawAll();
      }, 100);
    },
    [drawAll],
  );

  const addStroke = useCallback(
    (id: string, point: StrokePoint, normalized: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const stroke = normalized
        ? {
            ...point,
            x0: point.x0 * canvas.width,
            y0: point.y0 * canvas.height,
            x1: point.x1 * canvas.width,
            y1: point.y1 * canvas.height,
          }
        : point;

      pointsRef.current[id] = [...(pointsRef.current[id] ?? []), stroke];
      opacitiesRef.current[id] = 1;
      startFade(id);
      drawAll();
    },
    [drawAll, startFade],
  );

  const { publish } = useActivityDataChannel("draw", userId, (message) => {
    const payload = message.payload as {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      color: string;
    };
    if (message.type !== "stroke") {
      return;
    }
    addStroke(message.userId, { ...payload }, true);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) {
      return;
    }

    const resize = () => {
      canvas.width = wrapper.offsetWidth;
      canvas.height = wrapper.offsetHeight;
      drawAll();
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [drawAll]);

  useEffect(() => {
    return () => {
      Object.values(fadeTimersRef.current).forEach((timer) => clearInterval(timer));
    };
  }, []);

  const publishStroke = (point: StrokePoint) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    addStroke(userId, point, false);
    publish("stroke", {
      x0: point.x0 / canvas.width,
      y0: point.y0 / canvas.height,
      x1: point.x1 / canvas.width,
      y1: point.y1 / canvas.height,
      color: point.color,
    });
  };

  return (
    <div className="flex h-full min-h-[240px] flex-col bg-slate-950">
      <div className="border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
        Draw together — strokes sync live over LiveKit
      </div>
      <div ref={wrapperRef} className="relative min-h-0 flex-1 touch-none">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-crosshair"
          onPointerDown={(event) => {
            const canvas = canvasRef.current;
            if (!canvas) {
              return;
            }
            const rect = canvas.getBoundingClientRect();
            drawingRef.current = true;
            currentRef.current = {
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            };
            canvas.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!drawingRef.current) {
              return;
            }
            const canvas = canvasRef.current;
            if (!canvas) {
              return;
            }
            const rect = canvas.getBoundingClientRect();
            const next = {
              x: event.clientX - rect.left,
              y: event.clientY - rect.top,
            };
            publishStroke({
              x0: currentRef.current.x,
              y0: currentRef.current.y,
              x1: next.x,
              y1: next.y,
              color,
            });
            currentRef.current = next;
          }}
          onPointerUp={(event) => {
            drawingRef.current = false;
            canvasRef.current?.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
          }}
        />
      </div>
    </div>
  );
}
