import React from 'react';
import Link from 'next/link';
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Plus,
  ArrowRight,
  Sparkles,
  Compass,
  Atom,
  Cpu,
  BookOpen,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';
import { getAllNotesForAdmin } from '@/services/notes';
import { CLASSES } from '@/types/class';
import AdminHeader from '@/components/admin/AdminHeader';
import { formatDate } from '@/lib/utils/format';

export const revalidate = 0; // Dynamic for real-time dashboard accuracy

const CLASS_ICONS: Record<string, React.ElementType> = {
  'Year 7': Sparkles,
  'Year 8': Compass,
  'Year 9': Atom,
  'Year 10': Cpu,
  'Year 11': BookOpen,
  'Year 12': GraduationCap,
};

export default async function AdminDashboardPage() {
  const notes = await getAllNotesForAdmin();

  const totalNotes = notes.length;
  const publishedNotes = notes.filter((n) => n.status === 'published').length;
  const draftNotes = notes.filter((n) => n.status === 'draft').length;

  const classCounts: Record<string, number> = {};
  CLASSES.forEach((c) => {
    classCounts[c.name] = notes.filter((n) => n.className === c.name).length;
  });

  const recentNotes = notes.slice(0, 5);

  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        title="Dashboard Overview"
        subtitle="Summary of classroom notes, publication statuses, and year group distribution."
        action={{
          label: 'Create New Note',
          href: '/admin/notes/new',
          icon: Plus,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* ========================================================= */}
        {/* CORE STATS: Total, Published, Drafts                      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Notes</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{totalNotes}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Published Notes</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{publishedNotes}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileEdit className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Draft Notes</p>
              <h3 className="text-3xl font-black text-slate-900 mt-0.5">{draftNotes}</h3>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* PER-CLASS DISTRIBUTION: Year 7 - Year 12                  */}
        {/* ========================================================= */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Notes by Class</h2>
            <span className="text-xs text-slate-400">Year 7 through Year 12</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CLASSES.map((classDef) => {
              const Icon = CLASS_ICONS[classDef.name] || BookOpen;
              const count = classCounts[classDef.name] || 0;
              return (
                <div
                  key={classDef.name}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:border-blue-300 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-black text-slate-900">{count}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{classDef.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {count === 1 ? '1 lesson note' : `${count} lesson notes`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* RECENT NOTES TABLE                                        */}
        {/* ========================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Notes</h2>
              <p className="text-xs text-slate-500">Latest classroom documents and revisions</p>
            </div>
            <Link
              href="/admin/notes"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Notes
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Created</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentNotes.map((note) => (
                  <tr key={note.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs truncate">
                      {note.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium">
                        {note.className}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-medium">
                      {note.subject}
                    </td>
                    <td className="px-6 py-4">
                      {note.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {formatDate(note.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/admin/notes/${note.id}/edit`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/note/${note.id}`}
                        target="_blank"
                        className="text-xs font-semibold text-slate-400 hover:text-slate-600 hover:underline inline-flex items-center gap-0.5 ml-2"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
