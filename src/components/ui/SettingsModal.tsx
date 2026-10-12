import React from 'react';
import { GameSettings } from '../../types/game';
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Camera,
  RotateCcw,
  Home,
  Palette,
  HelpCircle,
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onRestartGame: () => void;
  onReturnToMainMenu: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onRestartGame,
  onReturnToMainMenu,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 flex flex-col gap-5 text-slate-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold font-display text-white">Settings</h2>
            <p className="text-xs text-slate-400">Game preferences & options</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-4 text-xs">
          {/* Sound Toggle & Volume */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>Sound Effects</span>
              </div>
              <button
                onClick={() => {
                  soundManager.playClick();
                  onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.soundEnabled ? 'bg-sky-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {settings.soundEnabled && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[11px] text-slate-400">Volume</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={settings.soundVolume}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, soundVolume: parseFloat(e.target.value) })
                  }
                  className="flex-1 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
                  {Math.round(settings.soundVolume * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Animation Speed */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Animation Speed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { speed: 1, label: '1.0x Normal' },
                { speed: 1.5, label: '1.5x Fast' },
                { speed: 2.2, label: '2.0x Turbo' },
              ].map(({ speed, label }) => (
                <button
                  key={speed}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ ...settings, animationSpeed: speed });
                  }}
                  className={`py-2 px-2.5 rounded-lg border font-semibold text-xs transition-colors ${
                    settings.animationSpeed === speed
                      ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Auto-Follow */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Camera className="w-4 h-4 text-emerald-400" />
              <div>
                <div>Camera Auto-Follow</div>
                <div className="text-[11px] text-slate-400 font-normal">
                  Smoothly glide focus onto the active pawn
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                onUpdateSettings({ ...settings, cameraAutoFollow: !settings.cameraAutoFollow });
              }}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                settings.cameraAutoFollow ? 'bg-sky-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.cameraAutoFollow ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Board Theme */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-200 font-medium">
              <Palette className="w-4 h-4 text-purple-400" />
              <span>Board Visual Theme</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'wood-emerald', label: 'Classic Oak Board' },
                { id: 'midnight-neon', label: 'Midnight Neon Board' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => {
                    soundManager.playClick();
                    onUpdateSettings({ ...settings, theme: id as GameSettings['theme'] });
                  }}
                  className={`py-2 px-2.5 rounded-lg border font-semibold text-xs transition-colors ${
                    settings.theme === id
                      ? 'border-sky-500 bg-sky-500/20 text-sky-200'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons: Restart & Main Menu */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onReturnToMainMenu();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              onRestartGame();
              onClose();
            }}
            className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
