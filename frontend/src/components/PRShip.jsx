import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

export function PRShip({ pr, position, isSelected, onSelectPRShip, setHoveredPRShip }) {
  const [hovered, setHovered] = useState(false);
  const shipGroup = useRef();

  const [x, initialY, z] = position;

  // Floating boat bobbing animation on water
  useFrame(({ clock }) => {
    if (shipGroup.current) {
      const t = clock.getElapsedTime() + (pr.id || 1);
      shipGroup.current.position.y = initialY + Math.sin(t * 1.5) * 0.4;
      shipGroup.current.rotation.z = Math.sin(t * 1.0) * 0.05;
    }
  });

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (setHoveredPRShip) setHoveredPRShip(pr);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    if (setHoveredPRShip) setHoveredPRShip(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onSelectPRShip(pr);
  };

  const highlightColor = isSelected ? '#00ffff' : hovered ? '#ffd700' : null;

  return (
    <group ref={shipGroup} position={[x, initialY, z]}>
      {/* 3D Label above Ship */}
      <Html position={[0, 7.5, 0]} center distanceFactor={110} style={{ pointerEvents: 'none' }}>
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            border: '2px solid #ff2a85',
            borderRadius: '12px',
            padding: '5px 12px',
            color: '#ffffff',
            fontFamily: "'Fira Code', monospace",
            fontWeight: 800,
            fontSize: '0.8rem',
            whiteSpace: 'nowrap',
            boxShadow: '0 0 15px rgba(255, 42, 133, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            pointerEvents: 'none'
          }}
        >
          <span>🚢</span>
          <span>PR #{pr.number}: {pr.title}</span>
          <span style={{ fontSize: '0.7rem', color: '#ff2a85' }}>
            (+{pr.additions} / -{pr.deletions})
          </span>
        </div>
      </Html>

      {/* Main Wooden Ship Hull */}
      <mesh
        position={[0, 0.8, 0]}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[6, 1.4, 3.2]} />
        <meshStandardMaterial
          color={highlightColor || '#6e4722'}
          emissive={highlightColor ? highlightColor : '#000000'}
          emissiveIntensity={highlightColor ? 0.5 : 0}
          roughness={0.8}
        />
      </mesh>

      {/* Ship Bow / Front Point */}
      <mesh position={[3.6, 1.0, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <boxGeometry args={[1.8, 1.0, 2.6]} />
        <meshStandardMaterial color="#5a381a" roughness={0.8} />
      </mesh>

      {/* Mast Pole */}
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[0.4, 5.0, 0.4]} />
        <meshStandardMaterial color="#3e2410" roughness={0.9} />
      </mesh>

      {/* White Voxel Cloth Sail */}
      <mesh position={[0, 4.2, 0.6]} castShadow>
        <boxGeometry args={[0.2, 3.2, 3.8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} />
      </mesh>

      {/* Glowing Beacon Flag */}
      <mesh position={[0, 6.2, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.2]} />
        <meshStandardMaterial color="#ff2a85" emissive="#ff2a85" emissiveIntensity={0.8} />
      </mesh>

      {/* Selection Highlight Ring */}
      {isSelected && (
        <mesh position={[0, 0.1, 0]}>
          <ringGeometry args={[4, 5, 32]} />
          <meshBasicMaterial color="#00ffff" side={2} />
        </mesh>
      )}
    </group>
  );
}
