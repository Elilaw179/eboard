'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  FilePlus,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import NotesTableClient from '@/app/admin/notes/NotesTableClient';

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const teacherName = user?.displayName || user?.email?.split('@')[0] || 'Teacher';

  return (
    <div className="flex-1 pb-16">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Staff & Teacher Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {teacherName}
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Create, upload, and organize your classroom notes and lesson materials. All published notes appear instantly for your students on the E-Board.
              </p>
              {user?.subject && (
                <div className="pt-1 flex items-center gap-2 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">Assigned Discipline:</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-600/30 border border-blue-500/30 text-blue-300 font-semibold">
                    {user.subject}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Upload CTA */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/staff/notes/new"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 transition duration-150 active:scale-95"
              >
                <FilePlus className="w-4 h-4" />
                <span>Upload New Note</span>
              </Link>
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-slate-700 transition"
              >
                <span>Student View</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Quick Action Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/staff/notes/new"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
              <FilePlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              <span>Upload / Create Note</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-blue-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add new lesson notes, formatted text, or PDF resources for your students.
            </p>
          </Link>

          <Link
            href="/staff/notes"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-between">
              <span>Manage Notes</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-indigo-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Review published lessons, edit existing content, or update drafts.
            </p>
          </Link>

          <Link
            href="/staff/subjects"
            className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-500/40 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center mb-3 transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              <span>Curriculum Subjects</span>
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-600" />
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Browse available curriculum categories and academic disciplines.
            </p>
          </Link>
        </div>

        {/* Embedded Notes Management Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Classroom Notes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Search, filter, edit, or upload notes.
              </p>
            </div>
            <Link
              href="/staff/notes/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <FilePlus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </Link>
          </div>
          <NotesTableClient initialNotes={[]} basePath="/staff/notes" />
        </div>
      </div>
    </div>
  );
}
