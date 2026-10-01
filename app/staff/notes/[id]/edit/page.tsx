import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

interface StaffEditNotePageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Edit Note — Staff Portal',
  description: 'Update and republish your lesson note.',
};

export default function StaffEditNotePage({ params }: StaffEditNotePageProps) {
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
