import React from 'react';

// Skeleton loading screen shown instantly while the home page data fetches
export default function HomeLoading() {
  return (
    <div className="space-y-16 pb-20 animate-pulse">
      {/* Hero Skeleton */}
      <section className="relative overflow-hidden pt-12 pb-14 bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-50 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex mx-auto mb-6 w-40 h-6 rounded-full bg-slate-200" />
          <div className="mx-auto w-64 h-12 rounded-xl bg-slate-200 mb-4" />
          <div className="mx-auto w-96 h-6 rounded-lg bg-slate-200 mb-3" />
          <div className="mx-auto w-72 h-4 rounded-lg bg-slate-200" />
        </div>
      </section>

      {/* Class Cards Skeleton */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-44 h-7 rounded-lg bg-slate-200 mb-2" />
            <div className="w-64 h-4 rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-xl bg-slate-200" />
                <div className="w-16 h-6 rounded-full bg-slate-200" />
              </div>
              <div className="w-28 h-7 rounded-lg bg-slate-200 mb-3" />
              <div className="w-full h-4 rounded-lg bg-slate-200 mb-2" />
              <div className="w-3/4 h-4 rounded-lg bg-slate-200" />
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="w-20 h-4 rounded-lg bg-slate-200" />
                <div className="w-28 h-4 rounded-lg bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
