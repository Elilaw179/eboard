import React from 'react';
import { notFound } from 'next/navigation';
import { getNoteById } from '@/services/notes';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

interface EditNotePageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function EditNotePage({ params }: EditNotePageProps) {
  const note = await getNoteById(params.id);

  if (!note) {
    notFound();
  }

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title={`Edit Note: ${note.title}`}
        subtitle={`Updating lesson note for ${note.className} (${note.subject})`}
      />
      <NoteEditorForm initialNote={note} isEditing={true} />
    </div>
  );
}
