import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function AgentDrone({ targetPosition, agentName, color = '#00f0ff' }) {
  const droneRef = useRef();

  const [tx, ty, tz] = targetPosition || [0, 15, 0];

  useFrame(({ clock }) => {
    if (droneRef.current) {
      const t = clock.getElapsedTime();
      // Orbit hovering animation around target building position
      droneRef.current.position.x = tx + Math.cos(t * 2) * 2.5;
      droneRef.current.position.y = ty + 4 + Math.sin(t * 3) * 0.8;
      droneRef.current.position.z = tz + Math.sin(t * 2) * 2.5;
      droneRef.current.rotation.y = t * 3;
    }
  });

  return (
    <group ref={droneRef} position={[tx, ty + 4, tz]}>
      {/* Agent Drone Core */}
      <mesh castShadow>
        <boxGeometry args={[1.2, 0.6, 1.2]} />
        <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Glowing Agent Eye */}
      <mesh position={[0, 0, 0.65]}>
        <boxGeometry args={[0.5, 0.25, 0.1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
      </mesh>

      {/* Constructor Laser Beam pointing down at building */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.08, 0.3, 4, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.6} />
      </mesh>

      {/* Propeller Rotors */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.3]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
}
