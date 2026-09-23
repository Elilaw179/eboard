import React from 'react';
import StudentNavbar from '@/components/student/Navbar';
import StudentFooter from '@/components/student/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <StudentNavbar />
      <main className="flex-1">
        {children}
      </main>
      <StudentFooter />
    </div>
  );
}
