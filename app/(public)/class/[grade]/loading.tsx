import React from 'react';

// Skeleton loading screen shown instantly while class notes data loads
export default function ClassLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="w-48 h-4 rounded-lg bg-slate-200 mb-4" />
        <div className="w-40 h-9 rounded-xl bg-slate-200 mb-2" />
        <div className="w-64 h-4 rounded-lg bg-slate-200" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="w-20 h-8 rounded-full bg-slate-200" />
        ))}
      </div>

      {/* Note cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-16 h-5 rounded-full bg-slate-200" />
              <div className="w-24 h-5 rounded-full bg-slate-200" />
            </div>
            <div className="w-3/4 h-6 rounded-lg bg-slate-200 mb-3" />
            <div className="w-full h-4 rounded-lg bg-slate-200 mb-2" />
            <div className="w-5/6 h-4 rounded-lg bg-slate-200 mb-2" />
            <div className="w-2/3 h-4 rounded-lg bg-slate-200" />
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="w-24 h-4 rounded-lg bg-slate-200" />
              <div className="w-20 h-4 rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
