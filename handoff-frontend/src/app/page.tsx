import Hero from "@/components/Hero";
import ParticleBackground from "@/components/ParticleBackground";
import Pipeline from "@/components/Pipeline";

export default function Home() {
  return (
    <div className="relative overflow-x-clip" style={{ background: "var(--ink)" }}>
      {/* Radial glow orbs — match landing page orb aesthetic */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 80% 50%, rgba(26,77,110,0.2), transparent 45%), " +
            "radial-gradient(circle at 10% 90%, rgba(42,157,143,0.1), transparent 42%), " +
            "radial-gradient(circle at 45% 12%, rgba(212,164,76,0.06), transparent 40%)",
        }}
      />

      <ParticleBackground />
      <Hero />

      {/* Divider */}
      <div className="div-line" />

      <Pipeline />
    </div>
  );
}