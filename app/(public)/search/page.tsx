import React, { Suspense } from 'react';
import SearchClient from './SearchClient';

export const metadata = {
  title: 'Search Notes — ClassBoard',
  description: 'Search digital whiteboard notes across all classes and subjects.',
};

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400">Loading search...</div>}>
      <SearchClient />
    </Suspense>
  );
}
