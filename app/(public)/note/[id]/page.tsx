import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getNoteById } from '@/services/notes';
import NoteReaderClient from './NoteReaderClient';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const note = await getNoteById(params.id);
  if (!note) {
    return { title: 'Note Not Found — ClassBoard' };
  }
  return {
    title: `${note.title} — ${note.className} ${note.subject} — ClassBoard`,
    description: note.plainTextPreview || `Classroom note on ${note.title} for ${note.className} students.`,
  };
}

export default async function NotePage({ params }: PageProps) {
  const note = await getNoteById(params.id);

  if (!note) {
    notFound();
  }

  return <NoteReaderClient note={note} />;
}
