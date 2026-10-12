import React from 'react';
import { Player, GamePhase, GameSettings } from '../../types/game';
import {
  RotateCcw,
  Settings,
  History,
  Bot,
  User,
  Sparkles,
  Camera,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface GameHUDProps {
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  diceValue: number;
  consecutiveSixes: number;
  onRollDice: () => void;
  onResetCamera: () => void;
  onOpenSettings: () => void;
  onOpenMoveLog: () => void;
  logCount: number;
  settings: GameSettings;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  players,
  activePlayerIndex,
  phase,
  diceValue,
  consecutiveSixes,
  onRollDice,
  onResetCamera,
  onOpenSettings,
  onOpenMoveLog,
  logCount,
  settings,
  onToggleSound,
}) => {
  const activePlayer = players[activePlayerIndex];
  const isRollingOrMoving = phase !== 'idle';
  const isBotTurn = activePlayer?.type === 'bot';

  const handleRollClick = () => {
    if (!isRollingOrMoving && !isBotTurn) {
      soundManager.playClick();
      onRollDice();
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* Top Bar: Brand, Quick Actions, Audio, Reset View */}
      <header className="flex items-center justify-between gap-4 pointer-events-auto">
        {/* Brand / Game Title */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-lg">
          <div className="w-6 h-6 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 font-bold text-xs">
            3D
          </div>
          <span className="font-extrabold text-sm sm:text-base tracking-tight text-white font-display">
            Snakes & Ladders
          </span>
        </div>

        {/* Action Buttons: Log, Audio, Camera, Settings */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={() => {
              soundManager.playClick();
              onToggleSound();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            aria-label="Toggle Sound"
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Reset Camera */}
          <button
            onClick={() => {
              soundManager.playClick();
              onResetCamera();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Reset Camera View"
            aria-label="Reset Camera View"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          {/* Move Log */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenMoveLog();
            }}
            className="relative p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Move History"
            aria-label="Move History"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">History</span>
            {logCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {logCount}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenSettings();
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shadow-lg cursor-pointer"
            title="Game Settings"
            aria-label="Game Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Middle Desktop Side Panel: Players List (Desktop Layout) */}
      <div className="hidden lg:flex flex-col gap-2.5 max-w-xs self-start mt-4 pointer-events-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
          Players
        </div>
        {players.map((p, idx) => {
          const isActive = idx === activePlayerIndex;
          return (
            <div
              key={p.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border backdrop-blur-md transition-all shadow-lg ${
                isActive
                  ? 'bg-slate-900/95 border-sky-500/60 ring-2 ring-sky-500/20 translate-x-1'
                  : 'bg-slate-900/70 border-slate-800/80 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0 relative"
                  style={{ backgroundColor: p.color }}
                >
                  {p.type === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-950" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-slate-100 truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>{p.shape}</span>
                    <span>·</span>
                    <span>{p.stats.turnsTaken} turns</span>
                  </div>
                </div>
              </div>

              {/* Current Tile Badge */}
              <div className="text-right shrink-0">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Tile</div>
                <div className="font-extrabold text-base text-white tabular-nums">
                  {p.position}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Control Bar: Responsive for Mobile & Desktop */}
      <footer className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 pointer-events-auto">
        {/* Mobile Mini Players Bar */}
        <div className="w-full flex lg:hidden items-center justify-between gap-2 p-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-xl overflow-x-auto">
          {players.map((p, idx) => {
            const isActive = idx === activePlayerIndex;
            return (
              <div
                key={p.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all shrink-0 ${
                  isActive
                    ? 'bg-slate-800 border-sky-500/80 text-white font-semibold shadow'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate max-w-[70px]">{p.name}</span>
                <span className="font-bold text-sky-400 tabular-nums">#{p.position}</span>
              </div>
            );
          })}
        </div>

        {/* Turn Status Banner & Roll Controls */}
        <div className="w-full flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 shadow-2xl">
          {/* Active Turn Header */}
          <div className="w-full flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: activePlayer?.color }}
              />
              <span className="font-semibold text-slate-200">
                {activePlayer ? (
                  isBotTurn ? `${activePlayer.name}'s Turn (Thinking...)` : `${activePlayer.name}'s Turn`
                ) : 'Waiting...'}
              </span>
              {consecutiveSixes > 0 && (
                <span className="text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {consecutiveSixes === 1 ? '1st Six (Extra Turn)' : '2nd Six (3rd six forfeits!)'}
                </span>
              )}
            </div>

            <div className="text-slate-400 text-xs">
              Tile: <strong className="text-white tabular-nums font-bold">#{activePlayer?.position}</strong>
            </div>
          </div>

          {/* Large Thumb-Friendly Roll Dice CTA */}
          <div className="w-full flex items-center gap-3">
            <button
              onClick={handleRollClick}
              disabled={isRollingOrMoving || isBotTurn}
              className={`flex-1 py-3.5 sm:py-4 px-6 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all duration-150 shadow-xl select-none ${
                isRollingOrMoving
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed opacity-80'
                  : isBotTurn
                  ? 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-600/30 active:scale-[0.98] cursor-pointer'
              }`}
            >
              {/* Dice roll animation or icon */}
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center font-black text-sm">
                {diceValue}
              </div>
              <span>
                {isBotTurn
                  ? 'Computer is thinking...'
                  : phase === 'rolling'
                  ? 'Rolling Dice...'
                  : phase === 'hopping'
                  ? 'Moving...'
                  : phase === 'climbing'
                  ? 'Climbing Ladder!'
                  : phase === 'sliding'
                  ? 'Sliding Down!'
                  : 'Roll Dice'}
              </span>
              {!isRollingOrMoving && !isBotTurn && (
                <span className="hidden sm:inline text-xs font-normal opacity-75 bg-black/20 px-2 py-0.5 rounded">
                  Space
                </span>
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
