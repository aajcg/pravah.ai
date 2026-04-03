"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

type NodeId = "user" | "api" | "extractor" | "db" | "chat" | "response";

interface FlowNode {
  id: NodeId;
  label: string;
  position: [number, number, number];
  color: string;
}

interface FlowEdge {
  from: NodeId;
  to: NodeId;
  label: string;
}

const NODES: FlowNode[] = [
  { id: "user",      label: "User",         position: [-4.2, 0.4, 0],   color: "#d4a44c" },
  { id: "api",       label: "API",          position: [-2.4, 1.4, 0.2], color: "#f0c06e" },
  { id: "extractor", label: "Extractor",    position: [-0.4, 0.6, -0.1],color: "#2a9d8f" },
  { id: "db",        label: "Structured DB",position: [1.5,  1.3, 0.1], color: "#38c4b4" },
  { id: "chat",      label: "Chat Engine",  position: [3.3,  0.5, -0.2],color: "#d4a44c" },
  { id: "response",  label: "Response",     position: [4.7, -0.7, 0],   color: "#f0c06e" },
];

const EDGES: FlowEdge[] = [
  { from: "user",      to: "api",      label: "POST /handoff/extract" },
  { from: "api",       to: "extractor",label: "LLM Processing" },
  { from: "extractor", to: "db",       label: "JSON Output" },
  { from: "db",        to: "chat",     label: "Context Load" },
  { from: "chat",      to: "response", label: "Answer" },
];

function FlowPacket({ path }: { path: THREE.Vector3[] }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2) return;
    const t = (clock.elapsedTime * 0.22) % 1;
    const scaled = t * (path.length - 1);
    const cur = Math.floor(scaled);
    const nxt = Math.min(cur + 1, path.length - 1);
    ref.current.position.lerpVectors(path[cur], path[nxt], scaled - cur);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 20, 20]} />
      <meshStandardMaterial color="#d4a44c" emissive="#f0c06e" emissiveIntensity={2} />
    </mesh>
  );
}

export default function FlowVisualizer3D() {
  const nodeById = useMemo(() => new Map(NODES.map((n) => [n.id, n] as const)), []);

  const packetPath = useMemo(() => {
    const points = EDGES.map((e) => nodeById.get(e.from)?.position ?? [0, 0, 0]);
    const last = nodeById.get("response")?.position ?? [0, 0, 0];
    return [...points, last].map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  }, [nodeById]);

  return (
    <div style={{
      border: "1px solid var(--border)",
      background: "var(--ink2)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 1,
        background: "linear-gradient(90deg, transparent, rgba(212,164,76,0.35), transparent)",
      }} />

      {/* Header */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--gold)",
        }}>
          // System Flow Visualization
        </span>
      </div>

      <div style={{ height: 360 }}>
        <Canvas camera={{ position: [0, 0.7, 9], fov: 48 }}>
          <color attach="background" args={["#07080d"]} />
          <ambientLight intensity={0.35} />
          <pointLight position={[2, 4, 3]} intensity={14} color="#d4a44c" />
          <pointLight position={[-2, -3, 2]} intensity={8} color="#2a9d8f" />

          {EDGES.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const mid: [number, number, number] = [
              (from.position[0] + to.position[0]) / 2,
              (from.position[1] + to.position[1]) / 2 + 0.25,
              (from.position[2] + to.position[2]) / 2,
            ];
            return (
              <group key={`${edge.from}-${edge.to}`}>
                <Line
                  points={[from.position, to.position]}
                  color="#d4a44c"
                  lineWidth={1.2}
                  transparent
                  opacity={0.4}
                />
                <Html position={mid} center distanceFactor={8}>
                  <div style={{
                    background: "rgba(7,8,13,0.88)",
                    border: "1px solid rgba(212,164,76,0.2)",
                    color: "var(--gold2)",
                    padding: "4px 8px",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    {edge.label}
                  </div>
                </Html>
              </group>
            );
          })}

          {NODES.map((node, i) => (
            <Float key={node.id} speed={1.1 + i * 0.05} rotationIntensity={0.2} floatIntensity={0.5}>
              <mesh position={node.position}>
                <sphereGeometry args={[0.18, 28, 28]} />
                <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={0.8} />
                <Html center position={[0, -0.42, 0]} distanceFactor={8}>
                  <div style={{
                    background: "rgba(7,8,13,0.85)",
                    border: "1px solid rgba(212,164,76,0.2)",
                    color: "var(--paper2)",
                    padding: "3px 8px",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}>
                    {node.label}
                  </div>
                </Html>
              </mesh>
            </Float>
          ))}

          <FlowPacket path={packetPath} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 2.5}
            maxPolarAngle={Math.PI / 2.5}
            autoRotate
            autoRotateSpeed={0.3}
          />
        </Canvas>
      </div>
    </div>
  );
}