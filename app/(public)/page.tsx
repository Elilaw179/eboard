import React from 'react';
import Link from 'next/link';
import { Presentation, Sparkles, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { CLASSES } from '@/types/class';
import { getPublishedNotes } from '@/services/notes';
import ClassCard from '@/components/student/ClassCard';
import NoteCard from '@/components/student/NoteCard';

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  const recentNotes = await getPublishedNotes();
  const topNotes = recentNotes.slice(0, 4);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-14 md:pt-18 md:pb-20 bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Subtle educational pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm border border-blue-200/50">
            <Presentation className="w-3.5 h-3.5" />
            <span>Digital Classroom Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Class<span className="text-blue-600">Board</span>
          </h1>

          {/* Tagline */}
          <p className="mt-4 text-xl sm:text-2xl text-slate-700 font-medium max-w-2xl mx-auto">
            &ldquo;Your classroom notes, always within reach.&rdquo;
          </p>

          {/* Supporting Text */}
          <p className="mt-3 text-base text-slate-500 max-w-xl mx-auto">
            Select your class to access your lessons, whiteboard summaries, and study notes.
          </p>
        </div>

        {/* Decorative soft circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-100/40 blur-3xl rounded-full pointer-events-none -z-0" />
      </section>

      {/* Class Cards Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Select Your Class
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose your year group to view published lesson notes
            </p>
          </div>
          <Link
            href="/classes"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
          >
            All classes
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Six Class Cards Grid: Year 7 - Year 12 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASSES.map((classDef) => {
            const count = recentNotes.filter((n) => n.className === classDef.name).length;
            return (
              <ClassCard
                key={classDef.slug}
                classDef={classDef}
                noteCount={count}
              />
            );
          })}
        </div>
      </section>

      {/* Recently Posted Section */}
      {topNotes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-center justify-between mb-8 border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Recently Posted Notes
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  The latest classroom whiteboard updates and notes published by your teachers
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topNotes.map((note) => (
              <NoteCard key={note.id} note={note} showClass={true} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
