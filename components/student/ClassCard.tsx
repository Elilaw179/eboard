import React from 'react';
import Link from 'next/link';
import { Sparkles, Compass, Atom, Cpu, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import { ClassDefinition } from '@/types/class';

interface ClassCardProps {
  classDef: ClassDefinition;
  noteCount?: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Sparkles,
  Compass,
  Atom,
  Cpu,
  BookOpen,
  GraduationCap,
};

export default function ClassCard({ classDef, noteCount }: ClassCardProps) {
  const IconComponent = ICON_MAP[classDef.iconName] || BookOpen;

  return (
    <Link
      href={`/class/${classDef.slug}`}
      className="group relative flex flex-col justify-between bg-white rounded-2xl p-7 border border-slate-200/80 hover:border-blue-400/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      {/* Subtle decorative background gradient hint */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      <div>
        {/* Header with Icon and Stage Badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="w-13 h-13 w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
            <IconComponent className="w-6 h-6" />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
            {classDef.stage}
          </span>
        </div>

        {/* Class Name */}
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
          {classDef.name}
        </h3>

        {/* Short description */}
        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {classDef.description}
        </p>
      </div>

      {/* Footer / Call to action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
        <span className="text-xs font-medium text-slate-400">
          {typeof noteCount === 'number' ? `${noteCount} lesson${noteCount === 1 ? '' : 's'}` : 'View lessons'}
        </span>
        <span className="inline-flex items-center gap-1.5 font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
          Access Notes
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
