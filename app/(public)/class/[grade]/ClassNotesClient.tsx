'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Sparkles, Filter } from 'lucide-react';
import { ClassDefinition } from '@/types/class';
import { Note } from '@/types/note';
import SubjectFilter from '@/components/student/SubjectFilter';
import NoteCard from '@/components/student/NoteCard';

interface ClassNotesClientProps {
  classDef: ClassDefinition;
  initialNotes: Note[];
}

export default function ClassNotesClient({ classDef, initialNotes }: ClassNotesClientProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique subjects from actual notes in this class
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    initialNotes.forEach((n) => {
      if (n.subject) subs.add(n.subject.trim());
    });
    return Array.from(subs).sort();
  }, [initialNotes]);

  // Filter notes by selected subject and search query
  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      const matchesSubject =
        selectedSubject === 'All' || note.subject.toLowerCase() === selectedSubject.toLowerCase();

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        note.title.toLowerCase().includes(q) ||
        note.subject.toLowerCase().includes(q) ||
        note.plainTextPreview.toLowerCase().includes(q);

      return matchesSubject && matchesSearch;
    });
  }, [initialNotes, selectedSubject, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Back to classes */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to ClassBoard
        </Link>
      </div>

      {/* Class Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              {classDef.stage}
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              {classDef.name}
            </h1>
            <p className="text-slate-600 text-base sm:text-lg mt-2 font-medium">
              Select a lesson to continue.
            </p>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">
              Available Lessons
            </span>
            <span className="text-3xl font-black text-blue-600">
              {initialNotes.length}
            </span>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/50 rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        {/* Dynamic Subject Filter */}
        <div className="flex-1 overflow-hidden">
          {availableSubjects.length > 0 ? (
            <SubjectFilter
              subjects={availableSubjects}
              selectedSubject={selectedSubject}
              onSelectSubject={setSelectedSubject}
            />
          ) : (
            <div className="text-xs text-slate-400">All Subjects</div>
          )}
        </div>

        {/* Instant Search Bar */}
        <div className="w-full md:w-72 relative">
          <input
            type="text"
            placeholder="Filter by title or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 shadow-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Notes Grid or Empty State */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        /* Friendly Empty State (Section 33) */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No notes found</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {searchQuery || selectedSubject !== 'All'
              ? `No notes match "${searchQuery || selectedSubject}". Try selecting "All" or clearing the search box.`
              : "Your teacher hasn't posted any notes for this class yet."}
          </p>
          {(searchQuery || selectedSubject !== 'All') && (
            <button
              onClick={() => {
                setSelectedSubject('All');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
