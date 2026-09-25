'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ClassGrade, CLASSES } from '@/types/class';
import { Note, NoteFormData, NoteStatus } from '@/types/note';
import { DEFAULT_SUBJECTS } from '@/types/subject';
import { createNote, updateNote } from '@/services/notes';
import { getAllSubjects, createSubject } from '@/services/subjects';
import TipTapEditor from '@/components/editor/TipTapEditor';

interface NoteEditorFormProps {
  initialNote?: Note;
  isEditing?: boolean;
}

export default function NoteEditorForm({
  initialNote,
  isEditing = false,
}: NoteEditorFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialNote?.title || '');
  const [className, setClassName] = useState<ClassGrade>(
    initialNote?.className || 'Year 10'
  );
  const [subject, setSubject] = useState(
    initialNote?.subject || 'Computer Science'
  );
  const [availableSubjects, setAvailableSubjects] = useState<string[]>(DEFAULT_SUBJECTS);
  const [customSubject, setCustomSubject] = useState('');
  const [isCustomSubject, setIsCustomSubject] = useState(false);

  useEffect(() => {
    getAllSubjects().then((subs) => {
      if (subs && subs.length > 0) {
        setAvailableSubjects(subs);
      }
    });
  }, []);
  const [content, setContent] = useState(
    initialNote?.content || `<h2>Lesson Overview</h2><p>Start typing or paste classroom notes directly from Microsoft Word...</p>`
  );

  const [status, setStatus] = useState<NoteStatus>(
    initialNote?.status || 'published'
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeSubject = isCustomSubject ? customSubject.trim() : subject;

  const handleSave = async (intendedStatus: NoteStatus) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please provide a lesson title before saving.');
      return;
    }

    if (!activeSubject) {
      setErrorMessage('Please select or enter a subject.');
      return;
    }

    if (!content.trim() || content === '<p></p>') {
      setErrorMessage('Please provide note content for your students.');
      return;
    }

    setIsSaving(true);
    setStatus(intendedStatus);

    try {
      if (isCustomSubject && customSubject.trim()) {
        try {
          await createSubject(customSubject.trim());
        } catch (e) {
          console.warn('Failed to persist custom subject:', e);
        }
      }

      const formData: NoteFormData = {
        title: title.trim(),
        subject: activeSubject,
        className,
        content,
        status: intendedStatus,
      };

      if (isEditing && initialNote) {
        await updateNote(initialNote.id, formData);
        setSuccessMessage(
          intendedStatus === 'published'
            ? 'Lesson successfully published to the student portal!'
            : 'Lesson saved as draft!'
        );
      } else {
        const newId = await createNote(formData);
        setSuccessMessage(
          intendedStatus === 'published'
            ? 'Lesson successfully published to the student portal!'
            : 'Lesson saved as draft!'
        );
        setTimeout(() => {
          router.push('/admin/notes');
        }, 1200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 space-y-6">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/admin/notes"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Notes List
        </Link>

        <div className="flex items-center gap-3">
          {isEditing && initialNote && (
            <Link
              href={`/note/${initialNote.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview Board</span>
            </Link>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => handleSave('published')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/25 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Note</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-emerald-800 text-xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* METADATA FORM: Class, Subject, Title                     */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Class Select Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
              Class Year Group <span className="text-red-500">*</span>
            </label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value as ClassGrade)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CLASSES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.stage})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Select */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Subject <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsCustomSubject(!isCustomSubject)}
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {isCustomSubject ? 'Choose from list' : '+ Custom subject'}
              </button>
            </div>

            {isCustomSubject ? (
              <input
                type="text"
                value={customSubject}
                onChange={(e) => setCustomSubject(e.target.value)}
                placeholder="e.g. Environmental Systems"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableSubjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Note Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
            Lesson / Note Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Introduction to C Programming"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 placeholder:font-normal"
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* WORD-LIKE RICH TEXT EDITOR CANVAS                         */}
      {/* ========================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            Note Document Canvas (Microsoft Word-Compatible)
          </label>
          <span className="text-[11px] text-slate-400">
            Supports pasting formatted text, tables & lists directly from Word
          </span>
        </div>

        <TipTapEditor
          content={content}
          onChange={(newHtml) => setContent(newHtml)}
        />
      </div>

      {/* Bottom Save bar */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave('draft')}
          className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={() => handleSave('published')}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>Publish Note to Class</span>
        </button>
      </div>
    </div>
  );
}
