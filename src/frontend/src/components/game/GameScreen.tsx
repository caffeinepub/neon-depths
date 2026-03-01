import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { useGameStore } from "../../store/gameStore";
import { GameScene } from "./GameScene";
import { HUD } from "./HUD";

function KeyboardController() {
  const moveLeft = useGameStore((s) => s.moveLeft);
  const moveRight = useGameStore((s) => s.moveRight);
  const jump = useGameStore((s) => s.jump);
  const slide = useGameStore((s) => s.slide);
  const gameRunning = useGameStore((s) => s.gameRunning);

  useEffect(() => {
    if (!gameRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowLeft":
          e.preventDefault();
          moveLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRight();
          break;
        case "ArrowUp":
        case "Space":
          e.preventDefault();
          jump();
          break;
        case "ArrowDown":
        case "KeyS":
          e.preventDefault();
          slide();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameRunning, moveLeft, moveRight, jump, slide]);

  return null;
}

function TouchController() {
  const setTouchStart = useGameStore((s) => s.setTouchStart);
  const handleTouchEnd = useGameStore((s) => s.handleTouchEnd);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setTouchStart(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      handleTouchEnd(touch.clientX, touch.clientY);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [setTouchStart, handleTouchEnd]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ touchAction: "none" }}
    />
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-12 h-12 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "oklch(0.82 0.19 195)",
            borderRightColor: "oklch(0.82 0.19 195 / 0.3)",
          }}
        />
        <p className="font-mono-game text-xs tracking-widest neon-cyan">
          INITIALIZING DEPTH SCANNER...
        </p>
      </div>
    </div>
  );
}

export function GameScreen() {
  return (
    <div className="absolute inset-0 bg-background">
      {/* 3D Canvas */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          className="absolute inset-0"
          camera={{ position: [0, 1.8, 8], fov: 65, near: 0.1, far: 150 }}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
          }}
          shadows
        >
          <GameScene />
        </Canvas>
      </Suspense>

      {/* HUD overlay */}
      <HUD />

      {/* Input handlers */}
      <KeyboardController />
      <TouchController />
    </div>
  );
}
