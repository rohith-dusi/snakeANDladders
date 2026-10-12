import React, { useState } from 'react';
import { Player, PawnShape, GameSettings } from '../../types/game';
import { Bot, User, Play, Sparkles, Dices, Shield, Layers, HelpCircle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface StartScreenProps {
  onStartGame: (players: Player[]) => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
}

const COLOR_OPTIONS = [
  { color: '#0284c7', accent: '#38bdf8', name: 'Sky Blue' },
  { color: '#dc2626', accent: '#f87171', name: 'Crimson' },
  { color: '#16a34a', accent: '#4ade80', name: 'Emerald' },
  { color: '#d97706', accent: '#fbbf24', name: 'Amber Gold' },
  { color: '#7c3aed', accent: '#c084fc', name: 'Royal Purple' },
  { color: '#ea580c', accent: '#fb923c', name: 'Blaze Orange' },
];

const SHAPE_OPTIONS: { shape: PawnShape; label: string }[] = [
  { shape: 'cylinder', label: 'Classic' },
  { shape: 'crown', label: 'Crown' },
  { shape: 'cone', label: 'Knight' },
  { shape: 'star', label: 'Star' },
  { shape: 'diamond', label: 'Diamond' },
];

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  settings,
  onUpdateSettings,
}) => {
  const [mode, setMode] = useState<'vs_ai' | 'multiplayer'>('vs_ai');
  const [playerCount, setPlayerCount] = useState<number>(2);
  const [showRules, setShowRules] = useState<boolean>(false);

  const [playersList, setPlayersList] = useState<Player[]>([
    {
      id: 'player-0',
      name: 'Player 1',
      color: COLOR_OPTIONS[0].color,
      accentColor: COLOR_OPTIONS[0].accent,
      shape: 'cylinder',
      type: 'human',
      position: 1,
      previousPosition: 1,
      stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
    },
    {
      id: 'player-1',
      name: 'Computer',
      color: COLOR_OPTIONS[1].color,
      accentColor: COLOR_OPTIONS[1].accent,
      shape: 'cone',
      type: 'bot',
      position: 1,
      previousPosition: 1,
      stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
    },
    {
      id: 'player-2',
      name: 'Player 3',
      color: COLOR_OPTIONS[2].color,
      accentColor: COLOR_OPTIONS[2].accent,
      shape: 'crown',
      type: 'human',
      position: 1,
      previousPosition: 1,
      stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
    },
    {
      id: 'player-3',
      name: 'Player 4',
      color: COLOR_OPTIONS[3].color,
      accentColor: COLOR_OPTIONS[3].accent,
      shape: 'star',
      type: 'human',
      position: 1,
      previousPosition: 1,
      stats: { turnsTaken: 0, totalRolls: 0, laddersClimbed: 0, snakesHit: 0, sixesRolled: 0 },
    },
  ]);

  const handleModeChange = (newMode: 'vs_ai' | 'multiplayer') => {
    soundManager.playClick();
    setMode(newMode);
    if (newMode === 'vs_ai') {
      setPlayerCount(2);
      setPlayersList((prev) => [
        { ...prev[0], name: 'Player 1', type: 'human' },
        { ...prev[1], name: 'Computer', type: 'bot' },
        ...prev.slice(2),
      ]);
    } else {
      setPlayersList((prev) => [
        { ...prev[0], name: 'Player 1', type: 'human' },
        { ...prev[1], name: 'Player 2', type: 'human' },
        ...prev.slice(2),
      ]);
    }
  };

  const handlePlayerCountChange = (count: number) => {
    soundManager.playClick();
    setPlayerCount(count);
  };

  const updatePlayer = (index: number, updates: Partial<Player>) => {
    setPlayersList((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleStart = () => {
    soundManager.playClick();
    const activeList = playersList.slice(0, playerCount).map((p, index) => ({
      ...p,
      id: `player-${index}`,
    }));
    onStartGame(activeList);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-slate-100 my-auto">
        {/* Title Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Classic Board Game Reimagined in 3D</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-display">
            Snakes & Ladders 3D
          </h1>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Climb the golden ladders, avoid the slithering snakes, and roll the exact number to reach Tile 100!
          </p>
        </div>

        {/* Game Mode Selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 tracking-wider">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              onClick={() => handleModeChange('vs_ai')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                mode === 'vs_ai'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Solo vs. Computer</span>
            </button>
            <button
              onClick={() => handleModeChange('multiplayer')}
              className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                mode === 'multiplayer'
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Pass & Play</span>
            </button>
          </div>
        </div>

        {/* Player Count (Multiplayer mode) */}
        {mode === 'multiplayer' && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 tracking-wider">
              Number of Players
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => handlePlayerCountChange(count)}
                  className={`py-2.5 px-4 rounded-lg border font-semibold text-sm transition-all ${
                    playerCount === count
                      ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Player Customization Cards */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-400 tracking-wider">
            Player Roster & Pieces
          </label>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {playersList.slice(0, playerCount).map((p, idx) => (
              <div
                key={p.id}
                className="p-3.5 bg-slate-950/50 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                {/* Name & Type */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner"
                    style={{ backgroundColor: p.color, color: '#ffffff' }}
                  >
                    P{idx + 1}
                  </div>
                  <input
                    type="text"
                    value={p.name}
                    onChange={(e) => updatePlayer(idx, { name: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-medium text-slate-200 focus:outline-none focus:border-sky-500 w-32 sm:w-36"
                  />
                  {mode === 'multiplayer' && (
                    <button
                      onClick={() =>
                        updatePlayer(idx, {
                          type: p.type === 'human' ? 'bot' : 'human',
                          name: p.type === 'human' ? `CPU ${idx + 1}` : `Player ${idx + 1}`,
                        })
                      }
                      className="text-xs px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 flex items-center gap-1"
                      title="Toggle Human / Bot"
                    >
                      {p.type === 'bot' ? <Bot className="w-3 h-3 text-emerald-400" /> : <User className="w-3 h-3 text-sky-400" />}
                      <span>{p.type === 'bot' ? 'Bot' : 'Human'}</span>
                    </button>
                  )}
                </div>

                {/* Color & Shape pickers */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Colors */}
                  <div className="flex items-center gap-1">
                    {COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.color}
                        onClick={() => updatePlayer(idx, { color: opt.color, accentColor: opt.accent })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          p.color === opt.color ? 'scale-110 border-white' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: opt.color }}
                        title={opt.name}
                      />
                    ))}
                  </div>

                  {/* Shape dropdown */}
                  <select
                    value={p.shape}
                    onChange={(e) => updatePlayer(idx, { shape: e.target.value as PawnShape })}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-sky-500"
                  >
                    {SHAPE_OPTIONS.map((so) => (
                      <option key={so.shape} value={so.shape}>
                        {so.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Board Theme Selection */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs text-slate-400">
          <span className="font-semibold tracking-wider">Board Theme</span>
          <div className="flex gap-2">
            {[
              { id: 'wood-emerald', label: 'Classic Oak' },
              { id: 'midnight-neon', label: 'Midnight Neon' },
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => onUpdateSettings({ ...settings, theme: theme.id as GameSettings['theme'] })}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  settings.theme === theme.id
                    ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                    : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rules summary collapsible */}
        <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-xs text-slate-400">
          <button
            onClick={() => setShowRules(!showRules)}
            className="w-full flex items-center justify-between text-slate-300 font-semibold"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-400" />
              <span>Official Game Rules</span>
            </div>
            <span className="text-sky-400">{showRules ? 'Hide ▲' : 'View ▼'}</span>
          </button>
          {showRules && (
            <div className="mt-3 space-y-1.5 text-slate-300 leading-relaxed border-t border-slate-800 pt-2">
              <p>• <strong>Exact Finish:</strong> Land exactly on Tile 100 to win. Overshooting keeps your piece where it is.</p>
              <p>• <strong>Lucky Six:</strong> Rolling a 6 grants an extra turn. Rolling three 6s in a row forfeits your turn.</p>
              <p>• <strong>Ladders:</strong> Land on the base of a ladder to climb straight to the top!</p>
              <p>• <strong>Snakes:</strong> Land on a snake's head to slide all the way down to its tail.</p>
            </div>
          )}
        </div>

        {/* CTA Launch Button */}
        <button
          onClick={handleStart}
          className="w-full py-4 rounded-xl font-bold text-base bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-xl shadow-sky-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>Start Game</span>
        </button>
      </div>
    </div>
  );
};
