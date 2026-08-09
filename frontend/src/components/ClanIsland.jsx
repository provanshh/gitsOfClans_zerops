import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Building } from './Building';
import { MinecraftTree } from './Tree';
import { CenterFountain } from './CenterFountain';
import { PRShip } from './PRShip';
import { AgentDrone } from './AgentDrone';
import { AgentCharacter } from './AgentCharacter';

export function ClanIsland({
  clanData,
  clanIndex,
  position,
  selectedBuilding,
  selectedPRShip,
  selectedModel,
  onSelectBuilding,
  onSelectPRShip,
  setHoveredBuilding,
  setHoveredPRShip,
  isLiveConstructing,
  constructionProgress = 1.0
}) {
  const [clanX, clanY, clanZ] = position;

  const rawLayout = clanData?.layout_json || clanData;
  const layout = useMemo(() => {
    if (typeof rawLayout === 'string') {
      try { return JSON.parse(rawLayout); } catch { return {}; }
    }
    return rawLayout || {};
  }, [rawLayout]);

  const buildings = layout?.buildings || clanData?.buildings || [];
  const folderDistricts = layout?.folder_districts || [];
  const readmeFountain = layout?.readme_fountain;
  const prShips = layout?.pr_ships || [];
  const owner = clanData?.owner || layout?.owner || 'Repo';
  const repo = clanData?.repo || layout?.repo || 'City';
  const clanName = `${owner}/${repo}`;

  const maxDistance = useMemo(() => {
    if (buildings.length === 0) return 30;
    let maxD = 30;
    buildings.forEach(b => {
      if (b.position) {
        const d = Math.sqrt(b.position[0] * b.position[0] + b.position[2] * b.position[2]);
        if (d > maxD) maxD = d;
      }
    });
    return maxD + 14;
  }, [buildings]);

  const islandWidth = maxDistance * 2;
  const shipRadius = islandWidth / 2 + 15;

  const maxBuildingHeight = useMemo(() => {
    if (buildings.length === 0) return 12;
    return Math.max(...buildings.map(b => b.height || 10), 12);
  }, [buildings]);

  // Generate perimeter tree positions
  const treePositions = useMemo(() => {
    const trees = [];
    const hw = islandWidth / 2 - 4;
    const step = 6;
    // Place trees around the perimeter on grass patches
    for (let x = -hw; x <= hw; x += step) {
      trees.push([x + (Math.sin(x) * 0.5), 0, -hw]);
      trees.push([x + (Math.cos(x) * 0.5), 0, hw]);
    }
    for (let z = -hw + step; z < hw; z += step) {
      trees.push([-hw, 0, z + (Math.sin(z) * 0.5)]);
      trees.push([hw, 0, z + (Math.cos(z) * 0.5)]);
    }
    // Also scatter some inside grass patches
    const innerCount = Math.floor(buildings.length / 12);
    for (let i = 0; i < innerCount; i++) {
      const angle = (i / innerCount) * Math.PI * 2;
      const r = hw * 0.55 + (Math.sin(i * 2.3) * 5);
      trees.push([
        parseFloat((Math.cos(angle) * r).toFixed(2)),
        0,
        parseFloat((Math.sin(angle) * r).toFixed(2))
      ]);
    }
    return trees.map(([x, y, z]) => [parseFloat(x.toFixed(2)), y, parseFloat(z.toFixed(2))]);
  }, [islandWidth, buildings.length]);

  const prShipPositions = useMemo(() => {
    return prShips.map((_, idx) => {
      const angle = (idx / Math.max(1, prShips.length)) * Math.PI * 1.6 + 0.3;
      return [
        parseFloat((Math.cos(angle) * shipRadius).toFixed(2)),
        0,
        parseFloat((Math.sin(angle) * shipRadius).toFixed(2))
      ];
    });
  }, [prShips, shipRadius]);

  const visibleBuildingCount = isLiveConstructing
    ? Math.max(1, Math.floor(buildings.length * constructionProgress))
    : buildings.length;

  const activeBuildings = buildings.slice(0, visibleBuildingCount);
  const currentTargetBuilding = activeBuildings[activeBuildings.length - 1] || { position: [0, 0, 0] };

  const clanColors = ['#f59e0b', '#00f0ff', '#ff2a85', '#a855f7', '#10b981'];
  const accentColor = clanColors[clanIndex % clanColors.length];

  // Grass checkerboard tiles for variation matching screenshots
  const grassTiles = useMemo(() => {
    const tiles = [];
    const tileSize = 6;
    const half = Math.floor(islandWidth / 2 / tileSize);
    for (let xi = -half; xi <= half; xi++) {
      for (let zi = -half; zi <= half; zi++) {
        const isDark = (xi + zi) % 2 === 0;
        tiles.push({ x: xi * tileSize, z: zi * tileSize, dark: isDark });
      }
    }
    return tiles;
  }, [islandWidth]);

  // Road grid segments
  const roadSegments = useMemo(() => {
    const roads = [];
    const roadSpacing = 12;
    const half = islandWidth / 2 - 4;
    const steps = Math.floor(half / roadSpacing);
    for (let i = -steps; i <= steps; i++) {
      const pos = i * roadSpacing;
      // Horizontal roads (along X)
      roads.push({ x: 0, z: pos, rotY: 0, w: islandWidth - 6, d: 2.5 });
      // Vertical roads (along Z)
      roads.push({ x: pos, z: 0, rotY: 0, w: 2.5, d: islandWidth - 6 });
    }
    return roads;
  }, [islandWidth]);

  return (
    <group position={[clanX, clanY, clanZ]}>
      {/* 1. Sandy/dirt border foundation */}
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <boxGeometry args={[islandWidth + 4, 1.2, islandWidth + 4]} />
        <meshStandardMaterial color="#b5874a" roughness={0.95} />
      </mesh>

      {/* 2. Dirt underlayer */}
      <mesh position={[0, -0.35, 0]} receiveShadow>
        <boxGeometry args={[islandWidth + 1, 0.7, islandWidth + 1]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>

      {/* 3. Grass tiles (checkerboard for pixel art look) */}
      {grassTiles.map((tile, idx) => (
        <mesh key={`grass-${idx}`} position={[tile.x, 0.01, tile.z]} receiveShadow>
          <boxGeometry args={[5.95, 0.15, 5.95]} />
          <meshStandardMaterial
            color={tile.dark ? '#3d9c23' : '#4ab02a'}
            roughness={0.75}
          />
        </mesh>
      ))}

      {/* 4. Road grid - gray cobblestone paths */}
      {roadSegments.map((road, idx) => (
        <mesh key={`road-${idx}`} position={[road.x, 0.12, road.z]} receiveShadow>
          <boxGeometry args={[road.w, 0.08, road.d]} />
          <meshStandardMaterial color="#8e9aad" roughness={0.95} metalness={0.05} />
        </mesh>
      ))}

      {/* Road lane markings (dashed white) */}
      {roadSegments.filter((_, i) => i % 4 === 0).map((road, idx) => (
        <mesh key={`marking-${idx}`} position={[road.x, 0.21, road.z]}>
          <boxGeometry args={[road.w * 0.15, 0.02, road.d * 0.015]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      ))}

      {/* 5. Folder District Ground Outlines */}
      {folderDistricts.map((district) => (
        <group key={district.id} position={district.center}>
          <Html position={[0, 6, 0]} center distanceFactor={90} style={{ pointerEvents: 'none' }}>
            <div style={{
              background: 'rgba(10, 20, 29, 0.92)',
              border: `1px solid ${accentColor}`,
              borderRadius: '3px',
              padding: '3px 10px',
              color: '#e2e8f0',
              fontFamily: "'Fira Code', monospace",
              fontWeight: 700,
              fontSize: '0.72rem',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}>
              📁 {district.folderName} ({district.fileCount})
            </div>
          </Html>
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[13, 0.06, 13]} />
            <meshStandardMaterial color="#2d3748" transparent opacity={0.25} />
          </mesh>
        </group>
      ))}

      {/* 6. Center Fountain (README.md) */}
      <CenterFountain
        readmeData={{ ...(readmeFountain || {}), cityId: clanData.id || clanIndex }}
        isSelected={selectedBuilding?.isReadmeFountain && selectedBuilding?.cityId === (clanData.id || clanIndex)}
        onSelectBuilding={onSelectBuilding}
        setHoveredBuilding={setHoveredBuilding}
      />

      {/* 7. Buildings */}
      {activeBuildings.map((b) => (
        <Building
          key={`${clanData.id || clanIndex}-${b.id}`}
          building={{ ...b, clanName, cityId: clanData.id || clanIndex }}
          isSelected={
            selectedBuilding?.cityId === (clanData.id || clanIndex) &&
            selectedBuilding?.id === b.id
          }
          onSelectBuilding={onSelectBuilding}
          setHoveredBuilding={setHoveredBuilding}
        />
      ))}

      {/* 8. Perimeter Trees */}
      {treePositions.map((pos, idx) => (
        <MinecraftTree key={idx} position={pos} />
      ))}

      {/* 9. PR Ships in ocean */}
      {prShips.map((pr, idx) => (
        <PRShip
          key={pr.id || idx}
          pr={pr}
          position={prShipPositions[idx] || [25, 0, 25]}
          isSelected={selectedPRShip?.id === pr.id}
          onSelectPRShip={onSelectPRShip}
          setHoveredPRShip={setHoveredPRShip}
        />
      ))}

      {/* 10. Live Construction Drone */}
      {isLiveConstructing && currentTargetBuilding && (
        <AgentDrone
          targetPosition={currentTargetBuilding.position}
          agentName="Builder Drone #1"
          color="#00f0ff"
        />
      )}

      {/* 11. Walking Agent Character */}
      <AgentCharacter
        modelName={selectedModel}
        targetPosition={currentTargetBuilding.position || [0, 0, 0]}
      />

      {/* 12. Floating Clan Name Banner */}
      <Html position={[0, maxBuildingHeight + 12, 0]} center distanceFactor={120} style={{ pointerEvents: 'none' }}>
        <div style={{
          background: 'rgba(10, 20, 29, 0.95)',
          border: `2px solid ${accentColor}`,
          borderRadius: '4px',
          padding: '6px 16px',
          color: '#ffffff',
          fontFamily: "'Fira Code', monospace",
          fontWeight: 900,
          fontSize: '0.85rem',
          whiteSpace: 'nowrap',
          boxShadow: `0 0 20px ${accentColor}88`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          pointerEvents: 'none',
          letterSpacing: '1px'
        }}>
          <span style={{ color: accentColor }}>🛡️</span>
          <span>{clanName.toUpperCase()} CLAN</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
            {buildings.length} structures
          </span>
        </div>
      </Html>
    </group>
  );
}
