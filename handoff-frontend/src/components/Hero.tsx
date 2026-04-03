"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { playUiClick } from "@/lib/sound";
import { useHandoffStore } from "@/store/use-handoff-store";

function MessagePacket() {
  const meshRef = useRef<THREE.Mesh>(null);

  const points = useMemo(
    () => [
      new THREE.Vector3(-2.8, -0.7, 0.3),
      new THREE.Vector3(-1.2, 1.1, -0.1),
      new THREE.Vector3(0.5, -0.3, 0.2),
      new THREE.Vector3(1.9, 0.9, -0.2),
      new THREE.Vector3(3.1, -0.5, 0.1),
    ],
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) {
      return;
    }

    const t = (clock.elapsedTime * 0.24) % 1;
    const scaled = t * (points.length - 1);
    const currentIndex = Math.floor(scaled);
    const nextIndex = Math.min(currentIndex + 1, points.length - 1);
    const local = scaled - currentIndex;

    meshRef.current.position.lerpVectors(
      points[currentIndex],
      points[nextIndex],
      local
    );
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.09, 20, 20]} />
      <meshStandardMaterial
        color="#67e8f9"
        emissive="#22d3ee"
        emissiveIntensity={1.8}
      />
    </mesh>
  );
}

function FloatingNodesScene() {
  const nodes = [
    [-3.2, -0.8, -0.2],
    [-2.2, 0.8, 0.3],
    [-0.8, -0.3, -0.1],
    [0.9, 1.1, 0],
    [2.3, -0.4, 0.2],
    [3.4, 0.6, -0.3],
  ] as const;

  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
      <color attach="background" args={["#070d1d"]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[4, 3, 2]} intensity={10} color="#22d3ee" />
      <pointLight position={[-4, -2, 1]} intensity={7} color="#8b5cf6" />

      {nodes.map((position, index) => (
        <Float key={position.join("-")} speed={1.2 + index * 0.08} floatIntensity={0.8}>
          <mesh position={position}>
            <sphereGeometry args={[0.18 + (index % 2) * 0.05, 32, 32]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? "#7dd3fc" : "#a78bfa"}
              emissive={index % 2 === 0 ? "#06b6d4" : "#6d28d9"}
              emissiveIntensity={0.95}
              metalness={0.2}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}

      <MessagePacket />
      <OrbitControls enablePan={false} enableZoom={false} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}

export default function Hero() {
  const soundEnabled = useHandoffStore((state) => state.soundEnabled);

  const onTryDemo = () => {
    playUiClick(soundEnabled);
    const section = document.getElementById("pipeline");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative flex min-h-screen w-full items-center px-6 pb-20 pt-24 lg:px-12">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <Badge className="mb-5" variant="neutral">
            Handoff Intelligence System
          </Badge>
          <h1 className="text-balance text-5xl font-semibold leading-tight tracking-tight text-white md:text-7xl">
            Turn Chaos into Clarity
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-200/85 md:text-xl">
            AI-powered team handoff intelligence that extracts blockers, ownership,
            and deadlines from messy updates in real time.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={onTryDemo}>
              Try Live Demo
            </Button>
            <div className="rounded-xl border border-cyan-300/20 bg-cyan-400/5 px-4 py-2 text-sm text-cyan-100">
              Live pipeline simulation enabled
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.1 }}
          className="relative h-[370px] overflow-hidden rounded-3xl border border-white/15 bg-slate-950/55 backdrop-blur-xl md:h-[460px]"
        >
          <FloatingNodesScene />
          <motion.div
            className="absolute -left-4 top-6 rounded-xl border border-cyan-300/30 bg-slate-900/70 px-3 py-2 text-xs text-cyan-100"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY }}
          >
            Incoming Team Signals
          </motion.div>
          <motion.div
            className="absolute bottom-7 right-5 rounded-xl border border-violet-300/30 bg-slate-900/70 px-3 py-2 text-xs text-violet-100"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY }}
          >
            Structured Insight Stream
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
