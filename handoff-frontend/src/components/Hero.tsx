"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { playUiClick } from "@/lib/sound";
import { useHandoffStore } from "@/store/use-handoff-store";

// Simple floating nodes — kept but restyled with gold/teal palette
function FloatingNodes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes = Array.from({ length: 6 }, (_, i) => ({
      x: (canvas.width * (i + 0.8)) / 7,
      y: canvas.height * (0.3 + (i % 3) * 0.22),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 5 + (i % 2) * 3,
      color: i % 2 === 0 ? "212,164,76" : "42,157,143",
    }));

    // Travelling packet
    let packetT = 0;

    let frameId = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Lines between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const op = (1 - dist / 200) * 0.3;
            ctx.strokeStyle = `rgba(212,164,76,${op})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 10 || n.x > canvas.width - 10) n.vx *= -1;
        if (n.y < 10 || n.y > canvas.height - 10) n.vy *= -1;

        // Glow
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        grad.addColorStop(0, `rgba(${n.color},0.3)`);
        grad.addColorStop(1, `rgba(${n.color},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${n.color},0.9)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Travelling packet along path
      packetT = (packetT + 0.004) % 1;
      const idx = Math.floor(packetT * (nodes.length - 1));
      const local = (packetT * (nodes.length - 1)) - idx;
      const pA = nodes[Math.min(idx, nodes.length - 1)];
      const pB = nodes[Math.min(idx + 1, nodes.length - 1)];
      const px = pA.x + (pB.x - pA.x) * local;
      const py = pA.y + (pB.y - pA.y) * local;

      // Packet glow
      const pg = ctx.createRadialGradient(px, py, 0, px, py, 12);
      pg.addColorStop(0, "rgba(212,164,76,0.5)");
      pg.addColorStop(1, "rgba(212,164,76,0)");
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#d4a44c";
      ctx.beginPath();
      ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fill();

      frameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

export default function Hero() {
  const soundEnabled = useHandoffStore((state) => state.soundEnabled);
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 900], [0, -52]);
  const contentOpacity = useTransform(scrollY, [0, 960], [1, 0.84]);
  const orb1Y = useTransform(scrollY, [0, 950], [0, -120]);
  const orb2Y = useTransform(scrollY, [0, 950], [0, 90]);
  const orb3Y = useTransform(scrollY, [0, 950], [0, -68]);
  const panelY = useTransform(scrollY, [0, 900], [0, -86]);
  const cueY = useTransform(scrollY, [0, 900], [0, 28]);

  const onTryDemo = () => {
    playUiClick(soundEnabled);
    document.getElementById("pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Counter animation
  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>("[data-count]");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || (e.target as HTMLElement).dataset.done) return;
          (e.target as HTMLElement).dataset.done = "1";
          const target = parseInt((e.target as HTMLElement).dataset.count || "0");
          let c = 0;
          const inc = target / 45;
          const tm = setInterval(() => {
            c = Math.min(c + inc, target);
            (e.target as HTMLElement).textContent = Math.round(c).toLocaleString("en-IN");
            if (c >= target) clearInterval(tm);
          }, 25);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="hero"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "152px 64px 80px",
        position: "relative",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      {/* Orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <motion.div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(80px)",
          width: 600, height: 600, right: -100, top: "calc(50% - 300px)",
          background: "rgba(26,77,110,0.2)",
          y: orb1Y,
        }} />
        <motion.div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(80px)",
          width: 400, height: 400, left: -80, bottom: -100,
          background: "rgba(42,157,143,0.1)",
          y: orb2Y,
        }} />
        <motion.div style={{
          position: "absolute", borderRadius: "50%", filter: "blur(80px)",
          width: 300, height: 300, left: "40%", top: "10%",
          background: "rgba(212,164,76,0.06)",
          y: orb3Y,
        }} />
      </div>

      <motion.div style={{ position: "relative", zIndex: 2, maxWidth: 1200, margin: "0 auto", width: "100%", y: contentY, opacity: contentOpacity }}>
        {/* Tag */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "var(--gold)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 28,
          }}
        >
          <span style={{
            width: 6, height: 6, background: "var(--gold)", borderRadius: "50%",
            animation: "dotPulse 2s ease-in-out infinite",
          }} />
          AI Handoff Intelligence
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(48px, 7vw, 96px)",
            lineHeight: 0.96,
            letterSpacing: "-3px",
            maxWidth: 860,
            margin: 0,
            color: "var(--paper)",
          }}
        >
          <span style={{ display: "block" }}>Turn Chaos</span>
          <span style={{
            display: "block",
            color: "var(--gold)",
            position: "relative",
          }}>
            Into Clarity.
            <span style={{
              position: "absolute", left: 0, right: 0, bottom: -2, height: 2,
              background: "linear-gradient(90deg, var(--gold), transparent)",
            }} />
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          style={{
            marginTop: 36,
            maxWidth: 520,
            fontSize: 17,
            lineHeight: 1.8,
            color: "var(--paper2)",
            fontWeight: 300,
            fontFamily: "var(--font-epilogue), sans-serif",
          }}
        >
          <em style={{ color: "var(--gold2)", fontStyle: "italic" }}>Pravah</em> means flow in Sanskrit. AI-powered handoff intelligence that extracts blockers, ownership, and urgency from messy updates — in real time.
        </motion.p>

        {/* Stat bar */}
        <motion.div
          className="glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 60,
          }}
        >
          {[
            { num: "2800", prefix: "₹", suffix: "Cr+", label: "Lost to poor handoffs / year" },
            { num: "60", suffix: " min", label: "Context reconstruction time" },
            { num: null, label: "Tools solving this today", zero: true },
          ].map((stat, i) => (
            <div
              key={i}
              style={{
                padding: "22px 40px",
                borderRight: i < 2 ? "1px solid var(--border)" : "none",
                flex: "1 1 auto",
              }}
            >
              <span style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 800,
                fontSize: 34,
                color: "var(--gold)",
                display: "block",
                lineHeight: 1,
                marginBottom: 5,
              }}>
                {stat.prefix}
                {stat.zero ? "Zero" : (
                  <span data-count={stat.num}>0</span>
                )}
                {stat.suffix}
              </span>
              <span style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "var(--paper3)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}>
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 52, flexWrap: "wrap" }}
        >
          <button
            onClick={onTryDemo}
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              background: "var(--gold)",
              color: "var(--ink)",
              padding: "16px 36px",
              borderRadius: 3,
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--gold2)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--gold)";
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
            }}
          >
            Try Live Demo
          </button>

          <a
            href="#pipeline"
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--paper)",
              padding: "16px 30px",
              borderRadius: 3,
              textDecoration: "none",
              border: "1px solid var(--border2)",
              transition: "border-color 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.35)";
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border2)";
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            See How It Works
          </a>
        </motion.div>
      </motion.div>

      {/* Right visual panel */}
      <motion.div
        className="hero-side-panel glass-panel glass-panel--strong"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        style={{
          position: "absolute",
          right: 64,
          top: "calc(50% - 170px)",
          width: "min(420px, 35vw)",
          height: 340,
          overflow: "hidden",
          zIndex: 2,
          y: panelY,
        }}
      >
        <FloatingNodes />
        <motion.div
          className="glass-badge"
          style={{
            position: "absolute", top: 16, left: 16,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10, letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1px solid rgba(212,164,76,0.25)",
            color: "var(--gold)",
            padding: "6px 12px",
            borderRadius: 2,
          }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4.2, repeat: Infinity }}
        >
          Incoming Signals
        </motion.div>
        <motion.div
          className="glass-badge"
          style={{
            position: "absolute", bottom: 16, right: 16,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10, letterSpacing: "0.12em",
            textTransform: "uppercase",
            border: "1px solid rgba(42,157,143,0.3)",
            color: "var(--teal2)",
            padding: "6px 12px",
            borderRadius: 2,
          }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.8, repeat: Infinity }}
        >
          Structured Output
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        style={{
          position: "absolute",
          bottom: 40,
          left: 64,
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--paper3)",
          y: cueY,
        }}
      >
        <div style={{ width: 1, height: 44, background: "var(--border)", position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-100%", left: 0, width: "100%", height: "50%",
            background: "linear-gradient(to bottom, transparent, var(--gold), transparent)",
            animation: "scrollDrop 2.2s ease-in-out infinite",
          }} />
        </div>
        Scroll to explore
      </motion.div>

      <style>{`
        @keyframes scrollDrop {
          0% { top: -100%; }
          100% { top: 200%; }
        }
        @media (max-width: 900px) {
          #hero { padding: 120px 20px 80px !important; }
          .hero-side-panel { display: none !important; }
        }
      `}</style>
    </section>
  );
}