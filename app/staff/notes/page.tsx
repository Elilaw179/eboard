import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NotesTableClient from '@/app/admin/notes/NotesTableClient';

export const metadata = {
  title: 'My Notes — Staff Portal',
  description: 'View and manage your classroom notes.',
};

export default function StaffNotesPage() {
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Classroom Notes"
        subtitle="Manage and organize your notes, drafts, and published lessons."
        action={{
          label: 'Upload Note',
          href: '/staff/notes/new',
        }}
      />
      <NotesTableClient initialNotes={[]} basePath="/staff/notes" />
    </div>
  );
}
