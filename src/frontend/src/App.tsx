import { GameOverScreen } from "./components/game/GameOverScreen";
import { GameScreen } from "./components/game/GameScreen";
import { LeaderboardScreen } from "./components/game/LeaderboardScreen";
import { MainMenu } from "./components/game/MainMenu";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const screen = useGameStore((s) => s.screen);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "oklch(0.06 0.02 260)" }}
    >
      {/* Always render the 3D canvas underneath for ambiance */}
      {screen === "playing" && <GameScreen />}

      {/* Menu screens as overlays */}
      {screen === "menu" && <MainMenu />}
      {screen === "gameover" && <GameOverScreen />}
      {screen === "leaderboard" && <LeaderboardScreen />}
    </div>
  );
}
