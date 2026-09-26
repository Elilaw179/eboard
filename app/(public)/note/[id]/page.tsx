import React from 'react';
import { Metadata } from 'next';
import NoteReaderClient from './NoteReaderClient';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Basic metadata — NoteReaderClient will load the full note from Firestore
  return {
    title: 'Loading Note — ClassBoard',
    description: 'Classroom note from ClassBoard digital notes portal.',
  };
}

export default function NotePage({ params }: PageProps) {
  // The note is fetched client-side by NoteReaderClient
  return <NoteReaderClient noteId={params.id} />;
}
