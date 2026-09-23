import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { CLASSES } from '@/types/class';
import { getPublishedNotes } from '@/services/notes';
import ClassCard from '@/components/student/ClassCard';

export const metadata = {
  title: 'All Classes — ClassBoard',
  description: 'Select your class year group from Year 7 to Year 12 to browse digital classroom whiteboard notes.',
};

export default async function ClassesPage() {
  const notes = await getPublishedNotes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Breadcrumb / Back button */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      <div className="border-b border-slate-200 pb-6 mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Classes & Year Groups
        </h1>
        <p className="text-base text-slate-600 mt-2">
          Select your class to access all active subjects, classroom board notes, and lecture summaries.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLASSES.map((classDef) => {
          const count = notes.filter((n) => n.className === classDef.name).length;
          return (
            <ClassCard
              key={classDef.slug}
              classDef={classDef}
              noteCount={count}
            />
          );
        })}
      </div>
    </div>
  );
}
