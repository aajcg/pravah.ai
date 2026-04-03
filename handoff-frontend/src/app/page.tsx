import Hero from "@/components/Hero";
import ParticleBackground from "@/components/ParticleBackground";
import Pipeline from "@/components/Pipeline";

export default function Home() {
  return (
    <div className="relative overflow-x-clip bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.12),transparent_45%),radial-gradient(circle_at_85%_15%,rgba(139,92,246,0.15),transparent_42%),radial-gradient(circle_at_70%_80%,rgba(56,189,248,0.12),transparent_40%)]" />

      <ParticleBackground />
      <Hero />
      <Pipeline />
    </div>
  );
}
