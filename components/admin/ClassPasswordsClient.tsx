'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Layers,
  Check,
  Copy,
} from 'lucide-react';
import { CLASSES, ClassDefinition } from '@/types/class';
import { ClassPassword } from '@/types/classPassword';
import {
  getAllClassPasswords,
  setClassPassword,
  deleteClassPassword,
  setAllClassPasswords,
  deleteAllClassPasswords,
} from '@/services/classPasswords';
import { useAuth } from '@/context/AuthContext';

export default function ClassPasswordsClient() {
  const { user } = useAuth();
  const [passwordsMap, setPasswordsMap] = useState<Record<string, ClassPassword>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Visibility map for revealing passwords
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  // Single Class Modal state
  const [editingClass, setEditingClass] = useState<ClassDefinition | null>(null);
  const [modalPassword, setModalPassword] = useState('');
  const [modalShowPassword, setModalShowPassword] = useState(false);
  const [savingSingle, setSavingSingle] = useState(false);

  // Bulk Modal state
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkPassword, setBulkPassword] = useState('');
  const [bulkShowPassword, setBulkShowPassword] = useState(false);
  const [savingBulk, setSavingBulk] = useState(false);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<ClassDefinition | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Clear all confirm state
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await getAllClassPasswords();
      setPasswordsMap(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Failed to load class passwords.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleReveal = (slug: string) => {
    setRevealed((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Open modal to set or edit password for a single class
  const handleOpenEdit = (classDef: ClassDefinition) => {
    setEditingClass(classDef);
    const existing = passwordsMap[classDef.slug];
    setModalPassword(existing ? existing.password : '');
    setModalShowPassword(false);
  };

  // Save single class password
  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    if (!modalPassword.trim()) {
      showToast('error', 'Password cannot be empty.');
      return;
    }

    setSavingSingle(true);
    try {
      const updated = await setClassPassword(
        {
          classSlug: editingClass.slug,
          className: editingClass.name,
          password: modalPassword.trim(),
          enabled: true,
        },
        user?.email || 'admin'
      );

      setPasswordsMap((prev) => ({ ...prev, [editingClass.slug]: updated }));
      showToast('success', `Password for ${editingClass.name} updated successfully!`);
      setEditingClass(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save password.');
    } finally {
      setSavingSingle(false);
    }
  };

  // Save password for all classes at once
  const handleSaveBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkPassword.trim()) {
      showToast('error', 'Please enter a password for all classes.');
      return;
    }

    setSavingBulk(true);
    try {
      const updatedList = await setAllClassPasswords(bulkPassword.trim(), user?.email || 'admin');
      const newMap: Record<string, ClassPassword> = {};
      updatedList.forEach((item) => {
        newMap[item.classSlug] = item;
      });
      setPasswordsMap(newMap);
      showToast('success', 'Universal password applied to all classes successfully!');
      setBulkModalOpen(false);
      setBulkPassword('');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to apply universal password.');
    } finally {
      setSavingBulk(false);
    }
  };

  // Delete password for a single class
  const handleDeletePassword = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteClassPassword(deleteTarget.slug);
      setPasswordsMap((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.slug];
        return next;
      });
      showToast('success', `Password removed for ${deleteTarget.name}. Class is now open.`);
      setDeleteTarget(null);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to remove password.');
    } finally {
      setDeleting(false);
    }
  };

  // Clear passwords for all classes
  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await deleteAllClassPasswords();
      setPasswordsMap({});
      showToast('success', 'All class passwords have been removed. All classes are now open.');
      setClearAllConfirm(false);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to clear all passwords.');
    } finally {
      setClearingAll(false);
    }
  };

  // Toggle active/inactive for single class
  const handleToggleStatus = async (classDef: ClassDefinition) => {
    const existing = passwordsMap[classDef.slug];
    if (!existing) return;

    try {
      const updated = await setClassPassword(
        {
          classSlug: classDef.slug,
          className: classDef.name,
          password: existing.password,
          enabled: !existing.enabled,
        },
        user?.email || 'admin'
      );

      setPasswordsMap((prev) => ({ ...prev, [classDef.slug]: updated }));
      showToast(
        'success',
        `${classDef.name} password protection ${updated.enabled ? 'enabled' : 'disabled'}.`
      );
    } catch (err: any) {
      showToast('error', err.message || 'Failed to update status.');
    }
  };

  // Generate a random simple memorable password
  const generateSuggestedPassword = (prefix: string) => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix.toLowerCase().replace(/\s+/g, '')}-${code}`;
  };

  const protectedCount = Object.values(passwordsMap).filter((p) => p.enabled && p.password).length;
  const publicCount = CLASSES.length - protectedCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-red-600 text-white shadow-red-600/30'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Banner & Quick Bulk Actions */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Access Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Class Access Passwords
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Require students to enter an access password before they can open notes for their class.
              You can set unique passwords for each class or configure one universal password for all classes.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setBulkPassword('');
                setBulkShowPassword(false);
                setBulkModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-blue-600/30 transition active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Set Password for All Classes</span>
            </button>

            {protectedCount > 0 && (
              <button
                onClick={() => setClearAllConfirm(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 text-xs sm:text-sm font-semibold border border-slate-700 hover:border-red-800 transition"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span>Remove All Passwords</span>
              </button>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60">
            <span className="text-xs text-slate-400 font-medium block">Total Classes</span>
            <span className="text-xl sm:text-2xl font-black text-white mt-0.5 block">
              {CLASSES.length}
            </span>
          </div>
          <div className="p-3.5 bg-emerald-950/30 rounded-2xl border border-emerald-500/20">
            <span className="text-xs text-emerald-300 font-medium block">Password Protected</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 block">
              {protectedCount}
            </span>
          </div>
          <div className="p-3.5 bg-slate-800/50 rounded-2xl border border-slate-700/60 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-400 font-medium block">Open / Public</span>
            <span className="text-xl sm:text-2xl font-black text-slate-300 mt-0.5 block">
              {publicCount}
            </span>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CLASSES.map((classDef) => {
          const config = passwordsMap[classDef.slug];
          const hasPassword = !!(config && config.password);
          const isEnabled = hasPassword && config.enabled;
          const isRevealed = revealed[classDef.slug];

          return (
            <div
              key={classDef.slug}
              className={`bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'border-emerald-200/90 ring-1 ring-emerald-500/20'
                  : hasPassword && !isEnabled
                  ? 'border-amber-200'
                  : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header with Stage badge & status indicator */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {classDef.stage}
                  </span>

                  {isEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      Protected
                    </span>
                  ) : hasPassword && !isEnabled ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
                      <Unlock className="w-3 h-3 text-amber-600" />
                      Paused
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                      <Unlock className="w-3 h-3 text-slate-400" />
                      Open
                    </span>
                  )}
                </div>

                {/* Class Title */}
                <h3 className="text-xl font-bold text-slate-900">{classDef.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{classDef.description}</p>

                {/* Password Box */}
                <div className="mt-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Access Password
                    </span>
                    {hasPassword && (
                      <button
                        type="button"
                        onClick={() => toggleReveal(classDef.slug)}
                        className="text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 text-[11px] font-semibold"
                      >
                        {isRevealed ? (
                          <>
                            <EyeOff className="w-3 h-3" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" /> Show
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {hasPassword ? (
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <code className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                        {isRevealed ? config.password : '••••••••••••'}
                      </code>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mt-1">
                      No password set. Students can access notes freely.
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(classDef)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{hasPassword ? 'Change Password' : 'Set Password'}</span>
                </button>

                {hasPassword && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(classDef)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                        isEnabled
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      }`}
                      title={isEnabled ? 'Pause Protection' : 'Enable Protection'}
                    >
                      {isEnabled ? 'Pause' : 'Enable'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(classDef)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                      title="Remove password"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Single Class Edit Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {passwordsMap[editingClass.slug]?.password ? 'Edit' : 'Set'} Password
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">{editingClass.name}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Class Password
                </label>
                <div className="relative">
                  <input
                    type={modalShowPassword ? 'text' : 'password'}
                    required
                    value={modalPassword}
                    onChange={(e) => setModalPassword(e.target.value)}
                    placeholder="Enter password (e.g. maths2026)"
                    className="w-full pl-4 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setModalShowPassword(!modalShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {modalShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Suggest password button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setModalPassword(generateSuggestedPassword(editingClass.slug))
                  }
                  className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Suggested Password
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                Students will be asked for this password when clicking <strong>Access Notes</strong> for{' '}
                {editingClass.name}.
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  disabled={savingSingle}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSingle}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
                >
                  {savingSingle ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Set All Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Set Password for All Classes</h3>
                <p className="text-xs text-slate-500">Applies to all 6 school grades simultaneously</p>
              </div>
            </div>

            <form onSubmit={handleSaveBulk} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Universal Password
                </label>
                <div className="relative">
                  <input
                    type={bulkShowPassword ? 'text' : 'password'}
                    required
                    value={bulkPassword}
                    onChange={(e) => setBulkPassword(e.target.value)}
                    placeholder="e.g. school2026 or eboard123"
                    className="w-full pl-4 pr-11 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setBulkShowPassword(!bulkShowPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {bulkShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-800 leading-relaxed">
                This will protect <strong>all 6 classes</strong> (Year 7 through Year 12) with this single
                password. You can still customize or delete individual class passwords at any time.
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setBulkModalOpen(false)}
                  disabled={savingBulk}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBulk}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition disabled:opacity-50"
                >
                  {savingBulk ? 'Applying to All...' : 'Apply to All Classes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Remove Password?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to remove the password for <strong>{deleteTarget.name}</strong>?
              Students will be able to access notes for this class without entering a password.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePassword}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50"
              >
                {deleting ? 'Removing...' : 'Remove Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {clearAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Remove All Passwords?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              This will remove password protection from all classes. All classroom notes will become
              publicly accessible to all students.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setClearAllConfirm(false)}
                disabled={clearingAll}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                disabled={clearingAll}
                className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50"
              >
                {clearingAll ? 'Clearing...' : 'Clear All Passwords'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
