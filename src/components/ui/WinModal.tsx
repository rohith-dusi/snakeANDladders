import React from 'react';
import { Player } from '../../types/game';
import { Trophy, RotateCcw, Home, Sparkles, AlertTriangle, Dices } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface WinModalProps {
  winner: Player;
  players: Player[];
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  winner,
  players,
  onPlayAgain,
  onMainMenu,
}) => {
  // Sort players by final tile position descending
  const rankedPlayers = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center gap-6 text-slate-100 animate-in fade-in zoom-in-95">
        {/* Glowing Trophy Header */}
        <div className="relative flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-2xl shadow-amber-500/40 animate-bounce">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400" />
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <div className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Champion of the Board!
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              {winner.name} Wins!
            </h2>
            <p className="text-xs text-slate-400">
              Landed on Tile 100 with precision and conquered the course!
            </p>
          </div>
        </div>

        {/* Winner Key Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-amber-400 font-extrabold text-lg tabular-nums">
              {winner.stats.turnsTaken}
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Turns</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-emerald-400 font-extrabold text-lg tabular-nums flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{winner.stats.laddersClimbed}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Ladders</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-center">
            <div className="text-rose-400 font-extrabold text-lg tabular-nums flex items-center justify-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{winner.stats.snakesHit}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Snakes</div>
          </div>
        </div>

        {/* Final Standings Table */}
        <div className="w-full flex flex-col gap-2">
          <div className="text-xs font-semibold text-slate-400 tracking-wider">
            Final Standings
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {rankedPlayers.map((player, idx) => (
              <div
                key={player.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  player.id === winner.id
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold font-mono text-xs w-4 text-center">
                    #{idx + 1}
                  </span>
                  <div
                    className="w-3.5 h-3.5 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <span className="font-semibold">{player.name}</span>
                </div>
                <div className="font-mono tabular-nums font-bold text-white">
                  Tile {player.position}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions CTA */}
        <div className="w-full flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onMainMenu();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onPlayAgain();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
