'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Presentation, Clock, ArrowRight, Loader2, ChevronRight, BookOpen, GraduationCap, Users } from 'lucide-react';
import { CLASSES } from '@/types/class';
import { getPublishedNotes } from '@/services/notes';
import { getHeroSettings, HeroSettings, DEFAULT_HERO } from '@/services/hero';
import { Note } from '@/types/note';
import ClassCard from '@/components/student/ClassCard';
import NoteCard from '@/components/student/NoteCard';

export default function HomePage() {
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [hero, setHero] = useState<HeroSettings>(DEFAULT_HERO);
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideTransition, setSlideTransition] = useState(true);

  // Fetch hero settings and notes in parallel
  useEffect(() => {
    Promise.all([
      getHeroSettings(),
      getPublishedNotes(),
    ]).then(([heroData, notes]) => {
      setHero(heroData);
      setRecentNotes(notes);
    }).catch(console.error)
      .finally(() => setLoadingNotes(false));
  }, []);

  // Auto-advance hero image every 10 seconds
  useEffect(() => {
    if (hero.images.length < 2) return;
    const interval = setInterval(() => {
      setSlideTransition(false);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % hero.images.length);
        setSlideTransition(true);
      }, 300);
    }, 10000);
    return () => clearInterval(interval);
  }, [hero.images.length]);

  const topNotes = recentNotes.slice(0, 4);
  const currentImage = hero.images[activeSlide] || DEFAULT_HERO.images[0];

  const stats = [
    { icon: Users, label: 'Year Groups', value: '6' },
    { icon: BookOpen, label: 'Subjects', value: '10+' },
    { icon: GraduationCap, label: 'Digital Notes', value: `${recentNotes.length}` },
  ];

  return (
    <div className="space-y-20 pb-20">

      {/* ── HERO SECTION ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 min-h-[560px] flex items-center">

        {/* Animated background pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Grid dots */}
          <div className="absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '40px 40px' }}
          />
          {/* Glowing orbs */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* LEFT: Text Content */}
            <div className="text-white space-y-6">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm text-blue-300 text-xs font-semibold tracking-wide">
                <Presentation className="w-3.5 h-3.5" />
                Digital Classroom Platform
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1]">
                {hero.headline.includes('Board') ? (
                  <>
                    {hero.headline.split('Board')[0]}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                      Board
                    </span>
                    {hero.headline.split('Board')[1]}
                  </>
                ) : (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {hero.headline}
                  </span>
                )}
              </h1>

              {/* Sub-headline */}
              <p className="text-xl sm:text-2xl text-blue-100/90 font-medium leading-snug">
                &ldquo;{hero.subheadline}&rdquo;
              </p>

              {/* Supporting text */}
              <p className="text-base text-slate-300/80 max-w-md leading-relaxed">
                {hero.supportingText}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/classes"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95"
                >
                  Browse Classes
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#recent"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-sm border border-white/20 backdrop-blur-sm transition-all"
                >
                  Recent Notes
                </Link>
              </div>

              {/* Live stats */}
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                {stats.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-white">{value}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Animated Image Card */}
            <div className="relative hidden lg:block">
              {/* Image container with glassmorphism frame */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3]">
                {/* Actual image */}
                <img
                  key={activeSlide}
                  src={currentImage.url}
                  alt={currentImage.alt}
                  className="w-full h-full object-cover"
                  style={{
                    opacity: slideTransition ? 1 : 0,
                    transition: 'opacity 0.4s ease-in-out',
                  }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                {/* Caption overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-semibold bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                    {currentImage.alt}
                  </p>
                </div>

                {/* Slide dots */}
                {hero.images.length > 1 && (
                  <div className="absolute top-4 right-4 flex gap-1.5">
                    {hero.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setSlideTransition(false); setTimeout(() => { setActiveSlide(i); setSlideTransition(true); }, 200); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === activeSlide
                            ? 'w-6 h-2 bg-white'
                            : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Floating decorative cards */}
              <div className="absolute -top-4 -right-4 bg-blue-500/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-blue-400/30 text-white">
                <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wider">Year Groups</p>
                <p className="text-2xl font-black">Y7 — Y12</p>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-indigo-600/90 backdrop-blur-md rounded-2xl px-4 py-3 shadow-xl border border-indigo-400/30 text-white">
                <p className="text-[10px] font-semibold text-indigo-200 uppercase tracking-wider">Updated</p>
                <p className="text-sm font-bold">Every lesson</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CLASS CARDS ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select Your Class</h2>
            <p className="text-sm text-slate-500 mt-1">Choose your year group to view published lesson notes</p>
          </div>
          <Link
            href="/classes"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            All classes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASSES.map((classDef) => {
            const count = recentNotes.filter((n) => n.className === classDef.name).length;
            return <ClassCard key={classDef.slug} classDef={classDef} noteCount={count} />;
          })}
        </div>
      </section>

      {/* ── RECENT NOTES ─────────────────────────────────────────── */}
      <section id="recent" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loadingNotes ? (
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm">Loading recent notes...</span>
          </div>
        ) : topNotes.length > 0 && (
          <>
            <div className="flex items-center justify-between mb-8 border-b border-slate-200/80 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Recently Posted Notes</h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Latest classroom updates published by your teachers
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topNotes.map((note) => (
                <NoteCard key={note.id} note={note} showClass={true} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
