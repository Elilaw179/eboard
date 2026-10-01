'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffPortalRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/staff/dashboard');
  }, [router]);
  return null;
}
