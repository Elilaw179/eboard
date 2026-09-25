'use client';

import React from 'react';

interface BoardThemeToggleProps {
  theme: 'white' | 'black';
  onChange: (theme: 'white' | 'black') => void;
  className?: string;
}

export default function BoardThemeToggle({
  theme,
  onChange,
  className = '',
}: BoardThemeToggleProps) {
  const isBlack = theme === 'black';

  return (
    <div
      className={`inline-flex items-center rounded-xl p-0.5 border transition-colors ${
        isBlack
          ? 'bg-slate-900/90 border-slate-800'
          : 'bg-white border-slate-200 shadow-sm'
      } ${className}`}
      role="group"
      aria-label="Board Background Theme"
    >
      <button
        type="button"
        onClick={() => onChange('white')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all ${
          theme === 'white'
            ? 'bg-slate-50 text-slate-900 font-bold shadow-xs border border-slate-300'
            : isBlack
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Whiteboard background"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 inline-block shadow-xs" />
        <span>Whiteboard</span>
      </button>

      <button
        type="button"
        onClick={() => onChange('black')}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all ${
          theme === 'black'
            ? 'bg-slate-800 text-white font-bold shadow-xs border border-slate-700'
            : isBlack
            ? 'text-slate-400 hover:text-slate-200'
            : 'text-slate-600 hover:text-slate-900'
        }`}
        title="Switch to Blackboard background"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-slate-600 inline-block" />
        <span>Blackboard</span>
      </button>
    </div>
  );
}
