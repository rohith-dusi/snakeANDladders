import React, { useState, useEffect } from 'react';
import { Player, GamePhase } from '../../types/game';
import { Wrench, ChevronDown, ChevronUp, X, Check, Dices } from 'lucide-react';

interface DebugPanelProps {
  players: Player[];
  activePlayerIndex: number;
  phase: GamePhase;
  consecutiveSixes: number;
  nextRollOverride: number | null;
  onSetNextRollOverride: (val: number | null) => void;
  onSetActivePlayerPosition: (tile: number) => void;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  players,
  activePlayerIndex,
  phase,
  consecutiveSixes,
  nextRollOverride,
  onSetNextRollOverride,
  onSetActivePlayerPosition,
}) => {
  const [isDebug, setIsDebug] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [targetTileInput, setTargetTileInput] = useState<string>('98');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setIsDebug(params.get('debug') === '1');
    }
  }, []);

  if (!isDebug) return null;

  const activePlayer = players[activePlayerIndex];

  const handleSetPosition = (e: React.FormEvent) => {
    e.preventDefault();
    const tileNum = parseInt(targetTileInput, 10);
    if (!isNaN(tileNum)) {
      onSetActivePlayerPosition(tileNum);
    }
  };

  return (
    <aside
      aria-label="Developer Debug Panel"
      className="fixed bottom-4 left-4 z-50 max-w-sm w-80 bg-slate-900/95 border border-amber-500/50 rounded-xl shadow-2xl backdrop-blur-md text-slate-100 font-mono text-xs overflow-hidden"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-amber-500/10 border-b border-amber-500/30 text-amber-300">
        <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-[11px]">
          <Wrench className="w-3.5 h-3.5" />
          <span>Dev Debug Panel (?debug=1)</span>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-amber-500/20 rounded text-amber-300 transition-colors"
          title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
        >
          {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-3 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* 1. Force Next Dice Roll (1-6) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
              <span className="flex items-center gap-1">
                <Dices className="w-3 h-3 text-amber-400" />
                <span>Force Next Roll</span>
              </span>
              {nextRollOverride !== null ? (
                <button
                  onClick={() => onSetNextRollOverride(null)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline"
                >
                  Clear (Forced: {nextRollOverride})
                </button>
              ) : (
                <span className="text-[10px] text-slate-500">Normal (Random)</span>
              )}
            </div>

            <div className="grid grid-cols-6 gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = nextRollOverride === num;
                return (
                  <button
                    key={num}
                    onClick={() =>
                      onSetNextRollOverride(isSelected ? null : num)
                    }
                    className={`py-1.5 font-bold rounded text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow ring-2 ring-amber-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Set Position Input */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-slate-300 font-semibold">
              Set Active Player Position (1-100)
            </div>
            <form onSubmit={handleSetPosition} className="flex gap-1.5">
              <input
                type="number"
                min="1"
                max="100"
                value={targetTileInput}
                onChange={(e) => setTargetTileInput(e.target.value)}
                className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="flex-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded transition-colors text-[11px]"
              >
                Teleport to #{targetTileInput}
              </button>
            </form>
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
              <span className="text-slate-500">Quick:</span>
              <button
                type="button"
                onClick={() => {
                  setTargetTileInput('27');
                  onSetActivePlayerPosition(27);
                }}
                className="hover:text-emerald-300 underline"
              >
                #27 (Ladder: force 1)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setTargetTileInput('98');
                  onSetActivePlayerPosition(98);
                }}
                className="hover:text-amber-300 underline"
              >
                #98 (Snake: force 1 / Win: force 2)
              </button>
              <span>·</span>
              <button
                type="button"
                onClick={() => {
                  setTargetTileInput('94');
                  onSetActivePlayerPosition(94);
                }}
                className="hover:text-amber-300 underline"
              >
                #94 (Win: force 6)
              </button>
            </div>
          </div>

          {/* 3. Live State Readout */}
          <div className="space-y-1.5 border-t border-slate-800 pt-2 text-[11px]">
            <div className="text-[11px] text-slate-300 font-semibold">
              Live State Readout
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-950/70 p-2 rounded border border-slate-800">
              <div>
                <span className="text-slate-500">phase:</span>{' '}
                <span className="text-sky-400 font-bold">{phase}</span>
              </div>
              <div>
                <span className="text-slate-500">sixesStreak:</span>{' '}
                <span className="text-amber-400 font-bold">{consecutiveSixes} / 3</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">activePlayerIndex:</span>{' '}
                <span className="text-emerald-400 font-bold">
                  [{activePlayerIndex}] {activePlayer?.name} (#{activePlayer?.position})
                </span>
              </div>
            </div>
          </div>

          {/* 4. Player Stats Table */}
          <div className="space-y-1 border-t border-slate-800 pt-2 text-[10px]">
            <div className="text-[11px] text-slate-300 font-semibold mb-1">
              Player Stats
            </div>
            <div className="space-y-1.5">
              {players.map((p, idx) => (
                <div
                  key={p.id}
                  className={`p-1.5 rounded border ${
                    idx === activePlayerIndex
                      ? 'bg-amber-500/10 border-amber-500/40'
                      : 'bg-slate-950/40 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span style={{ color: p.color }}>
                      {idx === activePlayerIndex ? '▶ ' : ''}{p.name}
                    </span>
                    <span>Tile #{p.position}</span>
                  </div>
                  <div className="text-slate-400 grid grid-cols-2 gap-x-2 mt-0.5">
                    <span>turns: {p.stats.turnsTaken}</span>
                    <span>rolls: {p.stats.totalRolls}</span>
                    <span>sixes: {p.stats.sixesRolled}</span>
                    <span>ladders: {p.stats.laddersClimbed}</span>
                    <span>snakes: {p.stats.snakesHit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
