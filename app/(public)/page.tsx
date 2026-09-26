'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Presentation,
  Clock,
  ArrowRight,
  Loader2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  GraduationCap,
  Users,
} from 'lucide-react';
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

  // Fetch hero settings and notes in parallel
  useEffect(() => {
    Promise.all([
      getHeroSettings(),
      getPublishedNotes(),
    ])
      .then(([heroData, notes]) => {
        setHero(heroData);
        setRecentNotes(notes);
      })
      .catch(console.error)
      .finally(() => setLoadingNotes(false));
  }, []);

  const totalImages = hero.images.length;

  const nextSlide = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveSlide((prev) => (prev + 1) % totalImages);
  }, [totalImages]);

  const prevSlide = useCallback(() => {
    if (totalImages <= 1) return;
    setActiveSlide((prev) => (prev - 1 + totalImages) % totalImages);
  }, [totalImages]);

  // Auto-advance hero background image every 10 seconds
  useEffect(() => {
    if (totalImages < 2) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 10000);
    return () => clearInterval(interval);
  }, [totalImages, nextSlide]);

  const topNotes = recentNotes.slice(0, 4);
  const currentImage = hero.images[activeSlide] || DEFAULT_HERO.images[0];

  const stats = [
    { icon: Users, label: 'Year Groups', value: '6 Classes' },
    { icon: BookOpen, label: 'Curriculum', value: 'All Subjects' },
    { icon: GraduationCap, label: 'Live Notes', value: `${recentNotes.length} Lessons` },
  ];

  return (
    <div className="space-y-16 pb-20">

      {/* ── HERO SECTION WITH FULL BACKGROUND IMAGE ──────────────── */}
      <section className="relative overflow-hidden bg-slate-950 min-h-[580px] sm:min-h-[640px] flex items-center justify-center">

        {/* 1. Full-bleed background images with cross-fade and dynamic opacity */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {hero.images.map((img, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${
                idx === activeSlide
                  ? 'scale-100'
                  : 'scale-105 pointer-events-none'
              }`}
              style={{
                opacity: idx === activeSlide ? ((hero.imageOpacity ?? 70) / 100) : 0,
              }}
            >
              <img
                src={img.url}
                alt={img.alt || 'Classroom hero background'}
                className="w-full h-full object-cover object-center"
              />
            </div>
          ))}
        </div>

        {/* 2. Layered dark and educational glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-950/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        {/* 3. Subtle ambient glow and pattern overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        </div>

        {/* 4. Floating Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 w-full">
          <div className="max-w-3xl text-white space-y-6">

            {/* Floating Pill Badge with Company Logo */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-md text-blue-300 text-xs font-semibold tracking-wide shadow-lg">
              <img
                src="/logo.png"
                alt="Lawtronic Technologies Logo"
                className="w-4 h-4 rounded-full object-contain bg-white flex-shrink-0"
              />
              <span>Lawtronic Technologies</span>
              <span className="text-blue-400/60">•</span>
              <span className="text-slate-300">Digital Classroom Platform</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white drop-shadow-md">
              {hero.headline.includes('Board') ? (
                <>
                  {hero.headline.split('Board')[0]}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-400">
                    Board
                  </span>
                  {hero.headline.split('Board')[1]}
                </>
              ) : (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-400">
                  {hero.headline}
                </span>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-xl sm:text-2xl md:text-3xl text-blue-100 font-semibold leading-snug drop-shadow-sm max-w-3xl">
              &ldquo;{hero.subheadline}&rdquo;
            </p>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-slate-300/90 max-w-2xl leading-relaxed">
              {hero.supportingText}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/classes"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <span>Browse Classes</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="#recent"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 shadow-lg"
              >
                <Clock className="w-4 h-4 text-blue-300" />
                <span>Recent Notes</span>
              </Link>
            </div>

            {/* Floating Quick Stats */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/10 max-w-lg">
              {stats.map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left"
                >
                  <Icon className="w-4 h-4 text-blue-400 mb-1" />
                  <p className="text-base sm:text-lg font-bold text-white leading-tight">{value}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Bottom Navigation Bar for Rotating Background Images */}
        <div className="absolute bottom-6 left-0 right-0 z-20 px-4 sm:px-8 flex items-center justify-between max-w-7xl mx-auto pointer-events-auto">
          {/* Active image caption overlay */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/15 text-white text-xs font-medium max-w-xs sm:max-w-md truncate shadow-lg">
            <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
            <span className="truncate">{currentImage.alt || 'Classroom preview'}</span>
            {totalImages > 1 && (
              <span className="text-[10px] text-blue-300 font-mono flex-shrink-0 ml-1">
                ({activeSlide + 1}/{totalImages})
              </span>
            )}
          </div>

          {/* Slide Indicator Dots and Arrows */}
          {totalImages > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevSlide}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition shadow-lg"
                title="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/60 backdrop-blur-md border border-white/15">
                {hero.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === activeSlide
                        ? 'w-6 h-2 bg-blue-400'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={nextSlide}
                className="p-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition shadow-lg"
                title="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
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
                    Latest classroom updates published by your teachers in real time
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
