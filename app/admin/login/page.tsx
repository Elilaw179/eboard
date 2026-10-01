'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // login() now returns the AdminUser with role
      const loggedUser = await login(email, password, 'admin');
      // Role-based redirect: staff → Staff Dashboard, admin → Admin Dashboard
      if (loggedUser?.role === 'staff') {
        router.push('/staff/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6 ml-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Student Portal
        </Link>

        {/* Logo and Heading */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-1.5 mx-auto shadow-2xl shadow-blue-500/20 mb-4 border border-slate-700/80 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Lawtronic Technologies Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Admin Portal
          </h2>
          <p className="mt-1 text-xs font-bold text-blue-400 tracking-wider uppercase">
            Lawtronic Technologies
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access school administration and management
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 py-8 px-6 shadow-2xl rounded-3xl sm:px-10 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-800/80 flex items-start gap-3 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@eboard.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-900 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            </button>
          </form>

          {/* Admin Demo Credentials Note */}
          <div className="mt-6 pt-5 border-t border-slate-700/80 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorized school administration access only.
              <br />
              <span className="text-slate-500">
                Demo access: <strong className="text-slate-300">admin@eboard.edu</strong> / <strong className="text-slate-300">admin123</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Link to Staff Login */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Staff or Teacher?{' '}
            <Link
              href="/staff/login"
              className="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 transition"
            >
              Sign In to Staff Portal →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
