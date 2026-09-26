'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Save, Upload, Image as ImageIcon, Loader2, CheckCircle,
  AlertCircle, RefreshCw, Trash2, Plus, GripVertical,
} from 'lucide-react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  getHeroSettings, saveHeroSettings, uploadHeroImage,
  HeroSettings, HeroImage, DEFAULT_HERO,
} from '@/services/hero';

export default function HeroSettingsPage() {
  const [settings, setSettings] = useState<HeroSettings>(DEFAULT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load current settings from Firestore
  useEffect(() => {
    getHeroSettings()
      .then((data) => setSettings(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await saveHeroSettings(settings);
      setSuccessMsg('Hero section saved successfully! Changes are live on the student portal.');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save hero settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (idx: number, file: File) => {
    setUploadingIdx(idx);
    try {
      const url = await uploadHeroImage(file);
      setSettings((prev) => {
        const images = [...prev.images];
        images[idx] = { ...images[idx], url };
        return { ...prev, images };
      });
    } catch (err: any) {
      setErrorMsg(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingIdx(null);
    }
  };

  const handleAddImage = () => {
    if (settings.images.length >= 5) return;
    setSettings((prev) => ({
      ...prev,
      images: [
        ...prev.images,
        { url: DEFAULT_HERO.images[0].url, alt: 'New hero image' },
      ],
    }));
  };

  const handleRemoveImage = (idx: number) => {
    if (settings.images.length <= 1) return;
    setSettings((prev) => {
      const images = prev.images.filter((_, i) => i !== idx);
      return { ...prev, images };
    });
  };

  const handleImageAltChange = (idx: number, alt: string) => {
    setSettings((prev) => {
      const images = [...prev.images];
      images[idx] = { ...images[idx], alt };
      return { ...prev, images };
    });
  };

  const handleImageUrlChange = (idx: number, url: string) => {
    setSettings((prev) => {
      const images = [...prev.images];
      images[idx] = { ...images[idx], url };
      return { ...prev, images };
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-500 text-sm">Loading hero settings...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-16">
      <AdminHeader
        title="Hero Section Editor"
        subtitle="Customise the homepage banner — headline, text, and rotating classroom images."
        action={{ label: 'Save Changes', href: '#' }}
      />

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

        {/* Feedback messages */}
        {successMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            {errorMsg}
          </div>
        )}

        {/* ── TEXT CONTENT ─────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Text Content
          </h3>

          {/* Headline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Main Headline <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={settings.headline}
              onChange={(e) => setSettings((p) => ({ ...p, headline: e.target.value }))}
              placeholder="e.g. ClassBoard"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-400 mt-1">
              Tip: Include the word &quot;Board&quot; and it will be highlighted in blue automatically.
            </p>
          </div>

          {/* Sub-headline */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Sub-Headline / Tagline
            </label>
            <input
              type="text"
              value={settings.subheadline}
              onChange={(e) => setSettings((p) => ({ ...p, subheadline: e.target.value }))}
              placeholder="e.g. Your classroom notes, always within reach."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Supporting text */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Supporting Paragraph
            </label>
            <textarea
              rows={3}
              value={settings.supportingText}
              onChange={(e) => setSettings((p) => ({ ...p, supportingText: e.target.value }))}
              placeholder="Describe the platform..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </section>

        {/* ── HERO IMAGES ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Rotating Hero Images</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Images rotate every 10 seconds on the homepage. Upload up to 5 images.
              </p>
            </div>
            {settings.images.length < 5 && (
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image
              </button>
            )}
          </div>

          <div className="space-y-4">
            {settings.images.map((img, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-start p-4 rounded-xl border border-slate-200 bg-slate-50 group"
              >
                {/* Preview */}
                <div className="flex-shrink-0 relative w-28 h-20 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  {img.url ? (
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                  )}
                  {uploadingIdx === idx && (
                    <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                    </div>
                  )}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-20">Image {idx + 1}</span>
                    {settings.images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="ml-auto p-1 text-slate-300 hover:text-red-500 transition"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Image URL or upload */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={img.url}
                      onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                      placeholder="https://... or upload below"
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      disabled={uploadingIdx === idx}
                      className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      ref={(el) => { fileInputRefs.current[idx] = el; }}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(idx, file);
                      }}
                    />
                  </div>

                  {/* Caption / Alt */}
                  <input
                    type="text"
                    value={img.alt}
                    onChange={(e) => handleImageAltChange(idx, e.target.value)}
                    placeholder="Caption / description (shown on image overlay)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PREVIEW NOTE ─────────────────────────────────── */}
        <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 text-blue-800 text-xs">
          <strong>💡 Live Preview:</strong> Changes only go live after you click &quot;Save Changes&quot;.
          Visit the <a href="/" target="_blank" className="underline font-semibold">student homepage</a> in a new tab to see the result.
        </div>

        {/* ── SAVE BUTTON ──────────────────────────────────── */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              getHeroSettings().then(setSettings).finally(() => setLoading(false));
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Reset to Saved
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
