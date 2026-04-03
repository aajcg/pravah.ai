"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

const PARTICLE_COUNT = 38;

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId = 0;
    const particles: Particle[] = [];

    const init = () => {
      particles.length = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.8 + 0.6,
          alpha: Math.random() * 0.45 + 0.1,
        });
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    // Also draw the river-flow canvas lines matching script.js
    const lines: {
      y: number;
      phase: number;
      speed: number;
      amp: number;
      freq: number;
      alpha: number;
      color: string;
    }[] = [];

    const initLines = () => {
      lines.length = 0;
      for (let i = 0; i < 6; i++) {
        lines.push({
          y: canvas.height * (0.1 + i * 0.16),
          phase: Math.random() * Math.PI * 2,
          speed: 0.0008 + Math.random() * 0.0005,
          amp: 30 + Math.random() * 50,
          freq: 0.003 + Math.random() * 0.002,
          alpha: 0.05 + Math.random() * 0.08,
          color: i % 2 === 0 ? "212,164,76" : "42,157,143",
        });
      }
    };

    let t0: number | null = null;

    const draw = (ts: number) => {
      if (!t0) t0 = ts;
      const t = (ts - t0) * 0.001;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // River lines
      lines.forEach((l) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${l.color},${l.alpha})`;
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 4) {
          const y = l.y + Math.sin(x * l.freq + t * l.speed * 1000 + l.phase) * l.amp;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      });

      // Particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,164,76,${p.alpha})`;
        ctx.fill();
      }

      // Connection lines between particles
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            const opacity = (1 - dist / 130) * 0.15;
            ctx.strokeStyle = `rgba(212,164,76,${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      frameId = requestAnimationFrame(draw);
    };

    resize();
    initLines();
    frameId = requestAnimationFrame(draw);

    window.addEventListener("resize", () => {
      resize();
      initLines();
    });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}