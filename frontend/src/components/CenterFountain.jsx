import React, { useState } from 'react';
import { Html } from '@react-three/drei';

export function CenterFountain({ readmeData, isSelected, onSelectBuilding, setHoveredBuilding }) {
  const [hovered, setHovered] = useState(false);

  // Always render — readmeData may be null if no README exists, still show fountain
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (setHoveredBuilding) setHoveredBuilding({ name: 'README.md', isReadmeFountain: true, ...(readmeData || {}) });
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    if (setHoveredBuilding) setHoveredBuilding(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onSelectBuilding) onSelectBuilding({ name: 'README.md', isReadmeFountain: true, ...(readmeData || {}) });
  };

  const highlightColor = isSelected ? '#00ffff' : hovered ? '#ffd700' : null;

  return (
    <group position={[0, 0, 0]}>
      {/* Label */}
      <Html position={[0, 9, 0]} center distanceFactor={100} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(10, 20, 29, 0.92)',
          border: '2px solid #fcd34d',
          borderRadius: '4px',
          padding: '4px 12px',
          color: '#fcd34d',
          fontFamily: "'Fira Code', monospace",
          fontWeight: 800,
          fontSize: '0.72rem',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⛲ README.md — Town Hall
        </div>
      </Html>

      {/* Outer Stone Fountain Rim */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow
        onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <boxGeometry args={[6, 0.8, 6]} />
        <meshStandardMaterial
          color={highlightColor || '#475569'}
          emissive={highlightColor || '#000000'}
          emissiveIntensity={highlightColor ? 0.5 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Water Pool */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[4.6, 0.3, 4.6]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} roughness={0.1} transparent opacity={0.88} />
      </mesh>

      {/* Golden Center Pillar */}
      <mesh position={[0, 2.2, 0]} castShadow
        onPointerOver={handlePointerOver} onPointerOut={handlePointerOut} onClick={handleClick}>
        <boxGeometry args={[1.5, 3.2, 1.5]} />
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={0.35} metalness={0.7} roughness={0.25} />
      </mesh>

      {/* Glowing Crystal Spire */}
      <mesh position={[0, 4.8, 0]} castShadow>
        <octahedronGeometry args={[1.1, 0]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.9} metalness={0.4} roughness={0.1} />
      </mesh>
    </group>
  );
}
