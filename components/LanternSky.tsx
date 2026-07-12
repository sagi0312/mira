"use client";

import { useEffect, useRef } from "react";

export type LanternPhase = "resting" | "noticing" | "warm";

/** how long the light takes to warm after a click; camera settle time */
export const NOTICING_DURATION_MS = 3000;

interface LanternSkyProps {
  phase: LanternPhase;
}

interface Star {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  offset: number;
}

function ease(t: number): number {
  return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
}

export const LanternSky = ({ phase }: LanternSkyProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef<LanternPhase>(phase);
  const phaseStartRef = useRef<number>(0);

  useEffect(() => {
    if (phaseRef.current !== phase) {
      phaseRef.current = phase;
      phaseStartRef.current = performance.now();
    }
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;
    let rafId = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth;
      H = canvas.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const stars: Star[] = Array.from({ length: 120 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.3 + Math.random() * 0.9,
      base: 0.06 + Math.random() * 0.24,
      speed: 0.5 + Math.random() * 0.7,
      offset: Math.random() * Math.PI * 2,
    }));

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const draw = (now: number) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, W, H);

      // midnight-blue sky
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#060a16");
      g.addColorStop(1, "#101736");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      // glittering stars
      for (const s of stars) {
        const tw = reduced
          ? s.base
          : s.base + Math.sin(t * s.speed + s.offset) * s.base * 0.5;
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(195, 208, 233, ${tw})`;
        ctx.fill();
      }

      let progress = 0;
      if (phaseRef.current === "noticing") {
        progress = ease((now - phaseStartRef.current) / NOTICING_DURATION_MS);
      } else if (phaseRef.current === "warm") {
        progress = 1;
      }

      // the light: one breathing glow at center, warming with progress
      const breathe = reduced ? 0.5 : Math.sin(t * 1.3) * 0.5 + 0.5;
      const cx = W / 2;
      const cy = H * 0.4;

      const r1 = Math.round(214 + progress * 41);
      const g1 = Math.round(226 - progress * 24);
      const b1 = Math.round(240 - progress * 100);

      const haloR = 90 + breathe * 45 + progress * 130;
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
      halo.addColorStop(
        0,
        `rgba(${r1}, ${g1}, ${b1}, ${0.13 + breathe * 0.06 + progress * 0.1})`,
      );
      halo.addColorStop(
        0.4,
        `rgba(${r1}, ${g1}, ${b1}, ${0.05 + progress * 0.04})`,
      );
      halo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(cx - haloR, cy - haloR, haloR * 2, haloR * 2);

      const coreR = (3.5 + breathe * 2.5 + progress * 5) * 6;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, `rgba(255, 255, 255, ${0.85 + progress * 0.1})`);
      core.addColorStop(0.25, `rgba(${r1}, ${g1}, ${b1}, 0.5)`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
};
