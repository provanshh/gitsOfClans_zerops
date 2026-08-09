import React, { useState, useMemo } from 'react';

export function Building({ building, isSelected, onSelectBuilding, setHoveredBuilding }) {
  const [hovered, setHovered] = useState(false);

  // Position comes from API as [x, height/2, z] — use directly
  const px = building.position?.[0] ?? 0;
  const pz = building.position?.[2] ?? 0;
  const height = building.height ?? 5;
  const py = height / 2; // Always center vertically on ground

  const width = 2.2;
  const depth = 2.2;

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    if (setHoveredBuilding) setHoveredBuilding(building);
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
    if (onSelectBuilding) onSelectBuilding(building);
  };

  // Roof color from language color, default blue
  const roofColor = building.color || '#3b82f6';

  // Window rows — one window band per ~2.5 units of height
  const windowRows = useMemo(() => {
    const rows = [];
    const count = Math.max(1, Math.floor((height - 1) / 2.5));
    for (let r = 0; r < count; r++) {
      const wy = -height / 2 + 1.2 + r * 2.5;
      rows.push(wy);
    }
    return rows;
  }, [height]);

  const isHighlighted = isSelected || hovered;
  const highlightColor = isSelected ? '#22d3ee' : '#fbbf24';

  return (
    <group position={[px, py, pz]}>
      {/* Dark slate foundation slab */}
      <mesh position={[0, -py + 0.1, 0]} receiveShadow>
        <boxGeometry args={[width + 0.3, 0.2, depth + 0.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Main building body — crisp white facade */}
      <mesh
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={isHighlighted ? highlightColor : '#e2e8f0'}
          emissive={isHighlighted ? highlightColor : '#000000'}
          emissiveIntensity={isHighlighted ? 0.45 : 0}
          roughness={0.45}
          metalness={0.08}
        />
      </mesh>

      {/* Blue roof trim cap */}
      <mesh position={[0, height / 2 + 0.12, 0]}>
        <boxGeometry args={[width + 0.12, 0.24, depth + 0.12]} />
        <meshStandardMaterial color={roofColor} roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Antenna for tall buildings */}
      {height > 14 && (
        <mesh position={[0, height / 2 + 0.8, 0]}>
          <boxGeometry args={[0.18, 1.4, 0.18]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.7} />
        </mesh>
      )}

      {/* Window bands — glowing blue squares */}
      {windowRows.map((wy, i) => (
        <group key={i}>
          {/* Front windows */}
          <mesh position={[-0.55, wy, depth / 2 + 0.02]}>
            <boxGeometry args={[0.55, 0.65, 0.04]} />
            <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.55} roughness={0.1} />
          </mesh>
          <mesh position={[0.55, wy, depth / 2 + 0.02]}>
            <boxGeometry args={[0.55, 0.65, 0.04]} />
            <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.55} roughness={0.1} />
          </mesh>
          {/* Back windows */}
          <mesh position={[-0.55, wy, -depth / 2 - 0.02]}>
            <boxGeometry args={[0.55, 0.65, 0.04]} />
            <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.4} roughness={0.1} />
          </mesh>
          <mesh position={[0.55, wy, -depth / 2 - 0.02]}>
            <boxGeometry args={[0.55, 0.65, 0.04]} />
            <meshStandardMaterial color="#93c5fd" emissive="#3b82f6" emissiveIntensity={0.4} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* Selection wireframe outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[width + 0.25, height + 0.25, depth + 0.25]} />
          <meshBasicMaterial color="#22d3ee" wireframe />
        </mesh>
      )}
    </group>
  );
}
