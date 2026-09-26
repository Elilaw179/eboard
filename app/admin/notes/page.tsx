import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import NotesTableClient from './NotesTableClient';

export default function AdminNotesPage() {
  return (
    <div className="flex-1 pb-12">
      <AdminHeader
        title="Classroom Notes"
        subtitle="Manage and organize all lessons, draft notes, and live whiteboard content."
        action={{
          label: 'Create Note',
          href: '/admin/notes/new',
        }}
      />
      <NotesTableClient initialNotes={[]} />
    </div>
  );
}
