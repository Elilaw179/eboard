'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Loader2,
  Mail,
  Lock,
  User,
  BookOpen,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { StaffMember, CreateStaffInput } from '@/types/staff';
import {
  getAllStaff,
  createStaffAccount,
  deleteStaffAccount,
  toggleStaffStatus,
} from '@/services/staff';

const DEFAULT_SUBJECTS = [
  'Mathematics',
  'English Language',
  'Basic Science',
  'Social Studies',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Geography',
  'History',
  'Economics',
  'Agricultural Science',
  'Civic Education',
  'French',
  'Fine Arts',
];

export default function StaffManagementClient() {
  const { user } = useAuth();

  // Staff list state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateStaffInput>({
    name: '',
    email: '',
    password: '',
    subject: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Global feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStaff = async (silent = false) => {
    if (!silent) setLoadingStaff(true);
    else setRefreshing(true);
    try {
      const list = await getAllStaff();
      setStaffList(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStaff(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim()) {
      setFormError('Please enter the staff member\'s full name.');
      return;
    }
    if (!formData.email.trim()) {
      setFormError('Please enter a valid Gmail or email address.');
      return;
    }
    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setCreating(true);
    try {
      const result = await createStaffAccount(formData, user?.email || 'admin');
      setStaffList((prev) => [result.staff, ...prev]);
      setFormSuccess(`✓ Staff account for "${result.staff.name}" has been created successfully!`);
      setFormData({ name: '', email: '', password: '', subject: '' });
      setTimeout(() => {
        setFormSuccess(null);
        setShowForm(false);
      }, 2500);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create staff account. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteStaffAccount(deleteTarget.id);
      setStaffList((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
      showToast('success', `Staff account for "${deleteTarget.name}" has been deleted.`);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffMember) => {
    try {
      const newStatus = await toggleStaffStatus(staff.id, staff.active);
      setStaffList((prev) =>
        prev.map((s) => (s.id === staff.id ? { ...s, active: newStatus } : s))
      );
      showToast(
        'success',
        `${staff.name} has been ${newStatus ? 'reactivated' : 'suspended'}.`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update staff status.');
    }
  };

  const formatDate = (ts: any): string => {
    if (!ts) return 'N/A';
    if (ts?.seconds) return new Date(ts.seconds * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    if (typeof ts === 'string') return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return 'N/A';
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-4 sm:right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-medium animate-[slideIn_0.3s_ease-out] ${
            toast.type === 'success'
              ? 'bg-emerald-900/95 text-emerald-100 border border-emerald-700/50'
              : 'bg-red-900/95 text-red-100 border border-red-700/50'
          }`}
          style={{ backdropFilter: 'blur(10px)' }}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Delete Staff Account</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  You are about to delete{' '}
                  <span className="text-white font-semibold">{deleteTarget.name}</span>&apos;s
                  account (<span className="text-slate-300">{deleteTarget.email}</span>). This
                  action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStaff}
                disabled={deleting}
                className="flex-1 py-2.5 px-4 text-sm font-semibold rounded-xl bg-red-600 hover:bg-red-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {deleting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Staff Accounts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage teacher logins for the portal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStaff(true)}
            disabled={refreshing}
            className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-xl transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(null); setFormSuccess(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition"
          >
            {showForm ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {showForm ? 'Cancel' : 'Add Staff Account'}
          </button>
        </div>
      </div>

      {/* Create Staff Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create New Staff Account</h2>
              <p className="text-xs text-slate-500">Staff will use this Gmail/email & password to sign in and upload notes</p>
            </div>
          </div>

          {formError && (
            <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="mb-4 flex items-start gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-500" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Gmail / Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Gmail / Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="e.g. johnsmith@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Login Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Assigned Subject
              </label>
              <div className="relative">
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 appearance-none transition"
                >
                  <option value="">Select a subject (optional)</option>
                  {DEFAULT_SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Submit */}
            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {creating ? 'Creating Account...' : 'Create Staff Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Staff</p>
          <p className="text-2xl font-extrabold text-slate-900">{staffList.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs text-slate-500 font-medium mb-1">Active</p>
          <p className="text-2xl font-extrabold text-emerald-600">
            {staffList.filter((s) => s.active).length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-slate-500 font-medium mb-1">Suspended</p>
          <p className="text-2xl font-extrabold text-red-500">
            {staffList.filter((s) => !s.active).length}
          </p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loadingStaff ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mr-3 text-blue-500" />
            <span className="text-sm">Loading staff accounts...</span>
          </div>
        ) : staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold text-base mb-1">No staff accounts yet</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Click "Add Staff Account" to create credentials for your teachers.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Staff Member
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {staff.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{staff.name}</p>
                            <p className="text-xs text-slate-400">{staff.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-600 text-sm">{staff.subject || '—'}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-slate-500 text-sm">{formatDate(staff.createdAt)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            staff.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              staff.active ? 'bg-emerald-500' : 'bg-red-400'
                            }`}
                          />
                          {staff.active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(staff)}
                            title={staff.active ? 'Suspend account' : 'Reactivate account'}
                            className={`p-2 rounded-xl transition ${
                              staff.active
                                ? 'text-amber-500 hover:bg-amber-50 hover:text-amber-700'
                                : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            {staff.active ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(staff)}
                            title="Delete account"
                            className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {staffList.map((staff) => (
                <div key={staff.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-sm truncate">{staff.name}</p>
                        <p className="text-xs text-slate-400 truncate">{staff.email}</p>
                        {staff.subject && (
                          <p className="text-xs text-blue-600 mt-0.5">{staff.subject}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          staff.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        {staff.active ? 'Active' : 'Suspended'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Added {formatDate(staff.createdAt)}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`p-2 rounded-lg transition text-xs font-semibold flex items-center gap-1.5 ${
                          staff.active
                            ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                            : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {staff.active ? (
                          <><ShieldOff className="w-3.5 h-3.5" /> Suspend</>
                        ) : (
                          <><ShieldCheck className="w-3.5 h-3.5" /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteTarget(staff)}
                        className="p-2 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>


      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
