'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookMarked, Plus, ArrowRight, FileText, Sparkles } from 'lucide-react';
import { DEFAULT_SUBJECTS } from '@/types/subject';
import { Note } from '@/types/note';

interface SubjectsClientProps {
  initialNotes: Note[];
}

export default function SubjectsClient({ initialNotes }: SubjectsClientProps) {
  const [subjectsList, setSubjectsList] = useState<string[]>(() => {
    const set = new Set(DEFAULT_SUBJECTS);
    initialNotes.forEach((n) => {
      if (n.subject) set.add(n.subject.trim());
    });
    return Array.from(set).sort();
  });

  const [newSubject, setNewSubject] = useState('');

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newSubject.trim();
    if (!clean) return;
    if (subjectsList.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      alert('This subject is already in your subjects list.');
      return;
    }
    setSubjectsList((prev) => [...prev, clean].sort());
    setNewSubject('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Add New Subject Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Add Academic Subject</h3>
        <p className="text-xs text-slate-500 mb-4">
          Add a new subject to make it available in the lesson creator dropdown and student filter pills.
        </p>

        <form onSubmit={handleAddSubject} className="flex gap-3 max-w-md">
          <input
            type="text"
            placeholder="e.g. Design & Technology, Economics..."
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="flex-1 px-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subject</span>
          </button>
        </form>
      </div>

      {/* Grid of subjects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Active Subjects ({subjectsList.length})</h3>
          <span className="text-xs text-slate-400">Available across Year 7 to Year 12</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectsList.map((subj) => {
            const count = initialNotes.filter((n) => n.subject.toLowerCase() === subj.toLowerCase()).length;
            return (
              <div
                key={subj}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-blue-300 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookMarked className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{subj}</h4>
                    <span className="text-xs text-slate-400">
                      {count} lesson note{count === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/admin/notes?subject=${encodeURIComponent(subj)}`}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="View notes in this subject"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
