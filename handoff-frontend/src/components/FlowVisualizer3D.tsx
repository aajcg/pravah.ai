"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Html, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type NodeId =
  | "user"
  | "api"
  | "extractor"
  | "db"
  | "chat"
  | "response";

interface FlowNode {
  id: NodeId;
  label: string;
  position: [number, number, number];
  tint: string;
}

interface FlowEdge {
  from: NodeId;
  to: NodeId;
  label: string;
}

const NODES: FlowNode[] = [
  { id: "user", label: "User", position: [-4.2, 0.4, 0], tint: "#67e8f9" },
  { id: "api", label: "API", position: [-2.4, 1.4, 0.2], tint: "#38bdf8" },
  {
    id: "extractor",
    label: "Extractor",
    position: [-0.4, 0.6, -0.1],
    tint: "#a78bfa",
  },
  { id: "db", label: "Structured DB", position: [1.5, 1.3, 0.1], tint: "#22d3ee" },
  { id: "chat", label: "Chat Engine", position: [3.3, 0.5, -0.2], tint: "#818cf8" },
  {
    id: "response",
    label: "Response",
    position: [4.7, -0.7, 0],
    tint: "#67e8f9",
  },
];

const EDGES: FlowEdge[] = [
  { from: "user", to: "api", label: "POST /handoff/extract" },
  { from: "api", to: "extractor", label: "LLM Processing" },
  { from: "extractor", to: "db", label: "JSON Output" },
  { from: "db", to: "chat", label: "Context Load" },
  { from: "chat", to: "response", label: "Answer" },
];

function FlowPacket({ path }: { path: THREE.Vector3[] }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current || path.length < 2) {
      return;
    }

    const t = (clock.elapsedTime * 0.22) % 1;
    const scaled = t * (path.length - 1);
    const current = Math.floor(scaled);
    const next = Math.min(current + 1, path.length - 1);
    const local = scaled - current;

    ref.current.position.lerpVectors(path[current], path[next], local);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.09, 20, 20]} />
      <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={2} />
    </mesh>
  );
}

export default function FlowVisualizer3D() {
  const nodeById = useMemo(
    () => new Map(NODES.map((node) => [node.id, node] as const)),
    []
  );

  const packetPath = useMemo(() => {
    const points = EDGES.map((edge) => nodeById.get(edge.from)?.position ?? [0, 0, 0]);
    const finalPoint = nodeById.get("response")?.position ?? [0, 0, 0];

    return [...points, finalPoint].map(
      (point) => new THREE.Vector3(point[0], point[1], point[2])
    );
  }, [nodeById]);

  return (
    <Card className="overflow-hidden border-cyan-300/25 bg-slate-950/55">
      <CardHeader>
        <CardTitle>System Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent className="h-[360px] p-0">
        <Canvas camera={{ position: [0, 0.7, 9], fov: 48 }}>
          <color attach="background" args={["#070d1d"]} />
          <ambientLight intensity={0.45} />
          <pointLight position={[2, 4, 3]} intensity={16} color="#22d3ee" />
          <pointLight position={[-2, -3, 2]} intensity={9} color="#8b5cf6" />

          {EDGES.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);

            if (!from || !to) {
              return null;
            }

            const midpoint: [number, number, number] = [
              (from.position[0] + to.position[0]) / 2,
              (from.position[1] + to.position[1]) / 2 + 0.25,
              (from.position[2] + to.position[2]) / 2,
            ];

            return (
              <group key={`${edge.from}-${edge.to}`}>
                <Line
                  points={[from.position, to.position]}
                  color="#38bdf8"
                  lineWidth={1.5}
                  transparent
                  opacity={0.55}
                />
                <Html position={midpoint} center distanceFactor={8}>
                  <div className="rounded bg-slate-950/80 px-2 py-1 text-[10px] text-cyan-100">
                    {edge.label}
                  </div>
                </Html>
              </group>
            );
          })}

          {NODES.map((node, index) => (
            <Float
              key={node.id}
              speed={1.15 + index * 0.05}
              rotationIntensity={0.25}
              floatIntensity={0.55}
            >
              <mesh position={node.position}>
                <sphereGeometry args={[0.2, 28, 28]} />
                <meshStandardMaterial
                  color={node.tint}
                  emissive={node.tint}
                  emissiveIntensity={0.85}
                />
                <Html center position={[0, -0.4, 0]} distanceFactor={8}>
                  <div className="rounded bg-slate-950/75 px-2 py-1 text-xs text-slate-100">
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
      </CardContent>
    </Card>
  );
}
