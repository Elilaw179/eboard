'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const prevPathname = useRef(pathname);
  const rafRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      // New route — complete the bar and hide
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 350);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // On mount — simulate start of load (optimistic progress)
  useEffect(() => {
    const start = () => {
      setVisible(true);
      setWidth(0);
      let w = 0;
      const tick = () => {
        // Ease toward 85% but never reach 100 until navigation complete
        w += (85 - w) * 0.08;
        setWidth(w);
        if (w < 84) {
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    };

    // Listen for click on any Link to show bar immediately
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor && anchor.href && !anchor.href.startsWith('#') && !anchor.target) {
        const url = new URL(anchor.href);
        if (url.origin === location.origin && url.pathname !== pathname) {
          start();
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] pointer-events-none"
      style={{
        width: `${width}%`,
        transition: width === 100 ? 'width 0.2s ease-out' : 'none',
        background: 'linear-gradient(90deg, #2563eb 0%, #60a5fa 60%, #93c5fd 100%)',
        boxShadow: '0 0 12px 2px rgba(96, 165, 250, 0.6)',
      }}
    />
  );
}
