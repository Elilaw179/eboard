'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, Loader2 } from 'lucide-react';
import { ClassDefinition } from '@/types/class';
import { Note } from '@/types/note';
import { getPublishedNotes } from '@/services/notes';
import SubjectFilter from '@/components/student/SubjectFilter';
import NoteCard from '@/components/student/NoteCard';
import ClassAccessGate from '@/components/student/ClassAccessGate';
import {
  getClassPassword,
  isClassUnlocked,
  lockClassInSession,
} from '@/services/classPasswords';
import { Lock, Unlock } from 'lucide-react';

interface ClassNotesClientProps {
  classDef: ClassDefinition;
}

export default function ClassNotesClient({ classDef }: ClassNotesClientProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Password Protection State
  const [isCheckingPassword, setIsCheckingPassword] = useState(true);
  const [isPasswordRequired, setIsPasswordRequired] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Check password protection on mount
  useEffect(() => {
    async function checkProtection() {
      try {
        const config = await getClassPassword(classDef.slug);
        if (config && config.enabled && config.password) {
          setIsPasswordRequired(true);
          const alreadyUnlocked = isClassUnlocked(classDef.slug);
          setIsUnlocked(alreadyUnlocked);
        } else {
          setIsPasswordRequired(false);
          setIsUnlocked(true);
        }
      } catch (err) {
        console.warn('Error checking class password:', err);
        setIsUnlocked(true);
      } finally {
        setIsCheckingPassword(false);
      }
    }

    checkProtection();
  }, [classDef.slug]);

  // Fetch from Firestore on mount if unlocked
  useEffect(() => {
    if (!isUnlocked) return;
    setLoading(true);
    getPublishedNotes({ classSlug: classDef.slug })
      .then((data) => setNotes(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [classDef.slug, isUnlocked]);

  // Extract unique subjects from actual notes in this class
  const availableSubjects = useMemo(() => {
    const subs = new Set<string>();
    notes.forEach((n) => {
      if (n.subject) subs.add(n.subject.trim());
    });
    return Array.from(subs).sort();
  }, [notes]);

  // Filter notes by selected subject and search query
  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
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
  }, [notes, selectedSubject, searchQuery]);

  // Re-lock this class
  const handleLockClass = () => {
    lockClassInSession(classDef.slug);
    setIsUnlocked(false);
  };

  // If currently checking password status, show smooth spinner
  if (isCheckingPassword) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If class is password protected and not unlocked yet, render Password Gate!
  if (isPasswordRequired && !isUnlocked) {
    return (
      <ClassAccessGate
        classDef={classDef}
        onUnlocked={() => setIsUnlocked(true)}
        backHref="/"
      />
    );
  }

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
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                {classDef.stage}
              </span>
              {isPasswordRequired && isUnlocked && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Class Unlocked</span>
                  <button
                    type="button"
                    onClick={handleLockClass}
                    className="ml-1 text-[11px] text-slate-500 hover:text-red-600 font-bold underline"
                    title="Lock this class"
                  >
                    Lock
                  </button>
                </div>
              )}
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
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500 mt-1" />
            ) : (
              <span className="text-3xl font-black text-blue-600">
                {notes.length}
              </span>
            )}
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

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-slate-500 text-sm">Loading notes from Firestore...</span>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        /* Friendly Empty State */
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
