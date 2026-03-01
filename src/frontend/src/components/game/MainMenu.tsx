import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useGameStore } from "../../store/gameStore";

const BUBBLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 4,
  size: Math.random() * 12 + 4,
  duration: Math.random() * 4 + 5,
}));

export function MainMenu() {
  const setScreen = useGameStore((s) => s.setScreen);
  const restartGame = useGameStore((s) => s.restartGame);

  const handlePlay = () => {
    restartGame();
  };

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 40%, oklch(0.12 0.06 260) 0%, oklch(0.06 0.02 260) 60%, oklch(0.04 0.01 260) 100%)",
        }}
      />

      {/* Animated grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.82 0.19 195) 1px, transparent 1px), linear-gradient(90deg, oklch(0.82 0.19 195) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "float-bubble 8s linear infinite",
        }}
      />

      {/* Floating bubbles */}
      {BUBBLES.map((b) => (
        <div
          key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${b.x}%`,
            bottom: "-20px",
            width: b.size,
            height: b.size,
            background: "oklch(0.82 0.19 195 / 0.15)",
            border: "1px solid oklch(0.82 0.19 195 / 0.3)",
            animation: `float-bubble ${b.duration}s ease-in-out ${b.delay}s infinite`,
            boxShadow: `0 0 ${b.size / 2}px oklch(0.82 0.19 195 / 0.2)`,
          }}
        />
      ))}

      {/* Underwater light rays */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          background:
            "conic-gradient(from 280deg at 50% -10%, transparent 0deg, oklch(0.82 0.19 195) 5deg, transparent 10deg, transparent 30deg, oklch(0.65 0.28 328) 35deg, transparent 40deg)",
        }}
      />

      {/* Main content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Subtitle */}
        <motion.p
          className="font-mono-game text-xs tracking-[0.4em] neon-magenta uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          CYBERPUNK DEEP SEA RUNNER
        </motion.p>

        {/* Title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1
            className="font-display font-black text-7xl sm:text-8xl tracking-tight leading-none"
            style={{
              color: "oklch(0.82 0.19 195)",
              textShadow:
                "0 0 20px oklch(0.82 0.19 195 / 0.9), 0 0 60px oklch(0.82 0.19 195 / 0.5), 0 0 120px oklch(0.82 0.19 195 / 0.2)",
            }}
          >
            NEON
          </h1>
          <h1
            className="font-display font-black text-7xl sm:text-8xl tracking-tight leading-none"
            style={{
              color: "oklch(0.68 0.30 328)",
              textShadow:
                "0 0 20px oklch(0.68 0.30 328 / 0.9), 0 0 60px oklch(0.68 0.30 328 / 0.5), 0 0 120px oklch(0.68 0.30 328 / 0.2)",
            }}
          >
            DEPTHS
          </h1>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="font-body text-sm tracking-wider text-foreground/60 text-center max-w-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Dive into the drowned megacity. Run. Dodge. Survive the pressure.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col gap-3 w-56"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            onClick={handlePlay}
            className="w-full font-display font-bold text-base tracking-widest py-6 relative overflow-hidden group"
            style={{
              background: "oklch(0.82 0.19 195)",
              color: "oklch(0.06 0.02 260)",
              boxShadow:
                "0 0 20px oklch(0.82 0.19 195 / 0.5), 0 0 40px oklch(0.82 0.19 195 / 0.2)",
            }}
          >
            <span className="relative z-10">DIVE IN</span>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
          </Button>

          <Button
            onClick={() => setScreen("leaderboard")}
            variant="outline"
            className="w-full font-mono-game text-sm tracking-widest py-5"
            style={{
              borderColor: "oklch(0.68 0.30 328 / 0.6)",
              color: "oklch(0.68 0.30 328)",
              boxShadow: "0 0 12px oklch(0.68 0.30 328 / 0.2)",
              background: "oklch(0.06 0.02 260 / 0.5)",
            }}
          >
            LEADERBOARD
          </Button>
        </motion.div>

        {/* Controls legend */}
        <motion.div
          className="grid grid-cols-2 gap-x-8 gap-y-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.9 }}
        >
          {[
            ["← →", "LANES"],
            ["↑ / SPACE", "JUMP"],
            ["↓ / S", "SLIDE"],
            ["SWIPE", "MOBILE"],
          ].map(([key, action]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="font-mono-game text-[0.6rem] bg-mid-blue px-1.5 py-0.5 rounded text-foreground/70">
                {key}
              </span>
              <span className="font-mono-game text-[0.6rem] text-foreground/50">
                {action}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="absolute bottom-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
      >
        <p className="font-mono-game text-[0.6rem] text-foreground/40">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground/70 transition-colors pointer-events-auto"
            style={{ color: "oklch(0.82 0.19 195 / 0.7)" }}
          >
            caffeine.ai
          </a>
        </p>
      </motion.div>
    </div>
  );
}
