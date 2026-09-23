import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

export const metadata = {
  title: 'Create Note — Teacher Portal',
  description: 'Write and publish new classroom whiteboard notes.',
};

export default function NewNotePage() {
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Create Note"
        subtitle="Write or paste your classroom notes in the Word-like whiteboard editor and publish to your students."
      />
      <NoteEditorForm />
    </div>
  );
}
