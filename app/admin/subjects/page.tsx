import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import SubjectsClient from '@/components/admin/SubjectsClient';

export default function SubjectsPage() {
  // Notes are fetched client-side by SubjectsClient
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Subjects Directory"
        subtitle="Manage academic subjects and curriculum disciplines available for classroom notes."
      />
      <SubjectsClient />
    </div>
  );
}
