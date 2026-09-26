import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

interface EditNotePageProps {
  params: {
    id: string;
  };
}

export default function EditNotePage({ params }: EditNotePageProps) {
  // NoteEditorForm fetches the note from Firestore client-side using the noteId
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Edit Note"
        subtitle="Update the lesson note and re-publish to students."
      />
      <NoteEditorForm noteId={params.id} isEditing={true} />
    </div>
  );
}
