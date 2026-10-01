import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NoteEditorForm from '@/components/admin/NoteEditorForm';

export const metadata = {
  title: 'Upload Note — Staff Portal',
  description: 'Write and publish a new classroom note.',
};

export default function StaffNewNotePage() {
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Upload Note"
        subtitle="Write or paste your classroom notes and publish them to your students."
      />
      <NoteEditorForm />
    </div>
  );
}
