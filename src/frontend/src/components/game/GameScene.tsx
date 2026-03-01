import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { LANE_X, useGameStore } from "../../store/gameStore";

// ---- Constants ----
const TRACK_WIDTH = 7;
const TRACK_HEIGHT = 5;
const SEGMENT_LENGTH = 30;
const LOOK_AHEAD = 120;
const PLAYER_Z = 2;

// ---- Player Component ----
function Player() {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const playerLane = useGameStore((s) => s.playerLane);
  const playerJumping = useGameStore((s) => s.playerJumping);
  const jumpProgress = useGameStore((s) => s.jumpProgress);
  const playerSliding = useGameStore((s) => s.playerSliding);
  const playerInvincible = useGameStore((s) => s.playerInvincible);
  const activePowerUp = useGameStore((s) => s.activePowerUp);

  const targetX = LANE_X[playerLane];

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Smooth lane transition
    meshRef.current.position.x = THREE.MathUtils.lerp(
      meshRef.current.position.x,
      targetX,
      Math.min(1, delta * 12),
    );

    // Jump arc
    if (playerJumping) {
      const arc = Math.sin(jumpProgress * Math.PI);
      meshRef.current.position.y = 0.6 + arc * 2.2;
    } else if (playerSliding) {
      meshRef.current.position.y = -0.2;
    } else {
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        0.6,
        Math.min(1, delta * 15),
      );
    }

    // Lean on lane change
    const laneX = LANE_X[playerLane];
    const lean = (meshRef.current.position.x - laneX) * 0.3;
    meshRef.current.rotation.z = THREE.MathUtils.lerp(
      meshRef.current.rotation.z,
      lean,
      Math.min(1, delta * 8),
    );

    // Glow color based on power-up
    if (glowRef.current) {
      if (playerInvincible) {
        glowRef.current.color.set(0x00aaff);
        glowRef.current.intensity = 3 + Math.sin(Date.now() * 0.005) * 1;
      } else if (activePowerUp === "boost") {
        glowRef.current.color.set(0xff6600);
        glowRef.current.intensity = 2.5;
      } else if (activePowerUp === "magnet") {
        glowRef.current.color.set(0x00ffcc);
        glowRef.current.intensity = 2;
      } else {
        glowRef.current.color.set(0x00e5ff);
        glowRef.current.intensity = 1.5;
      }
    }
  });

  const bodyScale = playerSliding ? [0.7, 0.5, 0.5] : [0.7, 1.1, 0.5];
  const emissiveColor = playerInvincible
    ? new THREE.Color(0x0088ff)
    : activePowerUp === "boost"
      ? new THREE.Color(0xff4400)
      : new THREE.Color(0x00e5ff);

  return (
    <group ref={meshRef} position={[0, 0.6, PLAYER_Z]}>
      {/* Body */}
      <mesh scale={bodyScale as [number, number, number]} castShadow>
        <capsuleGeometry args={[0.35, 0.7, 6, 12]} />
        <meshStandardMaterial
          color={0x001122}
          emissive={emissiveColor}
          emissiveIntensity={playerInvincible ? 2.5 : 1.2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Helmet visor */}
      <mesh position={[0, 0.5, 0.2]}>
        <sphereGeometry args={[0.28, 12, 12]} />
        <meshStandardMaterial
          color={0x001133}
          emissive={emissiveColor}
          emissiveIntensity={2}
          transparent
          opacity={0.7}
          metalness={1}
          roughness={0}
        />
      </mesh>

      {/* Tank */}
      <mesh position={[0, 0, -0.35]}>
        <cylinderGeometry args={[0.12, 0.12, 0.6, 8]} />
        <meshStandardMaterial
          color={0x002244}
          emissive={new THREE.Color(0x004488)}
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Shield bubble when invincible */}
      {playerInvincible && (
        <mesh>
          <sphereGeometry args={[1.1, 16, 16]} />
          <meshStandardMaterial
            color={0x0044ff}
            emissive={new THREE.Color(0x0022ff)}
            emissiveIntensity={0.5}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Point light for glow */}
      <pointLight
        ref={glowRef}
        color={0x00e5ff}
        intensity={1.5}
        distance={4}
        decay={2}
      />
    </group>
  );
}

// ---- Track Segment ----
function TrackSegment({ zOffset }: { zOffset: number }) {
  const floorLineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.4,
      }),
    [],
  );

  const wallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x050a1a,
        emissive: new THREE.Color(0x001a3a),
        emissiveIntensity: 0.3,
        metalness: 0.6,
        roughness: 0.4,
      }),
    [],
  );

  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x020810,
        emissive: new THREE.Color(0x001020),
        emissiveIntensity: 0.2,
        metalness: 0.4,
        roughness: 0.8,
      }),
    [],
  );

  const ceilMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: 0x030a18,
        emissive: new THREE.Color(0x000815),
        emissiveIntensity: 0.2,
        metalness: 0.3,
        roughness: 0.9,
      }),
    [],
  );

  const z = -zOffset - SEGMENT_LENGTH / 2;

  // Lane line positions
  const laneLineGeom = useMemo(() => {
    const points = [
      new THREE.Vector3(0, -1.9, -SEGMENT_LENGTH / 2),
      new THREE.Vector3(0, -1.9, SEGMENT_LENGTH / 2),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  return (
    <group position={[0, 0, z]}>
      {/* Floor */}
      <mesh receiveShadow material={floorMat}>
        <boxGeometry args={[TRACK_WIDTH, 0.15, SEGMENT_LENGTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>
      <mesh position={[0, -2 + 0.075, 0]} receiveShadow>
        <boxGeometry args={[TRACK_WIDTH, 0.15, SEGMENT_LENGTH]} />
        <primitive object={floorMat} attach="material" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, TRACK_HEIGHT / 2, 0]}>
        <boxGeometry args={[TRACK_WIDTH, 0.15, SEGMENT_LENGTH]} />
        <primitive object={ceilMat} attach="material" />
      </mesh>

      {/* Left wall */}
      <mesh position={[-TRACK_WIDTH / 2 - 0.075, TRACK_HEIGHT / 4, 0]}>
        <boxGeometry args={[0.15, TRACK_HEIGHT, SEGMENT_LENGTH]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Right wall */}
      <mesh position={[TRACK_WIDTH / 2 + 0.075, TRACK_HEIGHT / 4, 0]}>
        <boxGeometry args={[0.15, TRACK_HEIGHT, SEGMENT_LENGTH]} />
        <primitive object={wallMat} attach="material" />
      </mesh>

      {/* Lane dividers (glowing lines on floor) */}
      {[-1, 1].map((laneOffset) => (
        <lineSegments
          key={laneOffset}
          position={[laneOffset * 2.33, -1.85, 0]}
          material={floorLineMaterial}
        >
          <primitive object={laneLineGeom} attach="geometry" />
        </lineSegments>
      ))}

      {/* Neon edge strips on walls */}
      <mesh position={[-TRACK_WIDTH / 2 + 0.1, -1.4, 0]}>
        <boxGeometry args={[0.05, 0.05, SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={0x000a20}
          emissive={new THREE.Color(0x006699)}
          emissiveIntensity={3}
        />
      </mesh>
      <mesh position={[TRACK_WIDTH / 2 - 0.1, -1.4, 0]}>
        <boxGeometry args={[0.05, 0.05, SEGMENT_LENGTH]} />
        <meshStandardMaterial
          color={0x000a20}
          emissive={new THREE.Color(0x660099)}
          emissiveIntensity={3}
        />
      </mesh>

      {/* Background architecture ruins */}
      {[0, 1, 2, 3].map((i) => (
        <group
          key={i}
          position={[
            (i % 2 === 0 ? -1 : 1) * (TRACK_WIDTH / 2 + 3 + (i % 3) * 2),
            0,
            -SEGMENT_LENGTH / 2 + i * 7.5,
          ]}
        >
          <mesh>
            <boxGeometry args={[1.5, 4 + (i % 3), 1.5]} />
            <meshStandardMaterial
              color={0x020610}
              emissive={new THREE.Color(i % 2 === 0 ? 0x003355 : 0x220044)}
              emissiveIntensity={0.4}
              metalness={0.5}
              roughness={0.7}
            />
          </mesh>
          {/* Neon window strips */}
          <mesh position={[0, 0.5 + (i % 2) * 1, 0.76]}>
            <planeGeometry args={[0.3, 0.2]} />
            <meshStandardMaterial
              color={0x000000}
              emissive={
                new THREE.Color(
                  i % 3 === 0 ? 0x00ccff : i % 3 === 1 ? 0xff00aa : 0x8800ff,
                )
              }
              emissiveIntensity={4}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---- Obstacle Renderer ----
function ObstacleRenderer() {
  const obstacles = useGameStore((s) => s.obstacles);

  return (
    <>
      {obstacles.map((obs) => {
        const x = LANE_X[obs.lane] || 0;
        const z = -obs.z;

        if (obs.type === "pressureGate") {
          const isJumpGate = obs.height === "jump";
          return (
            <group key={obs.id} position={[0, 0, z]}>
              {/* Gate frame */}
              <mesh position={[0, 1.2, 0]}>
                <boxGeometry args={[TRACK_WIDTH - 0.2, 0.15, 0.3]} />
                <meshStandardMaterial
                  color={0x100005}
                  emissive={new THREE.Color(0xff0055)}
                  emissiveIntensity={2}
                />
              </mesh>
              {/* Blocked lane indicator */}
              <mesh position={[x, isJumpGate ? 0.1 : 1.8, 0]}>
                <boxGeometry args={[1.8, isJumpGate ? 0.5 : 1.2, 0.3]} />
                <meshStandardMaterial
                  color={0x200000}
                  emissive={new THREE.Color(0xff2200)}
                  emissiveIntensity={1.5}
                  transparent
                  opacity={0.85}
                />
              </mesh>
              {/* Warning text indicator */}
              <pointLight
                color={0xff0055}
                intensity={2}
                distance={5}
                position={[0, 1.5, 0]}
              />
            </group>
          );
        }

        if (obs.type === "anglerfish") {
          return (
            <group key={obs.id} position={[x, 0, z]}>
              {/* Body */}
              <mesh position={[0, 0.5, 0]}>
                <sphereGeometry args={[0.6, 10, 10]} />
                <meshStandardMaterial
                  color={0x0a0505}
                  emissive={new THREE.Color(0x440022)}
                  emissiveIntensity={0.8}
                  metalness={0.3}
                  roughness={0.6}
                />
              </mesh>
              {/* Lure light */}
              <mesh position={[0, 1.4, 0.3]}>
                <sphereGeometry args={[0.12, 8, 8]} />
                <meshStandardMaterial
                  color={0x00ff88}
                  emissive={new THREE.Color(0x00ff88)}
                  emissiveIntensity={5}
                />
              </mesh>
              <pointLight
                color={0x00ff88}
                intensity={3}
                distance={4}
                position={[0, 1.4, 0.3]}
              />
              {/* Teeth spikes */}
              {[-0.3, 0, 0.3].map((tx) => (
                <mesh
                  key={tx}
                  position={[tx, -0.1, 0.5]}
                  rotation={[0.3, 0, 0]}
                >
                  <coneGeometry args={[0.06, 0.3, 4]} />
                  <meshStandardMaterial
                    color={0xffffff}
                    emissive={new THREE.Color(0x888888)}
                    emissiveIntensity={0.5}
                  />
                </mesh>
              ))}
            </group>
          );
        }

        if (obs.type === "coralColumn") {
          return (
            <group key={obs.id} position={[x, 0, z]}>
              <mesh position={[0, 1.5, 0]}>
                <cylinderGeometry args={[0.45, 0.55, 3.5, 8]} />
                <meshStandardMaterial
                  color={0x050015}
                  emissive={new THREE.Color(0x8800ff)}
                  emissiveIntensity={1.2}
                  metalness={0.2}
                  roughness={0.7}
                />
              </mesh>
              {/* Coral fronds */}
              {[-0.2, 0.2].map((cx) => (
                <mesh
                  key={cx}
                  position={[cx, 2.8, 0.2]}
                  rotation={[0.4, cx * 2, 0]}
                >
                  <coneGeometry args={[0.15, 0.8, 5]} />
                  <meshStandardMaterial
                    color={0x000515}
                    emissive={new THREE.Color(0x4400cc)}
                    emissiveIntensity={2}
                  />
                </mesh>
              ))}
              <pointLight
                color={0x8800ff}
                intensity={2}
                distance={5}
                position={[0, 2, 0]}
              />
            </group>
          );
        }

        if (obs.type === "currentBurst") {
          return (
            <group key={obs.id} position={[x, 0.5, z]}>
              {/* Shockwave disc */}
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[1.8, 0.15, 8, 32]} />
                <meshStandardMaterial
                  color={0x001520}
                  emissive={new THREE.Color(0x00ccff)}
                  emissiveIntensity={3}
                  transparent
                  opacity={0.9}
                />
              </mesh>
              <mesh rotation={[0, 0, Math.PI / 2]}>
                <torusGeometry args={[1.2, 0.08, 8, 32]} />
                <meshStandardMaterial
                  color={0x001520}
                  emissive={new THREE.Color(0x00ffee)}
                  emissiveIntensity={2}
                  transparent
                  opacity={0.7}
                />
              </mesh>
              <pointLight color={0x00ccff} intensity={4} distance={6} />
            </group>
          );
        }

        if (obs.type === "minecluster") {
          return (
            <group key={obs.id} position={[x, 1.2, z]}>
              {/* Central mine */}
              <mesh>
                <sphereGeometry args={[0.5, 10, 10]} />
                <meshStandardMaterial
                  color={0x0a0a00}
                  emissive={new THREE.Color(0xaa6600)}
                  emissiveIntensity={1.5}
                  metalness={0.9}
                  roughness={0.2}
                />
              </mesh>
              {/* Spikes */}
              {[
                [0, 0.6, 0],
                [0, -0.6, 0],
                [0.6, 0, 0],
                [-0.6, 0, 0],
                [0, 0, 0.6],
              ].map(([sx, sy, sz]) => (
                <mesh
                  key={`${sx}-${sy}-${sz}`}
                  position={[sx, sy, sz]}
                  rotation={[
                    sy !== 0 ? Math.PI / 2 : 0,
                    0,
                    sx !== 0 ? Math.PI / 2 : 0,
                  ]}
                >
                  <coneGeometry args={[0.07, 0.4, 4]} />
                  <meshStandardMaterial
                    color={0x151500}
                    emissive={new THREE.Color(0xff8800)}
                    emissiveIntensity={2}
                  />
                </mesh>
              ))}
              <pointLight color={0xff6600} intensity={2} distance={4} />
            </group>
          );
        }

        return null;
      })}
    </>
  );
}

// ---- Coin Renderer ----
function CoinRenderer() {
  const coinItems = useGameStore((s) => s.coinItems);
  const collectCoin = useGameStore((s) => s.collectCoin);
  const playerLane = useGameStore((s) => s.playerLane);
  const magnetActive = useGameStore((s) => s.magnetActive);

  return (
    <>
      {coinItems
        .filter((c) => !c.collected)
        .map((coin) => {
          const x = LANE_X[coin.lane];
          const z = -coin.z;
          const y = 0.6 + Math.sin(Date.now() * 0.002 + coin.z) * 0.15;

          // Check collection
          const playerX = LANE_X[playerLane];
          const dx = Math.abs(x - playerX);
          const dz = Math.abs(coin.z);
          const magnetRange = magnetActive ? 4 : 1.2;

          if (dz < magnetRange && dx < magnetRange) {
            collectCoin(coin.id);
          }

          return (
            <group key={coin.id} position={[x, y, z]}>
              <mesh rotation={[Math.PI / 2, Date.now() * 0.002, 0]}>
                <torusGeometry args={[0.25, 0.08, 8, 16]} />
                <meshStandardMaterial
                  color={0x100800}
                  emissive={new THREE.Color(0xffcc00)}
                  emissiveIntensity={3}
                />
              </mesh>
              <pointLight color={0xffcc00} intensity={1} distance={2} />
            </group>
          );
        })}
    </>
  );
}

// ---- Vent Token Renderer ----
function VentTokenRenderer() {
  const ventTokens = useGameStore((s) => s.ventTokens);
  const collectVentToken = useGameStore((s) => s.collectVentToken);
  const playerLane = useGameStore((s) => s.playerLane);

  return (
    <>
      {ventTokens
        .filter((v) => !v.collected)
        .map((token) => {
          const x = LANE_X[token.lane];
          const z = -token.z;

          const playerX = LANE_X[playerLane];
          const dx = Math.abs(x - playerX);
          const dz = Math.abs(token.z);
          if (dz < 1.5 && dx < 1.5) {
            collectVentToken(token.id);
          }

          return (
            <group key={token.id} position={[x, 0.8, z]}>
              <mesh rotation={[0, Date.now() * 0.001, 0]}>
                <octahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                  color={0x001510}
                  emissive={new THREE.Color(0x00ff88)}
                  emissiveIntensity={3}
                />
              </mesh>
              <pointLight color={0x00ff88} intensity={1.5} distance={3} />
            </group>
          );
        })}
    </>
  );
}

// ---- Power-Up Renderer ----
function PowerUpRenderer() {
  const powerUpItems = useGameStore((s) => s.powerUpItems);
  const collectPowerUp = useGameStore((s) => s.collectPowerUp);
  const playerLane = useGameStore((s) => s.playerLane);

  const colors: Record<string, number> = {
    magnet: 0x00ffcc,
    shield: 0x0088ff,
    boost: 0xff6600,
  };

  return (
    <>
      {powerUpItems
        .filter((p) => !p.collected)
        .map((pu) => {
          const x = LANE_X[pu.lane];
          const z = -pu.z;
          const color = colors[pu.type];

          const playerX = LANE_X[playerLane];
          const dx = Math.abs(x - playerX);
          const dz = Math.abs(pu.z);
          if (dz < 1.5 && dx < 1.5) {
            collectPowerUp(pu.id, pu.type);
          }

          return (
            <group key={pu.id} position={[x, 1.2, z]}>
              {/* Outer glow ring */}
              <mesh rotation={[0, Date.now() * 0.002, 0]}>
                <torusGeometry args={[0.5, 0.06, 8, 24]} />
                <meshStandardMaterial
                  color={0x000000}
                  emissive={new THREE.Color(color)}
                  emissiveIntensity={3}
                />
              </mesh>
              {/* Inner icon */}
              <mesh>
                <icosahedronGeometry args={[0.3, 0]} />
                <meshStandardMaterial
                  color={0x000000}
                  emissive={new THREE.Color(color)}
                  emissiveIntensity={4}
                />
              </mesh>
              <pointLight color={color} intensity={2} distance={4} />
            </group>
          );
        })}
    </>
  );
}

// ---- Bubble Particles ----
function BubbleParticles() {
  const particlesRef = useRef<THREE.Points>(null);

  const particleData = useMemo(() => {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 5 - 2;
      positions[i * 3 + 2] = Math.random() * -80;
      velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      velocities[i * 3 + 1] = Math.random() * 0.02 + 0.005;
      velocities[i * 3 + 2] = 0;
    }
    return { positions, velocities };
  }, []);

  useFrame((_, delta) => {
    if (!particlesRef.current) return;
    const positions = particlesRef.current.geometry.attributes.position;
    if (!positions) return;
    const arr = positions.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      arr[i * 3] += particleData.velocities[i * 3];
      arr[i * 3 + 1] += particleData.velocities[i * 3 + 1] * delta * 60;
      if (arr[i * 3 + 1] > 3) {
        arr[i * 3 + 1] = -2;
        arr[i * 3] = (Math.random() - 0.5) * 8;
      }
    }
    positions.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.BufferAttribute(particleData.positions, 3),
    );
    return geo;
  }, [particleData]);

  return (
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        color={0x00e5ff}
        size={0.06}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// ---- Collision Detection ----
function CollisionSystem() {
  const obstacles = useGameStore((s) => s.obstacles);
  const playerLane = useGameStore((s) => s.playerLane);
  const playerJumping = useGameStore((s) => s.playerJumping);
  const jumpProgress = useGameStore((s) => s.jumpProgress);
  const playerSliding = useGameStore((s) => s.playerSliding);
  const triggerCollision = useGameStore((s) => s.triggerCollision);
  const playerInvincible = useGameStore((s) => s.playerInvincible);
  const gameRunning = useGameStore((s) => s.gameRunning);

  useFrame(() => {
    if (!gameRunning || playerInvincible) return;

    const playerX = LANE_X[playerLane];
    const playerY = playerJumping
      ? 0.6 + Math.sin(jumpProgress * Math.PI) * 2.2
      : playerSliding
        ? 0.2
        : 0.6;

    for (const obs of obstacles) {
      const obsX = LANE_X[obs.lane] || 0;
      const dz = Math.abs(obs.z); // proximity in Z (obs.z goes toward 0)
      if (dz > 2.0 || dz < 0.2) continue;

      const dx = Math.abs(playerX - obsX);
      if (dx > 1.6) continue;

      // Height checks
      if (obs.type === "pressureGate") {
        if (obs.height === "jump") {
          // Must jump over
          if (playerY < 1.2 && !playerJumping) {
            triggerCollision();
            break;
          }
        } else {
          // Must slide under
          if (playerY > 0.5 && !playerSliding) {
            triggerCollision();
            break;
          }
        }
      } else if (obs.type === "minecluster") {
        // Can jump over or slide under
        if (playerY > 0.5 && playerY < 2.0) {
          triggerCollision();
          break;
        }
      } else if (obs.type === "coralColumn") {
        // Must switch lanes
        triggerCollision();
        break;
      } else if (obs.type === "anglerfish") {
        // Moving - just being in same lane when close
        triggerCollision();
        break;
      } else if (obs.type === "currentBurst") {
        // Horizontal shockwave - must jump over
        if (playerY < 1.8 && !playerJumping) {
          triggerCollision();
          break;
        }
      }
    }
  });

  return null;
}

// ---- Camera Controller ----
function CameraController() {
  const { camera } = useThree();
  const distance = useGameStore((s) => s.distance);
  const speed = useGameStore((s) => s.speed);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Subtle underwater bob
    camera.position.y = 1.8 + Math.sin(t * 0.7) * 0.08;
    camera.position.x = Math.sin(t * 0.4) * 0.05;
    camera.position.z = PLAYER_Z + 6;
    camera.lookAt(0, 0.8, 0);

    // Slight tilt based on speed (going deeper feel)
    const depth = Math.min(distance / 5000, 0.08);
    camera.rotation.z = Math.sin(t * 0.3) * 0.008;
    void depth;
  });

  void speed;
  return null;
}

// ---- Track Generator ----
function TrackGenerator() {
  const distance = useGameStore((s) => s.distance);
  const spawnSegment = useGameStore((s) => s.spawnSegment);
  const lastSpawnZ = useRef(0);

  useFrame(() => {
    // Spawn new segments ahead
    const playerZ = distance;
    if (playerZ + LOOK_AHEAD > lastSpawnZ.current) {
      const newZ = lastSpawnZ.current + SEGMENT_LENGTH;
      lastSpawnZ.current = newZ;
      spawnSegment(newZ + LOOK_AHEAD);
    }
  });

  // Pre-generate initial segments
  const segments = useMemo(() => {
    const segs: number[] = [];
    for (let i = 0; i < Math.ceil(LOOK_AHEAD / SEGMENT_LENGTH) + 1; i++) {
      segs.push(i * SEGMENT_LENGTH);
    }
    return segs;
  }, []);

  return (
    <>
      {segments.map((offset) => (
        <TrackSegment key={offset} zOffset={offset} />
      ))}
    </>
  );
}

// ---- Game Loop ----
function GameLoop() {
  const tick = useGameStore((s) => s.tick);
  const gameRunning = useGameStore((s) => s.gameRunning);

  useFrame((_, delta) => {
    if (gameRunning) {
      tick(Math.min(delta, 0.05)); // cap delta to prevent huge jumps
    }
  });

  return null;
}

// ---- Main Scene ----
export function GameScene() {
  const gameRunning = useGameStore((s) => s.gameRunning);

  return (
    <>
      {/* Ambient underwater lighting */}
      <ambientLight color={0x001122} intensity={0.4} />
      <directionalLight
        color={0x002244}
        intensity={0.6}
        position={[0, 5, 5]}
        castShadow
      />
      {/* Distant neon glow light */}
      <pointLight
        color={0x00e5ff}
        intensity={0.5}
        distance={30}
        position={[0, 3, -20]}
      />
      <pointLight
        color={0xff00aa}
        intensity={0.3}
        distance={25}
        position={[-4, 2, -40]}
      />
      <pointLight
        color={0x8800ff}
        intensity={0.3}
        distance={25}
        position={[4, 2, -60]}
      />

      {/* Fog for depth */}
      <fog attach="fog" args={[0x000814, 15, 80]} />

      <GameLoop />
      <CameraController />
      <TrackGenerator />
      <BubbleParticles />

      {gameRunning && (
        <>
          <Player />
          <ObstacleRenderer />
          <CoinRenderer />
          <VentTokenRenderer />
          <PowerUpRenderer />
          <CollisionSystem />
        </>
      )}
    </>
  );
}
