'use client';

import React from 'react';

interface SubjectFilterProps {
  subjects: string[];
  selectedSubject: string;
  onSelectSubject: (subject: string) => void;
}

export default function SubjectFilter({
  subjects,
  selectedSubject,
  onSelectSubject,
}: SubjectFilterProps) {
  const allSubjects = ['All', ...subjects.filter((s) => s.toLowerCase() !== 'all')];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar">
      {allSubjects.map((subject) => {
        const isSelected = selectedSubject.toLowerCase() === subject.toLowerCase();
        return (
          <button
            key={subject}
            onClick={() => onSelectSubject(subject)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${
              isSelected
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
            }`}
          >
            {subject}
          </button>
        );
      })}
    </div>
  );
}
