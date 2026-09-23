import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Note } from '@/types/note';
import { formatDate, getReadingTime } from '@/lib/utils/format';

interface NoteCardProps {
  note: Note;
  showClass?: boolean;
}

export default function NoteCard({ note, showClass = false }: NoteCardProps) {
  const formattedDate = formatDate(note.createdAt);
  const readTime = getReadingTime(note.content);

  return (
    <div className="group flex flex-col justify-between bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
      <div>
        {/* Top Badges: Subject & Class */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
            {note.subject}
          </span>
          {showClass && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {note.className}
            </span>
          )}
        </div>

        {/* Note Title */}
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
          <Link href={`/note/${note.id}`} className="focus:outline-none">
            {note.title}
          </Link>
        </h3>

        {/* Short Description */}
        <p className="text-sm text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
          {note.plainTextPreview}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formattedDate}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {readTime}
          </span>
        </div>

        <Link
          href={`/note/${note.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 group-hover:shadow-sm"
        >
          Open Note
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
