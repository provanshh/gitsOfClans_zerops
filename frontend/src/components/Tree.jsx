import React from 'react';

export function MinecraftTree({ position }) {
  const [x, y, z] = position;

  return (
    <group position={[x, y, z]}>
      {/* Wood Trunk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 2, 0.6]} />
        <meshStandardMaterial color="#6e4722" roughness={0.9} />
      </mesh>

      {/* Foliage Bottom Layer */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.2, 2.2]} />
        <meshStandardMaterial color="#2d8a36" roughness={0.7} />
      </mesh>

      {/* Foliage Top Layer */}
      <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.0, 1.4]} />
        <meshStandardMaterial color="#38a33a" roughness={0.7} />
      </mesh>
    </group>
  );
}
