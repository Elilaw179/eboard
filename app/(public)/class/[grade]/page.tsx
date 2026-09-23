import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getClassBySlug, CLASSES } from '@/types/class';
import { getPublishedNotes } from '@/services/notes';
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

export default async function ClassPage({ params }: PageProps) {
  const classDef = getClassBySlug(params.grade);

  if (!classDef) {
    notFound();
  }

  const notes = await getPublishedNotes({ classSlug: classDef.slug });

  return <ClassNotesClient classDef={classDef} initialNotes={notes} />;
}
