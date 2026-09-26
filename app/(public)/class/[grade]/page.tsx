import React from 'react';
import { Metadata } from 'next';
import { getClassBySlug, CLASSES } from '@/types/class';
import { notFound } from 'next/navigation';
import ClassNotesClient from './ClassNotesClient';

interface PageProps {
  params: {
    grade: string;
  };
}

export function generateStaticParams() {
  return CLASSES.map((c) => ({
    grade: c.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const classDef = getClassBySlug(params.grade);
  if (!classDef) {
    return { title: 'Class Not Found — ClassBoard' };
  }
  return {
    title: `${classDef.name} Classroom Notes — ClassBoard`,
    description: `Browse all published digital whiteboard notes, lessons, and summaries for ${classDef.name} (${classDef.stage}).`,
  };
}

export default function ClassPage({ params }: PageProps) {
  const classDef = getClassBySlug(params.grade);

  if (!classDef) {
    notFound();
  }

  // Data is fetched client-side inside ClassNotesClient using Firestore
  return <ClassNotesClient classDef={classDef} />;
}
