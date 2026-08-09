import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export function AgentCharacter({ modelName, targetPosition = [0, 0, 0] }) {
  const characterRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();

  // Use a ref for current position to avoid setState in useFrame
  const currentPos = useRef(new THREE.Vector3(0, 0.1, 0));
  const isMovingRef = useRef(false);

  const characterStyle = React.useMemo(() => {
    const name = (modelName || '').toLowerCase();
    if (name.includes('architect') || name.includes('3.5') || name.includes('sonnet')) {
      return { title: 'Worker', emoji: '👷', shirtColor: '#f59e0b', pantsColor: '#92400e', skinColor: '#ffdbac', hatColor: '#f59e0b', item: 'hammer' };
    } else if (name.includes('engineer') || name.includes('3.7') || name.includes('haiku')) {
      return { title: 'Runner', emoji: '🏃', shirtColor: '#10b981', pantsColor: '#064e3b', skinColor: '#fde68a', hatColor: '#10b981', item: 'laser' };
    } else if (name.includes('opus') || name.includes('wizard')) {
      return { title: 'Architect', emoji: '👴', shirtColor: '#3b82f6', pantsColor: '#1e3a8a', skinColor: '#fbbf24', hatColor: '#3b82f6', item: 'staff' };
    } else {
      return { title: 'Worker', emoji: '👷', shirtColor: '#f59e0b', pantsColor: '#92400e', skinColor: '#ffdbac', hatColor: '#f59e0b', item: 'hammer' };
    }
  }, [modelName]);

  useFrame(({ clock }) => {
    if (!characterRef.current) return;
    const t = clock.getElapsedTime();

    const target = new THREE.Vector3(
      targetPosition[0] || 0,
      0.1,
      targetPosition[2] || 0
    );

    const dist = currentPos.current.distanceTo(target);
    const speed = 0.08;
    isMovingRef.current = dist > 0.3;

    if (dist > 0.3) {
      currentPos.current.lerp(target, speed);
      characterRef.current.position.copy(currentPos.current);

      // Face direction of movement
      const dx = target.x - currentPos.current.x;
      const dz = target.z - currentPos.current.z;
      if (Math.abs(dx) > 0.01 || Math.abs(dz) > 0.01) {
        characterRef.current.rotation.y = Math.atan2(dx, dz);
      }
    } else {
      // Idle bobbing
      characterRef.current.position.y = 0.1 + Math.sin(t * 2.5) * 0.06;
    }

    // Walking Limb Animations
    const swing = isMovingRef.current ? Math.sin(t * 9) * 0.55 : Math.sin(t * 1.8) * 0.08;
    if (leftArmRef.current) leftArmRef.current.rotation.x = swing;
    if (rightArmRef.current) rightArmRef.current.rotation.x = -swing;
    if (leftLegRef.current) leftLegRef.current.rotation.x = -swing;
    if (rightLegRef.current) rightLegRef.current.rotation.x = swing;
  });

  return (
    <group ref={characterRef} position={[0, 0.1, 0]}>
      {/* Floating Name Badge */}
      <Html position={[0, 3.4, 0]} center distanceFactor={80} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(10, 20, 29, 0.95)',
          border: `2px solid ${characterStyle.hatColor}`,
          borderRadius: '4px',
          padding: '3px 10px',
          color: '#fff',
          fontFamily: "'Fira Code', monospace",
          fontWeight: 800,
          fontSize: '0.7rem',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <span>{characterStyle.emoji}</span>
          <span>{characterStyle.title}</span>
        </div>
      </Html>

      {/* Head */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.75, 0.75, 0.75]} />
        <meshStandardMaterial color={characterStyle.skinColor} roughness={0.7} />
      </mesh>

      {/* Hat */}
      <mesh position={[0, 2.65, 0]}>
        <boxGeometry args={[0.85, 0.2, 0.85]} />
        <meshStandardMaterial color={characterStyle.hatColor} roughness={0.5} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.18, 2.28, 0.4]}>
        <boxGeometry args={[0.13, 0.1, 0.04]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.18, 2.28, 0.4]}>
        <boxGeometry args={[0.13, 0.1, 0.04]} />
        <meshBasicMaterial color="#1e293b" />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[0.82, 0.95, 0.42]} />
        <meshStandardMaterial color={characterStyle.shirtColor} roughness={0.6} />
      </mesh>

      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.58, 1.72, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.28, 0.85, 0.28]} />
          <meshStandardMaterial color={characterStyle.shirtColor} />
        </mesh>
      </group>

      {/* Right Arm + Held Item */}
      <group ref={rightArmRef} position={[0.58, 1.72, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.28, 0.85, 0.28]} />
          <meshStandardMaterial color={characterStyle.shirtColor} />
        </mesh>
        {characterStyle.item === 'hammer' && (
          <mesh position={[0.1, -0.7, 0.35]} rotation={[Math.PI / 4, 0, 0]}>
            <boxGeometry args={[0.12, 1.0, 0.12]} />
            <meshStandardMaterial color="#fcd34d" metalness={0.8} />
          </mesh>
        )}
        {characterStyle.item === 'staff' && (
          <mesh position={[0.1, -0.2, 0.35]}>
            <cylinderGeometry args={[0.07, 0.07, 1.8, 6]} />
            <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={0.7} />
          </mesh>
        )}
        {characterStyle.item === 'laser' && (
          <mesh position={[0.1, -0.5, 0.4]}>
            <boxGeometry args={[0.22, 0.22, 0.7]} />
            <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.9} />
          </mesh>
        )}
      </group>

      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.2, 0.82, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.3, 0.85, 0.3]} />
          <meshStandardMaterial color={characterStyle.pantsColor} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.2, 0.82, 0]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.3, 0.85, 0.3]} />
          <meshStandardMaterial color={characterStyle.pantsColor} />
        </mesh>
      </group>
    </group>
  );
}
