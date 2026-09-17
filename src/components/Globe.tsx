import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { useMemo, useRef, useState, Suspense, useEffect } from "react";
import * as THREE from "three";
import type { Station } from "@/data/stations";
import { koeppenMeta } from "@/lib/koeppen";

const RADIUS = 2;

function toVec(lat: number, lon: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

function Earth() {
  const texture = useLoader(THREE.TextureLoader, "/textures/earth.jpg");
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
  }, [texture]);
  return (
    <mesh>
      <sphereGeometry args={[RADIUS, 96, 96]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  );
}

function StationPoints({
  stations,
  selectedId,
  onSelect,
}: {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [hover, setHover] = useState<Station | null>(null);

  return (
    <group>
      {stations.map((s) => {
        const p = toVec(s.lat, s.lon, RADIUS + 0.015);
        const active = s.id === selectedId;
        const isHover = hover?.id === s.id;
        return (
          <mesh
            key={s.id}
            position={p}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(s);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHover((h) => (h?.id === s.id ? null : h));
              document.body.style.cursor = "auto";
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(s.id);
            }}
          >
            <sphereGeometry args={[active || isHover ? 0.032 : 0.018, 12, 12]} />
            <meshBasicMaterial color={active ? "#ffffff" : koeppenMeta(s.zone).color} />
          </mesh>
        );
      })}
      {hover && (
        <Html position={toVec(hover.lat, hover.lon, RADIUS + 0.09)} center distanceFactor={7}>
          <div className="pointer-events-none whitespace-nowrap rounded-md border border-border bg-card/95 px-2 py-1 text-[11px] font-medium text-card-foreground shadow-lg">
            {hover.name}
          </div>
        </Html>
      )}
    </group>
  );
}

function Rotator({
  paused,
  target,
  children,
}: {
  paused: boolean;
  target: { lat: number; lon: number } | null;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);
  const goal = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!target) return;
    goal.current = {
      x: (target.lat * Math.PI) / 180,
      y: -((target.lon + 90) * Math.PI) / 180,
    };
  }, [target]);

  useFrame((_, delta) => {
    const g = ref.current;
    if (!g) return;
    if (goal.current) {
      const gy = goal.current.y;
      let dy = ((gy - g.rotation.y + Math.PI) % (Math.PI * 2)) - Math.PI;
      const dx = goal.current.x - g.rotation.x;
      g.rotation.y += dy * Math.min(1, delta * 3);
      g.rotation.x += dx * Math.min(1, delta * 3);
      if (Math.abs(dy) < 0.005 && Math.abs(dx) < 0.005) goal.current = null;
    } else if (!paused) {
      g.rotation.y += delta * 0.045;
    }
  });

  return <group ref={ref}>{children}</group>;
}

function Stars() {
  const positions = useMemo(() => {
    const arr = new Float32Array(1400 * 3);
    for (let i = 0; i < 1400; i++) {
      const v = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(30 + Math.random() * 30);
      arr.set([v.x, v.y, v.z], i * 3);
    }
    return arr;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.14} color="#cbd5e1" sizeAttenuation />
    </points>
  );
}

export default function Globe({
  stations,
  selectedId,
  onSelect,
}: {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [interacting, setInteracting] = useState(false);
  const selected = stations.find((s) => s.id === selectedId) ?? null;
  const target = selected ? { lat: selected.lat, lon: selected.lon } : null;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.2], fov: 45 }}
      gl={{ preserveDrawingBuffer: true }}
      onPointerDown={() => setInteracting(true)}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 3, 5]} intensity={1.3} />
      <Stars />
      <Suspense fallback={null}>
        <Rotator paused={interacting || !!selected} target={target}>
          <Earth />
          <StationPoints stations={stations} selectedId={selectedId} onSelect={onSelect} />
        </Rotator>
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={2.6}
        maxDistance={9}
        rotateSpeed={0.5}
        zoomSpeed={0.6}
      />
    </Canvas>
  );
}
