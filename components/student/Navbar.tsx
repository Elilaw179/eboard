'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Presentation, Search, Menu, X } from 'lucide-react';

const MAX_CLICKS = 5;
const RESET_DELAY = 2500;

export default function StudentNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Secret 5-click entrance to Admin Login
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [clickCount, setClickCount] = useState(0); // for visual dot progress

  // Prefetch admin login for instant navigation on 5th click
  useEffect(() => {
    router.prefetch('/admin/login');
    router.prefetch('/classes');
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [router]);

  const handleLogoClick = useCallback((e: React.MouseEvent) => {
    clickCountRef.current += 1;
    const count = clickCountRef.current;
    setClickCount(count);

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    // Prevent navigating to "/" repeatedly when multi-clicking
    if (count > 1) e.preventDefault();

    if (count >= MAX_CLICKS) {
      e.preventDefault();
      clickCountRef.current = 0;
      setClickCount(0);
      router.push('/admin/login');
      return;
    }

    // Reset if user pauses
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
      setClickCount(0);
    }, RESET_DELAY);
  }, [router]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Classes', href: '/classes' },
  ];

  const showHint = clickCount >= 2 && clickCount < MAX_CLICKS;
  const isLaunching = clickCount === 0 && showHint === false; // briefly after 5th click

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo with 5-click secret entrance */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center gap-2.5 group select-none cursor-pointer touch-manipulation"
              title="ClassBoard"
              prefetch={false}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 active:scale-95 transition-transform">
                <Presentation className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xl tracking-tight text-slate-900 block leading-tight">
                  Class<span className="text-blue-600">Board</span>
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
                  Digital Notes Portal
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    prefetch={true}
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 bg-blue-50/70 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Search Bar on Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search notes, subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-52 md:w-64 pl-9 pr-4 py-1.5 text-sm bg-slate-100/80 border border-slate-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </form>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle navigation menu"
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mt-1">
              <input
                type="text"
                placeholder="Search notes, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </form>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  prefetch={true}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-medium ${
                    pathname === link.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ── Secret Entrance Hint Toast ── */}
      {showHint && (
        <div
          key={clickCount}
          className="fixed bottom-6 right-6 z-50"
          style={{ animation: 'hint-pop 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
        >
          <div className="relative flex items-center gap-3 pl-4 pr-5 py-3 rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Glow streak */}
            <div className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%)',
                animation: 'glow-streak 1.8s ease-in-out infinite',
              }}
            />

            {/* Lock icon area */}
            <div className="relative flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 border border-blue-400/30 flex items-center justify-center">
              <span className="text-sm">🔐</span>
            </div>

            {/* Text */}
            <div className="relative flex flex-col min-w-0">
              <span className="text-white text-xs font-semibold leading-tight">
                Teacher Portal
              </span>
              <span className="text-slate-400 text-[10px] leading-tight mt-0.5">
                {MAX_CLICKS - clickCount} more {MAX_CLICKS - clickCount === 1 ? 'tap' : 'taps'} to unlock
              </span>
            </div>

            {/* Progress dots */}
            <div className="relative flex items-center gap-1 ml-1">
              {Array.from({ length: MAX_CLICKS }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i < clickCount ? '8px' : '6px',
                    height: i < clickCount ? '8px' : '6px',
                    background: i < clickCount
                      ? 'linear-gradient(135deg, #60a5fa, #3b82f6)'
                      : 'rgba(148,163,184,0.3)',
                    boxShadow: i < clickCount ? '0 0 6px rgba(96,165,250,0.8)' : 'none',
                    transform: i < clickCount ? 'scale(1)' : 'scale(0.9)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CSS keyframes */}
      <style>{`
        @keyframes hint-pop {
          0%   { opacity: 0; transform: translateY(14px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0)   scale(1);   }
        }
        @keyframes glow-streak {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%);  }
          100% { transform: translateX(100%);  }
        }
      `}</style>
    </>
  );
}
