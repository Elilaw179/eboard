'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
} from 'lucide-react';
import { ClassDefinition } from '@/types/class';
import { verifyClassPassword } from '@/services/classPasswords';

interface ClassAccessGateProps {
  classDef: ClassDefinition;
  onUnlocked: () => void;
  backHref?: string;
}

export default function ClassAccessGate({
  classDef,
  onUnlocked,
  backHref = '/',
}: ClassAccessGateProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter the class password.');
      return;
    }

    setError(null);
    setVerifying(true);

    try {
      const result = await verifyClassPassword(classDef.slug, password);
      if (result.success) {
        onUnlocked();
      } else {
        setError(result.message || 'Incorrect password. Please contact your subject teacher.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify password.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Back link */}
      <div className="w-full max-w-md mb-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to ClassBoard
        </Link>
      </div>

      {/* Access Gate Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl shadow-slate-200/40 text-center relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        {/* Lock Icon */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-5">
          <Lock className="w-8 h-8" />
        </div>

        {/* Class Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
          <span>{classDef.stage}</span>
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {classDef.name} Notes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
          Access to this classroom&apos;s notes is password-protected by your school teacher.
          Please enter the class password to proceed.
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-left text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter class password..."
                autoFocus
                className="w-full pl-4 pr-11 py-3 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder:text-slate-400 font-medium transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={verifying}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-600/20 transition active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {verifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking Password...</span>
              </>
            ) : (
              <>
                <span>Access Notes</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Help footer */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Forgot the password? Ask your subject teacher or school administrator for your class password.
          </p>
        </div>
      </div>
    </div>
  );
}
