import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

interface EditNotePageProps {
  params: {
    id: string;
  };
}

export default function StaffEditNotePage({ params }: EditNotePageProps) {
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Edit Note"
        subtitle="Update your lesson note and re-publish to students."
      />
      <NoteEditorForm noteId={params.id} isEditing={true} />
    </div>
  );
}
