import { create } from "zustand";

export type GameScreen = "menu" | "playing" | "gameover" | "leaderboard";
export type Lane = -1 | 0 | 1;
export type PowerUpType = "magnet" | "shield" | "boost" | null;

export interface Obstacle {
  id: string;
  type:
    | "pressureGate"
    | "anglerfish"
    | "coralColumn"
    | "currentBurst"
    | "minecluster";
  z: number;
  lane: Lane;
  lanes?: Lane[]; // for multi-lane obstacles
  moveDir?: 1 | -1;
  height?: "jump" | "slide" | "both"; // for gates
  speed?: number;
}

export interface Coin {
  id: string;
  z: number;
  lane: Lane;
  collected: boolean;
}

export interface VentToken {
  id: string;
  z: number;
  lane: Lane;
  collected: boolean;
}

export interface PowerUpItem {
  id: string;
  type: "magnet" | "shield" | "boost";
  z: number;
  lane: Lane;
  collected: boolean;
}

export interface GameState {
  screen: GameScreen;
  playerLane: Lane;
  playerJumping: boolean;
  playerSliding: boolean;
  playerInvincible: boolean; // from shield
  jumpProgress: number; // 0-1 arc
  distance: number;
  coins: number;
  pressure: number; // 0-100
  pressureWarning: 0 | 1 | 2 | 3; // 0=none, 1-3=warning stages
  speed: number;
  baseSpeed: number;
  milestone: number; // last milestone hit (in 500s)
  showMilestone: boolean;
  milestoneText: string;
  obstacles: Obstacle[];
  coinItems: Coin[];
  ventTokens: VentToken[];
  powerUpItems: PowerUpItem[];
  activePowerUp: PowerUpType;
  powerUpTimeLeft: number;
  coinMultiplier: number;
  magnetActive: boolean;
  gameRunning: boolean;
  playerName: string;
  lastScore: number;
  lastDistance: number;
  lastCoins: number;
  // Swipe tracking
  touchStartX: number;
  touchStartY: number;
}

export interface GameActions {
  setScreen: (screen: GameScreen) => void;
  moveLeft: () => void;
  moveRight: () => void;
  jump: () => void;
  slide: () => void;
  tick: (delta: number) => void;
  collectCoin: (id: string) => void;
  collectVentToken: (id: string) => void;
  collectPowerUp: (id: string, type: PowerUpType) => void;
  triggerCollision: () => void;
  spawnSegment: (z: number) => void;
  setPlayerName: (name: string) => void;
  restartGame: () => void;
  setTouchStart: (x: number, y: number) => void;
  handleTouchEnd: (x: number, y: number) => void;
}

const LANE_POSITIONS: Record<Lane, number> = { [-1]: -2, 0: 0, 1: 2 };
const INITIAL_SPEED = 8;
const SPEED_INCREMENT = 1.5;
const OBSTACLE_TYPES: Obstacle["type"][] = [
  "pressureGate",
  "anglerfish",
  "coralColumn",
  "currentBurst",
  "minecluster",
];

let idCounter = 0;
const genId = () => `${++idCounter}_${Date.now()}`;

function randomLane(): Lane {
  const r = Math.random();
  if (r < 0.33) return -1;
  if (r < 0.67) return 0;
  return 1;
}

function spawnObstacle(z: number, speedMultiplier: number): Obstacle {
  const type =
    OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  const lane = randomLane();
  const base: Obstacle = {
    id: genId(),
    type,
    z,
    lane,
  };

  switch (type) {
    case "pressureGate":
      return { ...base, height: Math.random() > 0.5 ? "jump" : "slide" };
    case "anglerfish":
      return { ...base, lane: -1, moveDir: 1, speed: 3 + speedMultiplier };
    case "coralColumn":
      return { ...base };
    case "currentBurst":
      return { ...base, lane: -1, moveDir: 1, speed: 5 + speedMultiplier };
    case "minecluster":
      return {
        ...base,
        lane: 0,
        moveDir: Math.random() > 0.5 ? 1 : -1,
        speed: 1 + speedMultiplier * 0.5,
      };
    default:
      return base;
  }
}

function spawnCoins(z: number): Coin[] {
  const count = Math.floor(Math.random() * 3) + 1;
  const lane = randomLane();
  return Array.from({ length: count }, (_, i) => ({
    id: genId(),
    z: z - i * 3,
    lane,
    collected: false,
  }));
}

function spawnPowerUp(z: number): PowerUpItem | null {
  if (Math.random() > 0.15) return null;
  const types: NonNullable<PowerUpType>[] = ["magnet", "shield", "boost"];
  return {
    id: genId(),
    type: types[Math.floor(Math.random() * types.length)],
    z,
    lane: randomLane(),
    collected: false,
  };
}

function spawnVentToken(z: number): VentToken | null {
  if (Math.random() > 0.2) return null;
  return {
    id: genId(),
    z,
    lane: randomLane(),
    collected: false,
  };
}

export const LANE_X = LANE_POSITIONS;

const initialState: GameState = {
  screen: "menu",
  playerLane: 0,
  playerJumping: false,
  playerSliding: false,
  playerInvincible: false,
  jumpProgress: 0,
  distance: 0,
  coins: 0,
  pressure: 0,
  pressureWarning: 0,
  speed: INITIAL_SPEED,
  baseSpeed: INITIAL_SPEED,
  milestone: 0,
  showMilestone: false,
  milestoneText: "",
  obstacles: [],
  coinItems: [],
  ventTokens: [],
  powerUpItems: [],
  activePowerUp: null,
  powerUpTimeLeft: 0,
  coinMultiplier: 1,
  magnetActive: false,
  gameRunning: false,
  playerName: "DIVER",
  lastScore: 0,
  lastDistance: 0,
  lastCoins: 0,
  touchStartX: 0,
  touchStartY: 0,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setScreen: (screen) => set({ screen }),

  setPlayerName: (name) => set({ playerName: name }),

  moveLeft: () => {
    const { playerLane, gameRunning } = get();
    if (!gameRunning) return;
    if (playerLane > -1) set({ playerLane: (playerLane - 1) as Lane });
  },

  moveRight: () => {
    const { playerLane, gameRunning } = get();
    if (!gameRunning) return;
    if (playerLane < 1) set({ playerLane: (playerLane + 1) as Lane });
  },

  jump: () => {
    const { playerJumping, playerSliding, gameRunning } = get();
    if (!gameRunning || playerJumping || playerSliding) return;
    set({ playerJumping: true, jumpProgress: 0 });
  },

  slide: () => {
    const { playerJumping, playerSliding, gameRunning } = get();
    if (!gameRunning || playerJumping || playerSliding) return;
    set({ playerSliding: true });
    setTimeout(() => {
      set({ playerSliding: false });
    }, 700);
  },

  collectCoin: (id) => {
    const { coinItems, coins, coinMultiplier } = get();
    const coin = coinItems.find((c) => c.id === id);
    if (!coin || coin.collected) return;
    set({
      coinItems: coinItems.map((c) =>
        c.id === id ? { ...c, collected: true } : c,
      ),
      coins: coins + coinMultiplier,
    });
  },

  collectVentToken: (id) => {
    const { ventTokens, pressure } = get();
    const token = ventTokens.find((t) => t.id === id);
    if (!token || token.collected) return;
    const newPressure = Math.max(0, pressure - 20);
    const warning =
      newPressure > 80 ? 3 : newPressure > 55 ? 2 : newPressure > 30 ? 1 : 0;
    set({
      ventTokens: ventTokens.map((t) =>
        t.id === id ? { ...t, collected: true } : t,
      ),
      pressure: newPressure,
      pressureWarning: warning as 0 | 1 | 2 | 3,
    });
  },

  collectPowerUp: (id, type) => {
    const { powerUpItems } = get();
    if (!type) return;
    const item = powerUpItems.find((p) => p.id === id);
    if (!item || item.collected) return;

    const durations: Record<NonNullable<PowerUpType>, number> = {
      magnet: 10,
      shield: 5,
      boost: 4,
    };

    set({
      powerUpItems: powerUpItems.map((p) =>
        p.id === id ? { ...p, collected: true } : p,
      ),
      activePowerUp: type,
      powerUpTimeLeft: durations[type],
      playerInvincible: type === "shield",
      magnetActive: type === "magnet",
      coinMultiplier: type === "boost" ? 2 : get().coinMultiplier,
      speed: type === "boost" ? get().speed * 1.8 : get().speed,
    });
  },

  triggerCollision: () => {
    const { playerInvincible, pressure } = get();
    if (playerInvincible) return;

    const newPressure = Math.min(100, pressure + 35);
    const warning =
      newPressure >= 100
        ? 3
        : newPressure > 80
          ? 3
          : newPressure > 55
            ? 2
            : newPressure > 30
              ? 1
              : 0;

    if (newPressure >= 100) {
      // Game over
      const { distance, coins } = get();
      const score = Math.floor(distance) + coins * 10;
      set({
        gameRunning: false,
        screen: "gameover",
        lastScore: score,
        lastDistance: Math.floor(distance),
        lastCoins: coins,
        pressure: 100,
        pressureWarning: 3,
      });
    } else {
      set({ pressure: newPressure, pressureWarning: warning as 0 | 1 | 2 | 3 });
    }
  },

  spawnSegment: (z) => {
    const state = get();
    const speedMult = (state.speed - INITIAL_SPEED) / SPEED_INCREMENT;
    const obstacleChance = 0.3 + speedMult * 0.05;

    const newObstacles: Obstacle[] = [];
    const newCoins: Coin[] = spawnCoins(z);
    const newVent: VentToken[] = [];
    const newPowerUps: PowerUpItem[] = [];

    if (Math.random() < obstacleChance) {
      newObstacles.push(spawnObstacle(z - 5, speedMult));
    }

    const vent = spawnVentToken(z - 10);
    if (vent) newVent.push(vent);

    const powerUp = spawnPowerUp(z - 15);
    if (powerUp) newPowerUps.push(powerUp);

    set({
      obstacles: [...state.obstacles, ...newObstacles],
      coinItems: [...state.coinItems, ...newCoins],
      ventTokens: [...state.ventTokens, ...newVent],
      powerUpItems: [...state.powerUpItems, ...newPowerUps],
    });
  },

  tick: (delta) => {
    const state = get();
    if (!state.gameRunning) return;

    const newDistance = state.distance + state.speed * delta;

    // Milestone check
    const currentMilestone = Math.floor(newDistance / 500) * 500;
    let showMilestone = state.showMilestone;
    let milestoneText = state.milestoneText;
    let newSpeed = state.speed;
    let newBaseSpeed = state.baseSpeed;
    let milestone = state.milestone;

    if (currentMilestone > state.milestone && currentMilestone > 0) {
      milestone = currentMilestone;
      const depthLevel = currentMilestone / 500;
      newBaseSpeed = INITIAL_SPEED + depthLevel * SPEED_INCREMENT;
      if (state.activePowerUp !== "boost") {
        newSpeed = newBaseSpeed;
      }
      showMilestone = true;
      milestoneText = `DEPTH ${currentMilestone}m — SPEED+`;
      setTimeout(() => {
        set({ showMilestone: false });
      }, 2500);
    }

    // Jump arc
    let jumpProgress = state.jumpProgress;
    let playerJumping = state.playerJumping;
    if (playerJumping) {
      jumpProgress = Math.min(1, jumpProgress + delta * 1.8);
      if (jumpProgress >= 1) {
        playerJumping = false;
        jumpProgress = 0;
      }
    }

    // Power-up timer
    let activePowerUp = state.activePowerUp;
    let powerUpTimeLeft = state.powerUpTimeLeft;
    let playerInvincible = state.playerInvincible;
    let magnetActive = state.magnetActive;
    let coinMultiplier = state.coinMultiplier;
    let speedAfterBoost = newSpeed;

    if (activePowerUp) {
      powerUpTimeLeft = Math.max(0, powerUpTimeLeft - delta);
      if (powerUpTimeLeft <= 0) {
        if (activePowerUp === "boost") {
          speedAfterBoost = newBaseSpeed;
        }
        activePowerUp = null;
        playerInvincible = false;
        magnetActive = false;
        coinMultiplier = 1;
      }
    }

    // Move obstacles & update
    const updatedObstacles = state.obstacles
      .map((obs) => {
        let updatedObs = { ...obs, z: obs.z + newSpeed * delta };

        // Moving obstacle logic
        if (obs.type === "anglerfish" || obs.type === "currentBurst") {
          const obsSpeed = (obs.speed || 3) * delta;
          const currentLaneNum = updatedObs.lane as number;
          const newLaneNum = currentLaneNum + (obs.moveDir || 1) * obsSpeed;

          if (newLaneNum > 1.4) {
            updatedObs = { ...updatedObs, lane: 1, moveDir: -1 };
          } else if (newLaneNum < -1.4) {
            updatedObs = { ...updatedObs, lane: -1, moveDir: 1 };
          } else {
            updatedObs = {
              ...updatedObs,
              lane: Math.round(Math.max(-1, Math.min(1, newLaneNum))) as Lane,
            };
          }
        }

        if (obs.type === "minecluster") {
          const obsSpeed = (obs.speed || 1) * delta * 0.5;
          const currentLaneNum = updatedObs.lane as number;
          const newLaneNum = currentLaneNum + (obs.moveDir || 1) * obsSpeed;
          if (newLaneNum > 1) {
            updatedObs = { ...updatedObs, lane: 1, moveDir: -1 };
          } else if (newLaneNum < -1) {
            updatedObs = { ...updatedObs, lane: -1, moveDir: 1 };
          } else {
            updatedObs = { ...updatedObs, lane: newLaneNum as Lane };
          }
        }

        return updatedObs;
      })
      .filter((obs) => obs.z < 5); // despawn behind player

    const updatedCoins = state.coinItems
      .map((c) => ({ ...c, z: c.z + newSpeed * delta }))
      .filter((c) => c.z < 5 || !c.collected);

    const updatedVents = state.ventTokens
      .map((v) => ({ ...v, z: v.z + newSpeed * delta }))
      .filter((v) => v.z < 5 || !v.collected);

    const updatedPowerUps = state.powerUpItems
      .map((p) => ({ ...p, z: p.z + newSpeed * delta }))
      .filter((p) => p.z < 5 || !p.collected);

    // Pressure gradually increases over time
    const pressureIncrease = delta * 0.5;
    const newPressure = Math.min(95, state.pressure + pressureIncrease);
    const pressureWarning: 0 | 1 | 2 | 3 =
      newPressure > 80 ? 3 : newPressure > 55 ? 2 : newPressure > 30 ? 1 : 0;

    set({
      distance: newDistance,
      speed: speedAfterBoost,
      baseSpeed: newBaseSpeed,
      milestone,
      showMilestone,
      milestoneText,
      jumpProgress,
      playerJumping,
      activePowerUp,
      powerUpTimeLeft,
      playerInvincible,
      magnetActive,
      coinMultiplier,
      obstacles: updatedObstacles,
      coinItems: updatedCoins,
      ventTokens: updatedVents,
      powerUpItems: updatedPowerUps,
      pressure: newPressure,
      pressureWarning,
    });
  },

  restartGame: () => {
    idCounter = 0;
    set({
      ...initialState,
      screen: "playing",
      gameRunning: true,
      playerName: get().playerName,
      speed: INITIAL_SPEED,
      baseSpeed: INITIAL_SPEED,
      obstacles: [],
      coinItems: [],
      ventTokens: [],
      powerUpItems: [],
    });
  },

  setTouchStart: (x, y) => set({ touchStartX: x, touchStartY: y }),

  handleTouchEnd: (x, y) => {
    const { touchStartX, touchStartY, gameRunning } = get();
    if (!gameRunning) return;
    const dx = x - touchStartX;
    const dy = y - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 10 && absDy < 10) return;

    if (absDx > absDy) {
      if (dx > 0) get().moveRight();
      else get().moveLeft();
    } else {
      if (dy < 0) get().jump();
      else get().slide();
    }
  },
}));
