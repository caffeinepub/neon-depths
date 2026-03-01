import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import type { ScoreEntry } from "../../backend.d";
import { useActor } from "../../hooks/useActor";
import { useGameStore } from "../../store/gameStore";

export function LeaderboardScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const { actor, isFetching: actorFetching } = useActor();

  const {
    data: scores = [],
    isLoading,
    error,
  } = useQuery<ScoreEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      const data = await actor.getLeaderboard();
      return [...data]
        .sort((a, b) => (b.score > a.score ? 1 : -1))
        .slice(0, 10);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
  });

  const rankColor = (i: number) => {
    if (i === 0) return "oklch(0.85 0.22 80)";
    if (i === 1) return "oklch(0.78 0.04 220)";
    if (i === 2) return "oklch(0.68 0.15 50)";
    return "oklch(0.55 0.06 220)";
  };

  const loading = isLoading || actorFetching;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 70% 30%, oklch(0.11 0.05 270) 0%, oklch(0.06 0.02 260) 60%)",
        }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 scanlines pointer-events-none" />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-lg px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <p className="font-mono-game text-xs tracking-[0.3em] neon-magenta mb-1">
            TOP DIVERS
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl neon-cyan">
            LEADERBOARD
          </h2>
        </div>

        {/* Table */}
        <div className="w-full border border-border rounded-lg overflow-hidden bg-background/60 backdrop-blur-sm">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-border bg-mid-blue/50">
            <span className="col-span-1 font-mono-game text-[0.6rem] tracking-wider opacity-50">
              #
            </span>
            <span className="col-span-5 font-mono-game text-[0.6rem] tracking-wider opacity-50">
              DIVER
            </span>
            <span className="col-span-3 font-mono-game text-[0.6rem] tracking-wider opacity-50 text-right">
              SCORE
            </span>
            <span className="col-span-3 font-mono-game text-[0.6rem] tracking-wider opacity-50 text-right">
              DEPTH
            </span>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <div
                className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderTopColor: "oklch(0.82 0.19 195)",
                  borderRightColor: "oklch(0.82 0.19 195 / 0.3)",
                }}
              />
            </div>
          )}

          {error && (
            <div className="py-8 text-center font-mono-game text-sm opacity-50">
              Failed to load scores
            </div>
          )}

          {!loading && !error && scores.length === 0 && (
            <div className="py-10 text-center">
              <p className="font-mono-game text-sm opacity-40 tracking-wider">
                NO SCORES YET — BE THE FIRST!
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            scores.map((entry, i) => (
              <motion.div
                key={`${entry.playerName}-${i}`}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-mid-blue/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center">
                  <span
                    className="font-mono-game font-bold text-sm"
                    style={{ color: rankColor(i) }}
                  >
                    {i + 1}
                  </span>
                </div>

                {/* Name */}
                <div className="col-span-5 flex items-center">
                  <span
                    className="font-mono-game text-sm font-medium truncate"
                    style={{
                      color: i < 3 ? rankColor(i) : "oklch(0.75 0.04 220)",
                    }}
                  >
                    {entry.playerName || "DIVER"}
                  </span>
                </div>

                {/* Score */}
                <div className="col-span-3 flex items-center justify-end">
                  <span className="font-mono-game text-sm neon-cyan">
                    {Number(entry.score).toLocaleString()}
                  </span>
                </div>

                {/* Distance */}
                <div className="col-span-3 flex items-center justify-end">
                  <span className="font-mono-game text-xs opacity-60">
                    {Number(entry.distance).toLocaleString()}m
                  </span>
                </div>
              </motion.div>
            ))}
        </div>

        {/* Back button */}
        <Button
          onClick={() => setScreen("menu")}
          variant="outline"
          className="w-full font-mono-game text-sm tracking-widest py-5"
          style={{
            borderColor: "oklch(0.82 0.19 195 / 0.5)",
            color: "oklch(0.82 0.19 195)",
            background: "oklch(0.06 0.02 260 / 0.5)",
          }}
        >
          ← BACK TO SURFACE
        </Button>
      </motion.div>
    </div>
  );
}
