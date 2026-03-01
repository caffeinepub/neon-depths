import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../../hooks/useActor";
import { useGameStore } from "../../store/gameStore";

export function GameOverScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const restartGame = useGameStore((s) => s.restartGame);
  const lastScore = useGameStore((s) => s.lastScore);
  const lastDistance = useGameStore((s) => s.lastDistance);
  const lastCoins = useGameStore((s) => s.lastCoins);
  const playerName = useGameStore((s) => s.playerName);
  const setPlayerName = useGameStore((s) => s.setPlayerName);

  const { actor } = useActor();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [name, setName] = useState(playerName);

  const handleSubmit = async () => {
    if (!name.trim() || !actor) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const finalName = name.trim().toUpperCase();
      setPlayerName(finalName);
      await actor.submitScore(
        finalName,
        BigInt(lastScore),
        BigInt(lastDistance),
      );
      setSubmitted(true);
    } catch {
      setSubmitError("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const scoreGrade =
    lastDistance >= 3000
      ? "LEGENDARY"
      : lastDistance >= 1500
        ? "EXPERT"
        : lastDistance >= 800
          ? "ADVANCED"
          : lastDistance >= 400
            ? "SURVIVOR"
            : "RECRUIT";

  const gradeColor =
    scoreGrade === "LEGENDARY"
      ? "oklch(0.85 0.22 80)"
      : scoreGrade === "EXPERT"
        ? "oklch(0.82 0.19 195)"
        : scoreGrade === "ADVANCED"
          ? "oklch(0.68 0.30 328)"
          : scoreGrade === "SURVIVOR"
            ? "oklch(0.62 0.22 290)"
            : "oklch(0.55 0.08 220)";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, oklch(0.10 0.04 20) 0%, oklch(0.06 0.02 260) 70%)",
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-5 w-full max-w-sm px-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Game over title */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="font-mono-game text-xs tracking-[0.3em] opacity-60 mb-1">
            PRESSURE CRITICAL
          </p>
          <h2
            className="font-display font-black text-5xl"
            style={{
              color: "oklch(0.62 0.26 22)",
              textShadow:
                "0 0 20px oklch(0.62 0.26 22 / 0.8), 0 0 50px oklch(0.62 0.26 22 / 0.4)",
            }}
          >
            CRUSHED
          </h2>
        </motion.div>

        {/* Grade badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="px-6 py-1.5 rounded-full border"
          style={{
            borderColor: `${gradeColor}80`,
            background: `${gradeColor}15`,
            boxShadow: `0 0 16px ${gradeColor}30`,
          }}
        >
          <span
            className="font-mono-game font-bold text-sm tracking-widest"
            style={{ color: gradeColor }}
          >
            {scoreGrade}
          </span>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          className="w-full rounded-lg border border-border bg-background/70 backdrop-blur-sm overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {[
            {
              label: "TOTAL SCORE",
              value: lastScore.toLocaleString(),
              color: "neon-cyan",
            },
            {
              label: "MAX DEPTH",
              value: `${lastDistance.toLocaleString()}m`,
              color: "neon-purple",
            },
            {
              label: "COINS COLLECTED",
              value: lastCoins.toLocaleString(),
              color: "neon-orange",
            },
          ].map(({ label, value, color }, i) => (
            <motion.div
              key={label}
              className="flex items-center justify-between px-4 py-3 border-b border-border/50 last:border-0"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <span className="font-mono-game text-xs tracking-wider opacity-50">
                {label}
              </span>
              <span className={`font-mono-game font-bold text-base ${color}`}>
                {value}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Score submission */}
        {!submitted ? (
          <motion.div
            className="w-full space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) =>
                  setName(e.target.value.toUpperCase().slice(0, 12))
                }
                placeholder="ENTER NAME"
                maxLength={12}
                className="font-mono-game text-sm tracking-widest"
                style={{
                  background: "oklch(0.08 0.025 260)",
                  borderColor: "oklch(0.82 0.19 195 / 0.4)",
                  color: "oklch(0.82 0.19 195)",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting || !name.trim() || !actor}
                className="font-mono-game text-xs tracking-widest whitespace-nowrap"
                style={{
                  background: "oklch(0.82 0.19 195)",
                  color: "oklch(0.06 0.02 260)",
                }}
              >
                {submitting ? "..." : "SUBMIT"}
              </Button>
            </div>
            {submitError && (
              <p
                className="font-mono-game text-xs text-center"
                style={{ color: "oklch(0.62 0.26 22)" }}
              >
                {submitError}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <p className="font-mono-game text-sm neon-cyan tracking-widest">
              SCORE LOGGED ✓
            </p>
          </motion.div>
        )}

        {/* Action buttons */}
        <motion.div
          className="flex gap-3 w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Button
            onClick={restartGame}
            className="flex-1 font-display font-bold text-sm tracking-widest py-5"
            style={{
              background: "oklch(0.82 0.19 195)",
              color: "oklch(0.06 0.02 260)",
              boxShadow: "0 0 16px oklch(0.82 0.19 195 / 0.4)",
            }}
          >
            DIVE AGAIN
          </Button>
          <Button
            onClick={() => setScreen("leaderboard")}
            variant="outline"
            className="flex-1 font-mono-game text-xs tracking-widest py-5"
            style={{
              borderColor: "oklch(0.68 0.30 328 / 0.5)",
              color: "oklch(0.68 0.30 328)",
              background: "transparent",
            }}
          >
            RANKINGS
          </Button>
        </motion.div>

        <Button
          onClick={() => setScreen("menu")}
          variant="ghost"
          className="font-mono-game text-xs tracking-widest opacity-40 hover:opacity-70"
        >
          MAIN MENU
        </Button>
      </motion.div>
    </div>
  );
}
