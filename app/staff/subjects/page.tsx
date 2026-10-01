import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import SubjectsClient from '@/components/admin/SubjectsClient';

export const metadata = {
  title: 'Subjects — Staff Portal',
  description: 'Browse academic subjects available for your classroom notes.',
};

export default function StaffSubjectsPage() {
  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Curriculum Subjects"
        subtitle="Browse academic subjects and disciplines available for your classroom notes."
      />
      <SubjectsClient />
    </div>
  );
}
