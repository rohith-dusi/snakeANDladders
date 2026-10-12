import React, { useState } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameBoard3D } from './components/3d/GameBoard3D';
import { StartScreen } from './components/ui/StartScreen';
import { GameHUD } from './components/ui/GameHUD';
import { MoveLogModal } from './components/ui/MoveLogModal';
import { SettingsModal } from './components/ui/SettingsModal';
import { WinModal } from './components/ui/WinModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { DebugPanel } from './components/ui/DebugPanel';

export default function App() {
  const {
    isPlaying,
    players,
    activePlayerIndex,
    phase,
    diceValue,
    consecutiveSixes,
    winner,
    moveLogs,
    toasts,
    settings,
    setSettings,
    bursts,
    resetCameraTrigger,
    pawnPositions,
    isPawnMoving,
    nextRollOverride,
    setNextRollOverride,
    setActivePlayerTile,
    startGame,
    returnToMainMenu,
    restartCurrentGame,
    rollDice,
    resetCamera,
  } = useGameLogic();

  const [isMoveLogOpen, setIsMoveLogOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activePlayer = players[activePlayerIndex];
  const canRollDice = isPlaying && phase === 'idle' && activePlayer?.type === 'human' && !winner;

  const handleToggleSound = () => {
    setSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  return (
    <main className="w-screen h-screen relative overflow-hidden bg-slate-950 font-sans">
      {/* 3D Game Canvas (Always active in background, providing smooth immersive experience) */}
      <GameBoard3D
        players={players}
        activePlayerIndex={activePlayerIndex}
        pawnVisualPositions={pawnPositions}
        isPawnMoving={isPawnMoving}
        diceValue={diceValue}
        isDiceRolling={phase === 'rolling'}
        canRollDice={canRollDice}
        phase={phase}
        onRollDice={() => rollDice('human')}
        settings={settings}
        bursts={bursts}
        resetCameraTrigger={resetCameraTrigger}
      />

      {/* Floating Notifications / Toasts */}
      <ToastContainer toasts={toasts} />

      {/* Start Screen (Shown before game starts) */}
      {!isPlaying && (
        <StartScreen
          onStartGame={startGame}
          settings={settings}
          onUpdateSettings={setSettings}
        />
      )}

      {/* In-Game HUD (Shown while playing) */}
      {isPlaying && (
        <GameHUD
          players={players}
          activePlayerIndex={activePlayerIndex}
          phase={phase}
          diceValue={diceValue}
          consecutiveSixes={consecutiveSixes}
          onRollDice={() => rollDice('human')}
          onResetCamera={resetCamera}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMoveLog={() => setIsMoveLogOpen(true)}
          logCount={moveLogs.length}
          settings={settings}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* Move Log History Drawer/Modal */}
      <MoveLogModal
        isOpen={isMoveLogOpen}
        onClose={() => setIsMoveLogOpen(false)}
        logs={moveLogs}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onRestartGame={restartCurrentGame}
        onReturnToMainMenu={returnToMainMenu}
      />

      {/* Win Screen Modal */}
      {winner && (
        <WinModal
          winner={winner}
          players={players}
          onPlayAgain={restartCurrentGame}
          onMainMenu={returnToMainMenu}
        />
      )}

      {/* Dev-only Debug Panel (active only with ?debug=1) */}
      <DebugPanel
        players={players}
        activePlayerIndex={activePlayerIndex}
        phase={phase}
        consecutiveSixes={consecutiveSixes}
        nextRollOverride={nextRollOverride}
        onSetNextRollOverride={setNextRollOverride}
        onSetActivePlayerPosition={setActivePlayerTile}
      />
    </main>
  );
}
