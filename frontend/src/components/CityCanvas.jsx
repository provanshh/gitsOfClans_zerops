import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// ─── Animated Minecraft Water ───────────────────────────────────
function MinecraftWater() {
  const meshRef = useRef();
  const waveRefs = useRef([]);
  const TILE = 18;
  const RANGE = 12;

  // Build a grid of water tiles
  const tiles = useMemo(() => {
    const t = [];
    for (let xi = -RANGE; xi <= RANGE; xi++) {
      for (let zi = -RANGE; zi <= RANGE; zi++) {
        t.push({ x: xi * TILE, z: zi * TILE, phase: (xi + zi) * 0.4 });
      }
    }
    return t;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    waveRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const tile = tiles[i];
      const wave = Math.sin(t * 1.2 + tile.phase) * 0.12;
      mesh.position.y = -1.6 + wave;
      // Animate color between two Minecraft water blues
      const lum = 0.35 + Math.sin(t * 0.8 + tile.phase * 0.5) * 0.04;
      mesh.material.color.setHSL(0.585, 0.88, lum);
      mesh.material.opacity = 0.82 + Math.sin(t + tile.phase) * 0.06;
    });
  });

  return (
    <group>
      {tiles.map((tile, i) => (
        <mesh
          key={i}
          ref={el => waveRefs.current[i] = el}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[tile.x, -1.6, tile.z]}
        >
          <planeGeometry args={[TILE - 0.3, TILE - 0.3]} />
          <meshStandardMaterial
            color="#1a6fb5"
            roughness={0.05}
            metalness={0.35}
            transparent
            opacity={0.86}
          />
        </mesh>
      ))}
      {/* Deep ocean base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.2, 0]}>
        <planeGeometry args={[3000, 3000]} />
        <meshStandardMaterial color="#0d3f6e" roughness={0.1} />
      </mesh>
    </group>
  );
}

// ─── Island Ground Platform ────────────────────────────────────
function IslandGround({ size }) {
  const hw = size / 2;
  const tileSize = 6;
  const count = Math.floor(size / tileSize);

  const tiles = useMemo(() => {
    const result = [];
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        const x = -hw + tileSize * xi + tileSize / 2;
        const z = -hw + tileSize * zi + tileSize / 2;
        const dark = (xi + zi) % 2 === 0;
        // Occasional podzol/stone variant
        const variant = (xi * 7 + zi * 13) % 17 === 0 ? 'stone' : (xi * 3 + zi * 11) % 23 === 0 ? 'podzol' : 'grass';
        result.push({ x, z, dark, variant });
      }
    }
    return result;
  }, [size, count, hw]);

  const colorMap = {
    grass: { light: '#4ab52a', dark: '#3a9920' },
    podzol: { light: '#8B6340', dark: '#7a5230' },
    stone: { light: '#8a9099', dark: '#7a8088' },
  };

  return (
    <group>
      {/* Sandy beach border */}
      <mesh position={[0, -0.9, 0]} receiveShadow>
        <boxGeometry args={[size + 6, 1.6, size + 6]} />
        <meshStandardMaterial color="#c4a35a" roughness={0.95} />
      </mesh>
      {/* Dirt layer */}
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <boxGeometry args={[size + 1, 0.5, size + 1]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      {/* Checkerboard grass/podzol/stone tiles */}
      {tiles.map((t, i) => {
        const cm = colorMap[t.variant];
        return (
          <mesh key={i} position={[t.x, 0.02, t.z]} receiveShadow>
            <boxGeometry args={[tileSize - 0.08, 0.12, tileSize - 0.08]} />
            <meshStandardMaterial color={t.dark ? cm.dark : cm.light} roughness={0.75} />
          </mesh>
        );
      })}
    </group>
  );
}

// ─── Road Grid ─────────────────────────────────────────────────
function RoadGrid({ size }) {
  const roads = useMemo(() => {
    const result = [];
    const spacing = 14;
    const half = Math.floor((size / 2 - 6) / spacing);
    for (let i = -half; i <= half; i++) {
      const p = i * spacing;
      result.push({ axis: 'x', pos: p, len: size - 8 });
      result.push({ axis: 'z', pos: p, len: size - 8 });
    }
    return result;
  }, [size]);

  return (
    <group>
      {roads.map((r, i) => (
        <mesh key={i} position={[r.axis === 'z' ? r.pos : 0, 0.16, r.axis === 'x' ? r.pos : 0]} receiveShadow>
          <boxGeometry args={[r.axis === 'z' ? 2.8 : r.len, 0.07, r.axis === 'x' ? 2.8 : r.len]} />
          <meshStandardMaterial color="#6e7b8a" roughness={0.95} />
        </mesh>
      ))}
      {/* Road center line markings */}
      {roads.filter((_, i) => i % 2 === 0).map((r, i) => (
        <mesh key={`m${i}`} position={[r.axis === 'z' ? r.pos : 0, 0.21, r.axis === 'x' ? r.pos : 0]}>
          <boxGeometry args={[r.axis === 'z' ? 0.2 : r.len * 0.6, 0.02, r.axis === 'x' ? 0.2 : r.len * 0.6]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Minecraft Oak Tree ────────────────────────────────────────
function MCTree({ position, scale = 1 }) {
  const leafColor1 = '#2d8a36';
  const leafColor2 = '#38a33a';
  const leafColor3 = '#1f6b28';
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2.0, 0.6]} />
        <meshStandardMaterial color="#6e4722" roughness={0.9} />
      </mesh>
      {/* Foliage - 3 layers for Minecraft style */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[2.4, 1.2, 2.4]} />
        <meshStandardMaterial color={leafColor1} roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow>
        <boxGeometry args={[1.8, 1.0, 1.8]} />
        <meshStandardMaterial color={leafColor2} roughness={0.65} />
      </mesh>
      <mesh position={[0, 3.9, 0]} castShadow>
        <boxGeometry args={[1.0, 0.8, 1.0]} />
        <meshStandardMaterial color={leafColor3} roughness={0.6} />
      </mesh>
    </group>
  );
}

// ─── Minecraft Spruce Tree ─────────────────────────────────────
function SpruceTree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[0.5, 3, 0.5]} />
        <meshStandardMaterial color="#4a2e0e" roughness={0.9} />
      </mesh>
      {[0, 0.9, 1.7, 2.4].map((y, i) => (
        <mesh key={i} position={[0, y + 1.8, 0]} castShadow>
          <boxGeometry args={[2.0 - i * 0.4, 0.6, 2.0 - i * 0.4]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1a5c20' : '#226b28'} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Flower / Bush decoration ──────────────────────────────────
function GrassDecor({ position, type = 'flower' }) {
  if (type === 'flower') {
    const colors = ['#ff4081', '#ff9800', '#ffeb3b', '#e91e63'];
    const color = colors[Math.floor(Math.abs(position[0] + position[2]) * 7) % colors.length];
    return (
      <group position={position}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#4caf50" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[0.3, 0.2, 0.3]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
        </mesh>
      </group>
    );
  }
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.9]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ─── Building ──────────────────────────────────────────────────
function CityBuilding({ building, isSelected, onSelect, onHover }) {
  const [hovered, setHovered] = useState(false);
  const px = Number(building.position?.[0]) || 0;
  const pz = Number(building.position?.[2]) || 0;
  const height = Math.max(2, Number(building.height) || 5);
  const roofColor = building.color || '#3b82f6';
  const W = 2.2, D = 2.2;

  const windowRows = useMemo(() => {
    const rows = [];
    const n = Math.max(1, Math.floor((height - 1) / 2.8));
    for (let r = 0; r < n; r++) rows.push(-height / 2 + 1.4 + r * 2.8);
    return rows;
  }, [height]);

  const highlight = isSelected ? '#22d3ee' : hovered ? '#fbbf24' : null;

  return (
    <group position={[px, height / 2, pz]}>
      {/* Foundation */}
      <mesh position={[0, -height / 2 + 0.1, 0]} receiveShadow>
        <boxGeometry args={[W + 0.3, 0.2, D + 0.3]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      {/* Body */}
      <mesh castShadow receiveShadow
        onPointerOver={e => { e.stopPropagation(); setHovered(true); onHover(building); document.body.style.cursor = 'pointer'; }}
        onPointerOut={e => { e.stopPropagation(); setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
        onClick={e => { e.stopPropagation(); onSelect(building); }}
      >
        <boxGeometry args={[W, height, D]} />
        <meshStandardMaterial
          color={highlight || '#dde4ee'}
          emissive={highlight || '#000000'}
          emissiveIntensity={highlight ? 0.5 : 0}
          roughness={0.45}
        />
      </mesh>
      {/* Roof trim */}
      <mesh position={[0, height / 2 + 0.12, 0]}>
        <boxGeometry args={[W + 0.14, 0.24, D + 0.14]} />
        <meshStandardMaterial color={roofColor} roughness={0.3} />
      </mesh>
      {/* Antenna on tall buildings */}
      {height > 16 && (
        <mesh position={[0, height / 2 + 0.9, 0]}>
          <boxGeometry args={[0.15, 1.4, 0.15]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
      )}
      {/* Windows */}
      {windowRows.map((wy, i) => (
        <group key={i}>
          <mesh position={[-0.5, wy, D / 2 + 0.02]}><boxGeometry args={[0.5, 0.6, 0.04]} /><meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.5} /></mesh>
          <mesh position={[0.5, wy, D / 2 + 0.02]}><boxGeometry args={[0.5, 0.6, 0.04]} /><meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.5} /></mesh>
          <mesh position={[-0.5, wy, -D / 2 - 0.02]}><boxGeometry args={[0.5, 0.6, 0.04]} /><meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.3} /></mesh>
          <mesh position={[0.5, wy, -D / 2 - 0.02]}><boxGeometry args={[0.5, 0.6, 0.04]} /><meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.3} /></mesh>
        </group>
      ))}
      {/* Selection outline */}
      {isSelected && (
        <mesh><boxGeometry args={[W + 0.3, height + 0.3, D + 0.3]} /><meshBasicMaterial color="#22d3ee" wireframe /></mesh>
      )}
    </group>
  );
}

// ─── Fountain (README center) ───────────────────────────────────
function Fountain({ onSelect, onHover, isSelected }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef();
  const h = isSelected ? '#22d3ee' : hovered ? '#fcd34d' : null;
  const readmeObj = { name: 'README.md', isReadmeFountain: true };

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.material.color.setHSL(0.58, 0.9, 0.5 + Math.sin(clock.getElapsedTime() * 2) * 0.08);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow
        onPointerOver={e => { e.stopPropagation(); setHovered(true); onHover(readmeObj); document.body.style.cursor = 'pointer'; }}
        onPointerOut={e => { e.stopPropagation(); setHovered(false); onHover(null); document.body.style.cursor = 'auto'; }}
        onClick={e => { e.stopPropagation(); onSelect(readmeObj); }}>
        <boxGeometry args={[6, 0.8, 6]} />
        <meshStandardMaterial color={h || '#475569'} emissive={h || '#000'} emissiveIntensity={h ? 0.5 : 0} roughness={0.8} />
      </mesh>
      {/* Animated water pool */}
      <mesh ref={meshRef} position={[0, 0.72, 0]}>
        <boxGeometry args={[4.6, 0.3, 4.6]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow onClick={e => { e.stopPropagation(); onSelect(readmeObj); }}>
        <boxGeometry args={[1.5, 3.2, 1.5]} />
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.35} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 4.8, 0]} castShadow>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

// ─── Minecraft Character (Walking Person) ──────────────────────
function MCCharacter({ startX, startZ, color, speed = 1, radius = 15 }) {
  const ref = useRef();
  const lLeg = useRef(); const rLeg = useRef();
  const lArm = useRef(); const rArm = useRef();
  const offset = useRef(Math.random() * Math.PI * 2);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed + offset.current;
    ref.current.position.x = startX + Math.cos(t * 0.4) * radius;
    ref.current.position.z = startZ + Math.sin(t * 0.4) * radius;
    ref.current.rotation.y = Math.atan2(
      -Math.sin(t * 0.4) * radius,
      -Math.cos(t * 0.4) * radius
    ) + Math.PI;
    const swing = Math.sin(t * 6) * 0.5;
    if (lLeg.current) lLeg.current.rotation.x = swing;
    if (rLeg.current) rLeg.current.rotation.x = -swing;
    if (lArm.current) lArm.current.rotation.x = -swing * 0.8;
    if (rArm.current) rArm.current.rotation.x = swing * 0.8;
  });

  return (
    <group ref={ref} position={[startX, 0.1, startZ]}>
      {/* Head */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <meshStandardMaterial color="#ffdbac" roughness={0.7} />
      </mesh>
      {/* Hat */}
      <mesh position={[0, 2.18, 0]}>
        <boxGeometry args={[0.62, 0.15, 0.62]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.62, 0.7, 0.32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Left Arm */}
      <group ref={lArm} position={[-0.44, 1.45, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.65, 0.22]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Right Arm */}
      <group ref={rArm} position={[0.44, 1.45, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.22, 0.65, 0.22]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      {/* Left Leg */}
      <group ref={lLeg} position={[-0.15, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.24, 0.65, 0.24]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>
      </group>
      {/* Right Leg */}
      <group ref={rLeg} position={[0.15, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow>
          <boxGeometry args={[0.24, 0.65, 0.24]} />
          <meshStandardMaterial color="#1a237e" />
        </mesh>
      </group>
    </group>
  );
}

// ─── Camera Controller with Zoom-to-target support ─────────────
function CameraController({ isAutoRevolving, zoomTarget, onZoomDone }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const zoomProgress = useRef(0);
  const startPos = useRef(null);
  const targetPos = useRef(null);

  useEffect(() => {
    if (zoomTarget && controlsRef.current) {
      startPos.current = camera.position.clone();
      zoomProgress.current = 0;
      targetPos.current = new THREE.Vector3(
        zoomTarget[0] + 12,
        zoomTarget[1] + 18,
        zoomTarget[2] + 18
      );
    }
  }, [zoomTarget]);

  useFrame((state, delta) => {
    if (controlsRef.current && isAutoRevolving) {
      controlsRef.current.azimuthAngle += delta * 0.4;
      controlsRef.current.update();
    }

    // Smooth zoom-in to building
    if (targetPos.current && zoomProgress.current < 1) {
      zoomProgress.current = Math.min(1, zoomProgress.current + delta * 0.6);
      const ease = 1 - Math.pow(1 - zoomProgress.current, 3);
      camera.position.lerpVectors(startPos.current, targetPos.current, ease);
      controlsRef.current?.update();
      if (zoomProgress.current >= 1) {
        targetPos.current = null;
        onZoomDone?.();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableRotate enableZoom enablePan
      autoRotate={isAutoRevolving}
      autoRotateSpeed={2.5}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 8}
      minDistance={10}
      maxDistance={800}
      rotateSpeed={0.5}
      zoomSpeed={1.2}
    />
  );
}

// ─── Island Scene ──────────────────────────────────────────────
function IslandScene({ clanData, position, selectedBuilding, onSelectBuilding, onHoverBuilding }) {
  const [ox, , oz] = position;

  const layout = useMemo(() => {
    const raw = clanData?.layout_json;
    if (!raw) return {};
    if (typeof raw === 'string') { try { return JSON.parse(raw); } catch { return {}; } }
    return raw;
  }, [clanData?.layout_json]);

  const buildings = useMemo(() => Array.isArray(layout?.buildings) ? layout.buildings : [], [layout]);

  const islandSize = useMemo(() => {
    if (buildings.length === 0) return 60;
    let maxD = 20;
    buildings.forEach(b => {
      const bx = Math.abs(Number(b.position?.[0]) || 0);
      const bz = Math.abs(Number(b.position?.[2]) || 0);
      maxD = Math.max(maxD, bx, bz);
    });
    return (maxD + 18) * 2;
  }, [buildings]);

  // Perimeter trees (dense)
  const perimeterTrees = useMemo(() => {
    const result = [];
    const hw = islandSize / 2 - 3;
    for (let x = -hw; x <= hw; x += 6) {
      result.push({ pos: [x + Math.sin(x) * 0.4, 0, -hw], type: (Math.abs(x) % 12 < 6) ? 'spruce' : 'oak', scale: 0.8 + Math.sin(x * 0.7) * 0.2 });
      result.push({ pos: [x + Math.cos(x) * 0.4, 0, hw], type: (Math.abs(x) % 10 < 5) ? 'spruce' : 'oak', scale: 0.8 + Math.cos(x * 0.5) * 0.2 });
    }
    for (let z = -hw + 6; z < hw; z += 6) {
      result.push({ pos: [-hw, 0, z + Math.sin(z) * 0.4], type: (Math.abs(z) % 14 < 7) ? 'spruce' : 'oak', scale: 0.8 + Math.sin(z * 0.8) * 0.2 });
      result.push({ pos: [hw, 0, z + Math.cos(z) * 0.4], type: (Math.abs(z) % 12 < 6) ? 'oak' : 'spruce', scale: 0.9 });
    }
    return result;
  }, [islandSize]);

  // Interior scattered trees & flowers between buildings
  const interiorDecor = useMemo(() => {
    const items = [];
    const hw = islandSize / 2 - 6;
    const roadSpacing = 14;
    const roadHalf = Math.floor((islandSize / 2 - 6) / roadSpacing);

    // Place decorations in road-grid "blocks" (between intersections)
    for (let xi = -roadHalf; xi <= roadHalf; xi++) {
      for (let zi = -roadHalf; zi <= roadHalf; zi++) {
        const cx = xi * roadSpacing;
        const cz = zi * roadSpacing;
        // Check if a building is near this block center
        const nearBuilding = buildings.some(b => {
          const bx = Number(b.position?.[0]) || 0;
          const bz = Number(b.position?.[2]) || 0;
          return Math.abs(bx - cx) < 5 && Math.abs(bz - cz) < 5;
        });
        if (!nearBuilding) {
          // Place 1-2 trees or flowers in each empty block
          const seed = Math.abs(xi * 17 + zi * 31);
          if (seed % 4 === 0) {
            items.push({ type: 'oak', pos: [cx + 3, 0, cz + 3], scale: 0.7 });
          } else if (seed % 5 === 0) {
            items.push({ type: 'spruce', pos: [cx - 3, 0, cz - 3] });
          } else if (seed % 3 === 0) {
            items.push({ type: 'flower', pos: [cx + 2, 0.1, cz + 2] });
            items.push({ type: 'flower', pos: [cx - 2, 0.1, cz - 2] });
          } else if (seed % 7 === 0) {
            items.push({ type: 'bush', pos: [cx + 1, 0.1, cz - 3] });
          }
        }
      }
    }
    return items;
  }, [islandSize, buildings]);

  // Walking characters (8 of them, various colors)
  const characters = useMemo(() => [
    { startX: 8,  startZ: 8,  color: '#f59e0b', speed: 0.9, radius: 14 },
    { startX: -8, startZ: 12, color: '#10b981', speed: 1.1, radius: 10 },
    { startX: 15, startZ: -6, color: '#3b82f6', speed: 0.8, radius: 12 },
    { startX: -14,startZ: -8, color: '#ef4444', speed: 1.3, radius: 9  },
    { startX: 6,  startZ: -16,color: '#a855f7', speed: 0.7, radius: 16 },
    { startX: -6, startZ: 16, color: '#ff6b35', speed: 1.0, radius: 11 },
    { startX: 20, startZ: 0,  color: '#06b6d4', speed: 1.2, radius: 8  },
    { startX: -20,startZ: 4,  color: '#fcd34d', speed: 0.85,radius: 13 },
  ], []);

  const isFountainSelected = selectedBuilding?.isReadmeFountain && selectedBuilding?.cityId === (clanData?.id);

  return (
    <group position={[ox, 0, oz]}>
      <IslandGround size={islandSize} />
      <RoadGrid size={islandSize} />

      {/* Perimeter trees */}
      {perimeterTrees.map((t, i) =>
        t.type === 'spruce'
          ? <SpruceTree key={i} position={t.pos} />
          : <MCTree key={i} position={t.pos} scale={t.scale || 1} />
      )}

      {/* Interior decor (trees, flowers, bushes between buildings) */}
      {interiorDecor.map((item, i) => {
        if (item.type === 'oak') return <MCTree key={`d${i}`} position={item.pos} scale={item.scale || 0.8} />;
        if (item.type === 'spruce') return <SpruceTree key={`d${i}`} position={item.pos} />;
        return <GrassDecor key={`d${i}`} position={item.pos} type={item.type === 'bush' ? 'bush' : 'flower'} />;
      })}

      {/* Walking characters */}
      {characters.map((ch, i) => (
        <MCCharacter key={i} {...ch} />
      ))}

      <Fountain
        isSelected={isFountainSelected}
        onSelect={b => onSelectBuilding({ ...b, cityId: clanData?.id })}
        onHover={onHoverBuilding}
      />

      {buildings.map((b, i) => (
        <CityBuilding
          key={b.id || i}
          building={{ ...b, cityId: clanData?.id }}
          isSelected={selectedBuilding?.cityId === clanData?.id && selectedBuilding?.id === b.id}
          onSelect={onSelectBuilding}
          onHover={onHoverBuilding}
        />
      ))}
    </group>
  );
}

// ─── Main CityCanvas Export ────────────────────────────────────
export function CityCanvas({
  clansData = [],
  selectedBuilding,
  onSelectBuilding,
  selectedModel,
  isLiveConstructing,
  constructionProgress,
  isAutoRevolving = false,
  zoomToBuilding = null,
  onZoomDone,
}) {
  const [hoveredBuilding, setHoveredBuilding] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const clanPositions = useMemo(() => {
    const n = clansData.length;
    if (n <= 1) return [[0, 0, 0]];
    if (n === 2) return [[-70, 0, 0], [70, 0, 0]];
    if (n === 3) return [[0, 0, -70], [-70, 0, 50], [70, 0, 50]];
    const positions = [];
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2;
      positions.push([Math.cos(angle) * 90, 0, Math.sin(angle) * 90]);
    }
    return positions;
  }, [clansData.length]);

  return (
    <div
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      onPointerMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      <Canvas
        shadows
        gl={{ antialias: true }}
        style={{ background: 'linear-gradient(180deg, #87ceeb 0%, #5bc8f5 40%, #2987ba 100%)' }}
        camera={{ position: [120, 100, 120], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[120, 100, 120]} fov={45} near={0.5} far={5000} />

        <CameraController
          isAutoRevolving={isAutoRevolving}
          zoomTarget={zoomToBuilding}
          onZoomDone={onZoomDone}
        />

        {/* Lighting — warm sunlight */}
        <ambientLight intensity={0.9} />
        <directionalLight position={[100, 140, 80]} intensity={2.0} color="#fff8e7" castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048}
          shadow-camera-near={0.5} shadow-camera-far={600}
          shadow-camera-left={-250} shadow-camera-right={250}
          shadow-camera-top={250} shadow-camera-bottom={-250}
        />
        <directionalLight position={[-80, 80, -60]} intensity={0.6} color="#c7e8ff" />
        <hemisphereLight skyColor="#87ceeb" groundColor="#4a7c2f" intensity={0.6} />

        {/* Animated Minecraft water */}
        <MinecraftWater />

        {clansData.map((clan, idx) => (
          <IslandScene
            key={clan.id || idx}
            clanData={clan}
            position={clanPositions[idx] || [0, 0, 0]}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={onSelectBuilding}
            onHoverBuilding={setHoveredBuilding}
          />
        ))}
      </Canvas>

      {/* Hint */}
      <div style={{
        position: 'absolute', bottom: 140, left: 16, zIndex: 40,
        padding: '5px 12px', background: 'rgba(0,0,0,0.55)',
        color: '#cbd5e1', fontFamily: "'Fira Code',monospace",
        fontSize: '0.72rem', borderRadius: 4, pointerEvents: 'none'
      }}>
        {isAutoRevolving ? '🎥 AUTO-REVOLVING CAMERA DEMO MODE' : 'Drag to pan · Scroll to zoom · Click a building'}
      </div>

      {/* Hover tooltip */}
      {hoveredBuilding && (
        <div style={{
          position: 'absolute', pointerEvents: 'none', zIndex: 80,
          left: mousePos.x, top: mousePos.y - 10,
          transform: 'translate(-50%, -100%)',
          padding: '6px 12px', background: 'rgba(10,20,29,0.95)',
          border: '2px solid #f59e0b', borderRadius: 4,
          fontFamily: "'Fira Code',monospace", fontSize: '0.78rem',
          boxShadow: '0 0 12px rgba(245,158,11,0.4)'
        }}>
          <div style={{ color: '#fff', fontWeight: 800 }}>{hoveredBuilding.name}</div>
          <div style={{ color: '#f59e0b' }}>
            {hoveredBuilding.isReadmeFountain ? 'Click to view README' : `${hoveredBuilding.lines_of_code || 0} LOC · ${hoveredBuilding.extension || hoveredBuilding.language || ''}`}
          </div>
        </div>
      )}
    </div>
  );
}
