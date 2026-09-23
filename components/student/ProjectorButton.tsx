'use client';

import React from 'react';
import { Maximize2, Minimize2, Tv } from 'lucide-react';

interface ProjectorButtonProps {
  isFocusMode: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ProjectorButton({
  isFocusMode,
  onToggle,
  className = '',
}: ProjectorButtonProps) {
  return (
    <button
      onClick={onToggle}
      type="button"
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
        isFocusMode
          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-sm'
      } ${className}`}
      title={isFocusMode ? 'Exit Focus / Projector Mode (Esc)' : 'Turn on Projector / Focus Mode'}
    >
      {isFocusMode ? (
        <>
          <Minimize2 className="w-3.5 h-3.5" />
          <span>Exit Focus Mode</span>
        </>
      ) : (
        <>
          <Tv className="w-3.5 h-3.5 text-blue-600" />
          <span>Focus Mode</span>
        </>
      )}
    </button>
  );
}
