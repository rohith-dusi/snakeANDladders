import React from 'react';
import { MoveLogEntry } from '../../types/game';
import { X, Sparkles, AlertTriangle, Dices, Trophy, ArrowRight } from 'lucide-react';

interface MoveLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: MoveLogEntry[];
}

export const MoveLogModal: React.FC<MoveLogModalProps> = ({
  isOpen,
  onClose,
  logs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col max-h-[80vh] text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold font-display text-white">Move History</h2>
            <p className="text-xs text-slate-400">Chronological game turn events</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of moves */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              No moves recorded yet. Roll the dice to begin!
            </div>
          ) : (
            logs.map((log) => {
              let tagColor = 'bg-slate-800 text-slate-300 border-slate-700';
              let icon = <Dices className="w-3.5 h-3.5" />;

              if (log.eventType === 'ladder') {
                tagColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                icon = <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
              } else if (log.eventType === 'snake') {
                tagColor = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                icon = <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
              } else if (log.eventType === 'win') {
                tagColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                icon = <Trophy className="w-3.5 h-3.5 text-amber-400" />;
              }

              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: log.playerColor }}
                    />
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-200 truncate">
                        {log.playerName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {log.message}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-slate-400 font-mono text-[11px] tabular-nums flex items-center gap-1">
                      <span>Tile {log.fromTile}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-white">Tile {log.toTile}</span>
                    </div>

                    <div className={`px-2 py-1 rounded-md border flex items-center gap-1 font-semibold ${tagColor}`}>
                      {icon}
                      <span className="tabular-nums font-mono">+{log.roll}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
