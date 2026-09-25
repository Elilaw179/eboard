'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Printer,
  BookOpen,
  Share2,
  Tv,
  Check,
  Type,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { Note } from '@/types/note';
import { formatDate, getReadingTime } from '@/lib/utils/format';
import CopyButton from '@/components/student/CopyButton';
import ProjectorButton from '@/components/student/ProjectorButton';
import BoardThemeToggle from '@/components/student/BoardThemeToggle';

interface NoteReaderClientProps {
  note: Note;
}

export default function NoteReaderClient({ note }: NoteReaderClientProps) {
  const [boardTheme, setBoardTheme] = useState<'white' | 'black'>('white');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [linkCopied, setLinkCopied] = useState(false);

  // Load saved board theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('eboard-theme') as 'white' | 'black' | null;
      if (saved === 'white' || saved === 'black') {
        setBoardTheme(saved);
      }
    } catch {
      // ignore in environments without localStorage
    }
  }, []);

  const handleBoardThemeChange = (theme: 'white' | 'black') => {
    setBoardTheme(theme);
    try {
      localStorage.setItem('eboard-theme', theme);
    } catch {
      // ignore
    }
  };

  // Allow ESC key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  // Handle share/copy link
  const handleShareLink = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const fontSizeClasses = {
    normal: 'text-base leading-relaxed',
    large: 'text-lg sm:text-xl leading-loose',
    xlarge: 'text-xl sm:text-2xl leading-loose',
  };

  const isBlackboard = boardTheme === 'black';

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isFocusMode || isBlackboard
          ? 'bg-slate-950 text-slate-100 py-6 px-3 sm:px-6'
          : 'bg-slate-100/90 text-slate-900 py-8 px-4 sm:px-6 lg:px-8'
      }`}
    >
      <div className="max-w-5xl mx-auto">
        {/* Top Floating Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          {/* Back Navigation */}
          <Link
            href={`/class/${note.classSlug}`}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
              isFocusMode || isBlackboard
                ? 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to {note.className}</span>
          </Link>

          {/* Action Toolbar: Board Theme Toggle, Font size, Copy, Projector Mode, Print */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Whiteboard / Blackboard Background Switcher */}
            <BoardThemeToggle
              theme={boardTheme}
              onChange={handleBoardThemeChange}
            />

            {/* Font scale buttons */}
            <div
              className={`hidden sm:inline-flex items-center rounded-xl p-0.5 border ${
                isFocusMode || isBlackboard
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition ${
                  fontSize === 'normal'
                    ? 'bg-blue-600 text-white'
                    : isFocusMode || isBlackboard ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Normal text size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${
                  fontSize === 'large'
                    ? 'bg-blue-600 text-white'
                    : isFocusMode || isBlackboard ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Large text size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2.5 py-1.5 text-xs font-black rounded-lg transition ${
                  fontSize === 'xlarge'
                    ? 'bg-blue-600 text-white'
                    : isFocusMode || isBlackboard ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Extra large text size (Projector viewing)"
              >
                A++
              </button>
            </div>

            {/* Copy Note Button */}
            <CopyButton content={note.content} title={note.title} />

            {/* Print Note */}
            <button
              onClick={handlePrint}
              type="button"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isFocusMode || isBlackboard
                  ? 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print</span>
            </button>

            {/* Share Link */}
            <button
              onClick={handleShareLink}
              type="button"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                isFocusMode || isBlackboard
                  ? 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
              title="Copy shareable link to this note"
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Projector / Focus Mode Toggle */}
            <ProjectorButton
              isFocusMode={isFocusMode}
              onToggle={() => setIsFocusMode(!isFocusMode)}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* THE DIGITAL CLASSROOM BOARD (Whiteboard / Blackboard Canvas)              */}
        {/* ========================================================================= */}
        <article
          id="digital-board-document"
          className={`board-canvas rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
            isBlackboard
              ? 'blackboard-mode bg-[#0f172a] text-slate-100 border-slate-800 shadow-2xl'
              : 'bg-white text-slate-900 border-slate-200/90 shadow-document'
          } ${
            isFocusMode
              ? 'projector-document shadow-projector max-w-4xl mx-auto p-8 sm:p-14'
              : 'p-6 sm:p-12 md:p-16'
          }`}
        >
          {/* Top Document Header Banner */}
          <header className={`border-b-2 pb-8 mb-8 transition-colors ${
            isBlackboard ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border transition-colors ${
                  isBlackboard
                    ? 'bg-blue-950/70 text-blue-300 border-blue-800/60'
                    : 'bg-blue-50 text-blue-700 border-blue-200/60'
                }`}>
                  {note.subject}
                </span>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                  isBlackboard
                    ? 'bg-slate-800 text-slate-200 border border-slate-700'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {note.className}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(note.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {getReadingTime(note.content)}
                </span>
              </div>
            </div>

            {/* Main Note Title */}
            <h1 className={`text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight transition-colors ${
              isBlackboard ? 'text-white' : 'text-slate-900'
            }`}>
              {note.title}
            </h1>

            {note.authorName && (
              <p className="text-xs font-medium text-slate-400 mt-3">
                Published by: <span className={`font-semibold ${isBlackboard ? 'text-slate-300' : 'text-slate-600'}`}>{note.authorName}</span>
              </p>
            )}
          </header>

          {/* Formatted Classroom Content */}
          <div
            id="board-note-content"
            className={`tiptap-content prose max-w-none ${fontSizeClasses[fontSize]} ${
              isBlackboard ? 'blackboard-theme' : ''
            }`}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />

          {/* Document Footer Note */}
          <footer className={`mt-14 pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3 transition-colors ${
            isBlackboard ? 'border-slate-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Verified classroom note • {note.className}</span>
            </div>
            <span className="no-print">Tip: Select any section of this note to copy directly (Ctrl+C).</span>
          </footer>
        </article>

        {/* In Focus Mode: Subtle bottom exit reminder */}
        {isFocusMode && (
          <div className="text-center mt-6 no-print">
            <button
              onClick={() => setIsFocusMode(false)}
              className="text-xs text-slate-400 hover:text-slate-200 underline transition"
            >
              Press ESC or click here to exit Focus Mode
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
