# Neon Depths: 3D Endless Runner

## Current State

New project. No existing code.

## Requested Changes (Diff)

### Add

- A fully playable 3D endless runner game called **Neon Depths** with a **Cyberpunk Deep Sea** hybrid theme (bioluminescent underwater city ruins with neon-lit tech corridors)
- Core gameplay loop: lane-based running with swipe/key controls to turn, jump, and slide
- 5 unique obstacles (static and moving)
- 3 power-ups: Magnet, Shield, Speed Boost
- Progression system: speed increases every 500 meters
- Leaderboard to track high scores
- A unique hook mechanic: **Depth Pressure System** (see below)

### Modify

- N/A (new project)

### Remove

- N/A (new project)

## Implementation Plan

### Theme: Cyberpunk Deep Sea
The player character is a salvage diver in a drowned, neon-lit megacity. The environment mixes bioluminescent coral, crumbling skyscrapers, and glowing tech debris. The aesthetic blends underwater blues/greens with harsh neon pinks and cyans.

### Core Loop
- **Movement**: Player runs forward automatically in one of 3 lanes
- **Swipe Left/Right** (or arrow keys): Lane switch
- **Swipe Up** (or spacebar): Jump
- **Swipe Down** (or S key): Slide/duck
- **Turn mechanic**: At junction points, the path branches left or right; player must swipe to take a turn or they hit a wall

### 5 Unique Obstacles

1. **Pressure Gate** (Static) -- A vertical gate of crushing metal doors that closes periodically; player must slide under or jump over depending on the pattern
2. **Roaming Anglerfish Drone** (Moving) -- A mechanical anglerfish that patrols across all 3 lanes; must be timed to avoid
3. **Collapsing Coral Column** (Static) -- A tall coral pillar that falls from the ceiling and blocks a lane
4. **Current Burst** (Moving) -- A horizontal wall of high-pressure water that sweeps across lanes from one side; must switch lanes fast
5. **Floating Mine Cluster** (Moving) -- A slow-drifting cluster of old naval mines that drifts between lanes at mid-height; can be jumped over or slid under

### 3 Power-Ups

1. **Ion Magnet** -- Pulls all coins in nearby lanes toward the player for 10 seconds; visualized as a magnetic pulse ring
2. **Pressure Shield** -- Makes the player invincible for 5 seconds; visualized as a glowing bubble of bioluminescent energy
3. **Jet Boost** -- Doubles speed for 4 seconds but also doubles coin value; visualized as thrusters activating on the diver's suit

### Progression System
- Base speed: moderate
- Every 500 meters, speed increases by a fixed increment
- Obstacle spawn rate also increases every 500 meters
- Visual cue: depth gauge on HUD ticks down (deeper = faster, more dangerous)
- Milestone notifications shown at each 500m interval

### The Hook: Depth Pressure System
Unlike Temple Run, which is purely about survival, **Neon Depths** adds a **risk/reward depth mechanic**:
- The HUD shows a "Depth Pressure" meter that fills as you go deeper
- Players can choose to dive into optional side tunnels that descend deeper -- these tunnels have higher obstacle density but 3x coin multipliers
- If the pressure meter fills completely (from damage or staying in deep tunnels too long), the diver's suit begins to crack, giving 3 warning stages before game over
- Players can vent pressure by collecting "Vent Tokens" scattered in the main path
- This creates a constant push-pull: stay safe on the main path, or risk the deep tunnels for massive rewards

### Backend
- Store player high scores (player name + score + distance)
- Query top 10 leaderboard
- Submit new score

### Frontend
- 3D game scene using React Three Fiber + Three.js
- HUD: distance meter, coin counter, depth pressure gauge, current score
- Main menu screen with leaderboard display
- Game over screen with score summary and submit-to-leaderboard option
- Touch swipe support + keyboard controls
- Procedurally generated lane segments with obstacles and power-ups placed semi-randomly
