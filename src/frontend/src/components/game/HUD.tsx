import { useGameStore } from "../../store/gameStore";

function DepthGauge({ depth }: { depth: number }) {
  // depth = distance in meters, max display 5000
  const pct = Math.min(100, (depth / 5000) * 100);
  const depthLabel =
    depth < 100
      ? "SURFACE"
      : depth < 500
        ? "SHALLOW"
        : depth < 1500
          ? "DEPTHS"
          : depth < 3000
            ? "ABYSS"
            : "HADAL";

  return (
    <div className="absolute right-4 top-1/4 flex flex-col items-center gap-1">
      <div className="font-mono-game text-[0.55rem] tracking-widest neon-cyan opacity-80">
        DEPTH
      </div>
      <div
        className="relative w-4 bg-mid-blue border glow-border-cyan rounded-full overflow-hidden"
        style={{ height: "160px" }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-full"
          style={{
            height: `${pct}%`,
            background:
              "linear-gradient(to top, oklch(0.62 0.22 290), oklch(0.82 0.19 195))",
            boxShadow: "0 0 8px oklch(0.82 0.19 195 / 0.6)",
          }}
        />
        {/* Tick marks */}
        {[20, 40, 60, 80].map((tick) => (
          <div
            key={tick}
            className="absolute left-0 right-0 border-t border-white/10"
            style={{ bottom: `${tick}%` }}
          />
        ))}
      </div>
      <div className="font-mono-game text-[0.5rem] neon-purple opacity-80 tracking-wider">
        {depthLabel}
      </div>
    </div>
  );
}

function PressureMeter({
  pressure,
  warning,
}: { pressure: number; warning: 0 | 1 | 2 | 3 }) {
  const color =
    warning === 0
      ? "from-primary to-neon-cyan"
      : warning === 1
        ? "from-yellow-500 to-yellow-300"
        : warning === 2
          ? "from-orange-500 to-orange-300"
          : "from-red-600 to-red-400";

  const pulseClass = warning >= 2 ? "animate-pressure-pulse" : "";

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-48 sm:w-64">
      <div className="flex justify-between w-full px-1">
        <span className="font-mono-game text-[0.55rem] tracking-widest opacity-70">
          PRESSURE
        </span>
        <span
          className={`font-mono-game text-[0.55rem] ${warning >= 2 ? "text-red-400 animate-pulse" : "opacity-50"}`}
        >
          {warning > 0
            ? warning === 1
              ? "CAUTION"
              : warning === 2
                ? "CRITICAL"
                : "DANGER"
            : `${Math.floor(pressure)}%`}
        </span>
      </div>
      <div
        className={`w-full h-3 bg-mid-blue rounded-full overflow-hidden border border-border ${pulseClass}`}
      >
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-300`}
          style={{ width: `${pressure}%` }}
        />
      </div>
      {/* Warning notches */}
      <div className="relative w-full h-1 flex">
        {[30, 55, 80].map((notch) => (
          <div
            key={notch}
            className="absolute top-0 w-0.5 h-1 bg-white/30"
            style={{ left: `${notch}%` }}
          />
        ))}
      </div>
    </div>
  );
}

function PowerUpBar({
  activePowerUp,
  timeLeft,
}: {
  activePowerUp: string | null;
  timeLeft: number;
}) {
  if (!activePowerUp) return null;

  const configs: Record<
    string,
    { label: string; color: string; maxTime: number }
  > = {
    magnet: { label: "ION MAGNET", color: "text-neon-cyan", maxTime: 10 },
    shield: { label: "PRESSURE SHIELD", color: "text-primary", maxTime: 5 },
    boost: { label: "JET BOOST", color: "text-neon-orange", maxTime: 4 },
  };

  const cfg = configs[activePowerUp];
  if (!cfg) return null;

  const pct = (timeLeft / cfg.maxTime) * 100;

  return (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-44">
      <span
        className={`font-mono-game text-[0.6rem] tracking-widest ${cfg.color} animate-pulse-neon`}
      >
        {cfg.label}
      </span>
      <div className="w-full h-2 bg-mid-blue rounded-full overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all duration-100"
          style={{
            width: `${pct}%`,
            background:
              activePowerUp === "magnet"
                ? "oklch(0.82 0.19 195)"
                : activePowerUp === "shield"
                  ? "oklch(0.65 0.22 240)"
                  : "oklch(0.75 0.22 45)",
            boxShadow:
              activePowerUp === "magnet"
                ? "0 0 6px oklch(0.82 0.19 195 / 0.8)"
                : activePowerUp === "shield"
                  ? "0 0 6px oklch(0.65 0.22 240 / 0.8)"
                  : "0 0 6px oklch(0.75 0.22 45 / 0.8)",
          }}
        />
      </div>
    </div>
  );
}

function MilestoneNotification({
  show,
  text,
}: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none animate-milestone">
      <div className="glow-box-cyan rounded-lg px-6 py-3 border border-primary/40 bg-background/70 backdrop-blur-sm">
        <p className="font-display font-bold text-lg tracking-widest neon-cyan text-center">
          {text}
        </p>
      </div>
    </div>
  );
}

function ScreenCrackOverlay({ warning }: { warning: 0 | 1 | 2 | 3 }) {
  if (warning === 0) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${
        warning === 1 ? "screen-crack-1" : warning === 2 ? "screen-crack-2" : ""
      }`}
    >
      {/* Corner cracks */}
      <div
        className="absolute top-0 left-0 w-32 h-32 pointer-events-none"
        style={{
          background:
            warning >= 2
              ? "radial-gradient(ellipse at top left, oklch(0.62 0.26 22 / 0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at top left, oklch(0.62 0.26 22 / 0.1) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background:
            warning >= 2
              ? "radial-gradient(ellipse at top right, oklch(0.62 0.26 22 / 0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at top right, oklch(0.62 0.26 22 / 0.1) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
        style={{
          background:
            warning >= 2
              ? "radial-gradient(ellipse at bottom left, oklch(0.62 0.26 22 / 0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at bottom left, oklch(0.62 0.26 22 / 0.1) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none"
        style={{
          background:
            warning >= 2
              ? "radial-gradient(ellipse at bottom right, oklch(0.62 0.26 22 / 0.3) 0%, transparent 70%)"
              : "radial-gradient(ellipse at bottom right, oklch(0.62 0.26 22 / 0.1) 0%, transparent 70%)",
        }}
      />

      {/* Border vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 ${warning * 30}px oklch(0.62 0.26 22 / ${warning * 0.15})`,
          border: `${warning}px solid oklch(0.62 0.26 22 / ${warning * 0.2})`,
        }}
      />
    </div>
  );
}

export function HUD() {
  const distance = useGameStore((s) => s.distance);
  const coins = useGameStore((s) => s.coins);
  const pressure = useGameStore((s) => s.pressure);
  const pressureWarning = useGameStore((s) => s.pressureWarning);
  const activePowerUp = useGameStore((s) => s.activePowerUp);
  const powerUpTimeLeft = useGameStore((s) => s.powerUpTimeLeft);
  const showMilestone = useGameStore((s) => s.showMilestone);
  const milestoneText = useGameStore((s) => s.milestoneText);
  const speed = useGameStore((s) => s.speed);

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      {/* Screen crack overlay */}
      <ScreenCrackOverlay warning={pressureWarning} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3">
        {/* Coin counter */}
        <div className="flex items-center gap-2 bg-background/60 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5">
          <div
            className="w-4 h-4 rounded-full"
            style={{
              background: "oklch(0.8 0.22 80)",
              boxShadow: "0 0 6px oklch(0.8 0.22 80 / 0.8)",
            }}
          />
          <span className="font-mono-game text-sm font-bold neon-orange">
            {coins.toLocaleString()}
          </span>
        </div>

        {/* Distance meter */}
        <div className="flex flex-col items-center bg-background/60 backdrop-blur-sm border border-border rounded-lg px-4 py-1.5">
          <span className="font-mono-game text-[0.5rem] tracking-widest opacity-60">
            DISTANCE
          </span>
          <span className="font-mono-game text-base font-bold neon-cyan">
            {Math.floor(distance).toLocaleString()}m
          </span>
        </div>

        {/* Speed indicator */}
        <div className="flex flex-col items-center bg-background/60 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5">
          <span className="font-mono-game text-[0.5rem] tracking-widest opacity-60">
            SPEED
          </span>
          <span className="font-mono-game text-sm font-bold neon-purple">
            {speed.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Depth Gauge (right side) */}
      <DepthGauge depth={Math.floor(distance)} />

      {/* Pressure Meter (bottom) */}
      <PressureMeter pressure={pressure} warning={pressureWarning} />

      {/* Power-up timer bar */}
      <PowerUpBar activePowerUp={activePowerUp} timeLeft={powerUpTimeLeft} />

      {/* Milestone notification */}
      <MilestoneNotification show={showMilestone} text={milestoneText} />

      {/* Controls hint (fades after start) */}
      <div className="absolute bottom-4 left-4 font-mono-game text-[0.5rem] opacity-30 space-y-0.5">
        <div>← → LANES</div>
        <div>↑ JUMP</div>
        <div>↓ SLIDE</div>
      </div>

      {/* Power-up legend bottom right */}
      <div className="absolute bottom-4 right-4 font-mono-game text-[0.5rem] opacity-30 text-right space-y-0.5">
        <div className="neon-cyan">● MAGNET</div>
        <div className="text-primary">● SHIELD</div>
        <div className="neon-orange">● BOOST</div>
      </div>
    </div>
  );
}
