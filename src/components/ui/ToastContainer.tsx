import React from 'react';
import { ToastMessage } from '../../types/game';
import { Sparkles, AlertTriangle, Info, Trophy } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-700 bg-slate-900/95 text-slate-100';
        let Icon = Info;
        let iconColor = 'text-sky-400';

        if (toast.type === 'ladder') {
          borderClass = 'border-emerald-500/50 bg-emerald-950/95 text-emerald-100 shadow-emerald-950/50';
          Icon = Sparkles;
          iconColor = 'text-emerald-400';
        } else if (toast.type === 'snake') {
          borderClass = 'border-rose-500/50 bg-rose-950/95 text-rose-100 shadow-rose-950/50';
          Icon = AlertTriangle;
          iconColor = 'text-rose-400';
        } else if (toast.type === 'warning') {
          borderClass = 'border-amber-500/50 bg-amber-950/95 text-amber-100 shadow-amber-950/50';
          Icon = AlertTriangle;
          iconColor = 'text-amber-400';
        } else if (toast.type === 'success') {
          borderClass = 'border-amber-400/50 bg-slate-900/95 text-amber-100 shadow-amber-950/50';
          Icon = Trophy;
          iconColor = 'text-amber-400';
        }

        return (
          <div
            key={toast.id}
            className={`w-full flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-md shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${borderClass}`}
          >
            <div className={`p-1 rounded-lg bg-black/20 shrink-0 mt-0.5 ${iconColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm leading-tight font-display">{toast.title}</div>
              <div className="text-xs opacity-90 mt-0.5 leading-snug">{toast.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
