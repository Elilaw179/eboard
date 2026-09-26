'use client';

import React, { useState, useEffect } from 'react';
import { BookMarked, Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { DEFAULT_SUBJECTS } from '@/types/subject';
import { Note } from '@/types/note';
import {
  getAllSubjectRecords, createSubject, updateSubject, deleteSubject,
  SubjectRecord,
} from '@/services/subjects';
import { getAllNotesForAdmin } from '@/services/notes';

interface SubjectItem extends SubjectRecord {
  isDefault: boolean; // Default subjects can't be deleted via Firestore (they're static)
}

export default function SubjectsClient() {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // "Add" form state
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // "Edit" state — tracks which subject is being edited
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // "Delete" state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Fetch subjects + notes from Firestore
  useEffect(() => {
    Promise.all([
      getAllSubjectRecords(),
      getAllNotesForAdmin().catch(() => [] as Note[]),
    ]).then(([firestoreRecords, fetchedNotes]) => {
      // Build merged list: Firestore records first, then any defaults not in Firestore
      const firestoreNames = new Set(firestoreRecords.map((r) => r.name.toLowerCase()));
      const defaultOnlyItems: SubjectItem[] = DEFAULT_SUBJECTS
        .filter((name) => !firestoreNames.has(name.toLowerCase()))
        .map((name) => ({ id: `default-${name}`, name, isDefault: true }));

      const firestoreItems: SubjectItem[] = firestoreRecords.map((r) => ({
        ...r,
        isDefault: false,
      }));

      setSubjects([...firestoreItems, ...defaultOnlyItems].sort((a, b) => a.name.localeCompare(b.name)));
      setNotes(fetchedNotes);
    }).catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  /* ── ADD ── */
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    if (subjects.some((s) => s.name.toLowerCase() === clean.toLowerCase())) {
      setError('This subject already exists.');
      return;
    }
    setIsAdding(true);
    setError(null);
    try {
      const id = await createSubject(clean);
      setSubjects((prev) =>
        [...prev, { id, name: clean, isDefault: false }].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName('');
    } catch (err: any) {
      setError(err.message || 'Failed to add subject.');
    } finally {
      setIsAdding(false);
    }
  };

  /* ── EDIT ── */
  const startEdit = (subject: SubjectItem) => {
    setEditingId(subject.id);
    setEditValue(subject.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const handleSaveEdit = async (subject: SubjectItem) => {
    const clean = editValue.trim();
    if (!clean || clean === subject.name) { cancelEdit(); return; }
    if (subjects.some((s) => s.id !== subject.id && s.name.toLowerCase() === clean.toLowerCase())) {
      setError('A subject with this name already exists.');
      return;
    }
    setIsSavingEdit(true);
    setError(null);
    try {
      if (!subject.isDefault) {
        await updateSubject(subject.id, clean);
      }
      setSubjects((prev) =>
        prev.map((s) => s.id === subject.id ? { ...s, name: clean } : s)
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      cancelEdit();
    } catch (err: any) {
      setError(err.message || 'Failed to rename subject.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  /* ── DELETE ── */
  const handleDelete = async (subject: SubjectItem) => {
    if (subject.isDefault) {
      setError('Default subjects cannot be deleted (they are built-in). You can still rename them.');
      return;
    }
    if (!confirm(`Delete subject "${subject.name}"? Notes using this subject won't be affected.`)) return;
    setDeletingId(subject.id);
    setError(null);
    try {
      await deleteSubject(subject.id);
      setSubjects((prev) => prev.filter((s) => s.id !== subject.id));
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── ADD NEW ── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-1">Add Academic Subject</h3>
        <p className="text-xs text-slate-500 mb-4">
          Add a new subject to make it available in the lesson creator and student filter pills.
        </p>
        <form onSubmit={handleAdd} className="flex gap-3 max-w-md">
          <input
            type="text"
            placeholder="e.g. Design & Technology, Economics..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <button
            type="submit"
            disabled={isAdding || !newName.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition shadow-sm"
          >
            {isAdding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add Subject
          </button>
        </form>
      </div>

      {/* ── SUBJECTS LIST ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Active Subjects ({subjects.length})
          </h3>
          <span className="text-xs text-slate-400">Available across Year 7 to Year 12</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-12 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-sm">Loading subjects from Firestore...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subj) => {
              const count = notes.filter(
                (n) => n.subject.toLowerCase() === subj.name.toLowerCase()
              ).length;
              const isEditing = editingId === subj.id;
              const isDeleting = deletingId === subj.id;

              return (
                <div
                  key={subj.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-300 transition group"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookMarked className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        /* ── Edit Mode ── */
                        <div className="space-y-2">
                          <input
                            autoFocus
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(subj);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                            className="w-full px-2.5 py-1.5 text-sm font-semibold border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50 text-slate-900"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSaveEdit(subj)}
                              disabled={isSavingEdit}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                            >
                              {isSavingEdit
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Check className="w-3 h-3" />}
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                            >
                              <X className="w-3 h-3" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* ── View Mode ── */
                        <>
                          <h4 className="font-bold text-slate-900 text-sm truncate">{subj.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                              {count} note{count === 1 ? '' : 's'}
                            </span>
                            {subj.isDefault && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 uppercase tracking-wide">
                                Built-in
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Actions (hidden until hover) */}
                    {!isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Edit */}
                        <button
                          onClick={() => startEdit(subj)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={`Rename "${subj.name}"`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        {!subj.isDefault && (
                          <button
                            onClick={() => handleDelete(subj)}
                            disabled={isDeleting}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title={`Delete "${subj.name}"`}
                          >
                            {isDeleting
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
