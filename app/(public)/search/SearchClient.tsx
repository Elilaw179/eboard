'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { Note } from '@/types/note';
import { searchNotes, getPublishedNotes } from '@/services/notes';
import NoteCard from '@/components/student/NoteCard';

export default function SearchClient() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const notes = await getPublishedNotes();
      setAllNotes(notes);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults(allNotes);
      return;
    }

    const q = query.toLowerCase().trim();
    const filtered = allNotes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.className.toLowerCase().includes(q) ||
        n.plainTextPreview.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query, allNotes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to ClassBoard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto text-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Classroom Notes
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          Search by topic, keyword, subject (e.g. Computer Science, Physics), or year group.
        </p>

        <div className="relative mt-6">
          <input
            type="text"
            placeholder="Type to search (e.g. 'variables', 'momentum', 'calculus')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-11 pr-4 py-3.5 text-base bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Searching notes...</div>
      ) : results.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {results.length} Note{results.length === 1 ? '' : 's'} Found
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((note) => (
              <NoteCard key={note.id} note={note} showClass={true} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-sm max-w-md mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No results matching &ldquo;{query}&rdquo;</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Check your spelling or try searching for a broader term like a subject or year group.
          </p>
          <button
            onClick={() => setQuery('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
