import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Footer, Navbar } from '../components/src_components_index';
import Toast, { type ToastType } from '../components/ui/Toast';
import AuthFormField from '../components/auth/AuthFormField';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { getProfile, getProfileErrorMessage, updateProfile } from '../api/profileService';
import type { AuthUser } from '../types/auth';

type ToastState = { message: string; type: ToastType } | null;

const ProfileSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse">
    <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
      <div className="h-6 bg-zinc-100 rounded w-1/3 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-10 bg-zinc-100 rounded-sm" />
        <div className="h-10 bg-zinc-100 rounded-sm" />
        <div className="h-10 bg-zinc-100 rounded-sm sm:col-span-2" />
        <div className="h-10 bg-zinc-100 rounded-sm" />
        <div className="h-10 bg-zinc-100 rounded-sm" />
      </div>
    </div>
  </div>
);

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
}

const ProfileInner: React.FC = () => {
  const { refreshUser } = useAuth();

  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const hydrateForm = useCallback((p: AuthUser) => {
    setFirstName(p.first_name ?? '');
    setLastName(p.last_name ?? '');
    setPhone(p.phone_number ?? '');
    setAddress(p.address ?? '');
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProfile();
      setProfile(data);
      hydrateForm(data);
    } catch (err) {
      setProfile(null);
      setError(getProfileErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    void load();
  }, [load]);

  const canEditEmail = false;

  const createdAt = useMemo(() => formatDate(profile?.created_at), [profile?.created_at]);

  const onCancel = () => {
    if (profile) hydrateForm(profile);
    setEditing(false);
  };

  const onSave = async () => {
    if (!profile) return;
    setSaving(true);
    setToast(null);
    try {
      const updated = await updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        address: address.trim(),
      });
      setProfile(updated);
      hydrateForm(updated);
      setEditing(false);
      await refreshUser();
      setToast({ message: 'Profile updated successfully.', type: 'success' });
    } catch (err) {
      setToast({ message: getProfileErrorMessage(err), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] font-sans selection:bg-[#39FF14] selection:text-[#0B0B0B]">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-[#0B0B0B] font-black text-2xl md:text-4xl italic uppercase tracking-tighter">
                Profile
              </h1>
              <p className="text-sm text-zinc-500 mt-2">Manage your account details.</p>
            </div>
            {!loading && profile && (
              <div className="flex items-center gap-3">
                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={onCancel}
                      disabled={saving}
                      className="px-4 py-2 border border-zinc-200 rounded-sm text-[10px] font-black uppercase tracking-widest text-zinc-500 disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={onSave}
                      disabled={saving}
                      className="btn-primary text-xs px-6 py-2.5 disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {loading ? (
            <ProfileSkeleton />
          ) : error ? (
            <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
              <p className="text-sm text-zinc-500 mb-6">{error}</p>
              <button type="button" onClick={load} className="btn-primary text-sm">
                Retry
              </button>
            </div>
          ) : !profile ? (
            <div className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
              <p className="text-sm text-zinc-500">Profile not found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-10">
              <section className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className={editing ? '' : 'pointer-events-none opacity-80'}>
                    <AuthFormField
                    id="profile-first-name"
                    label="First Name"
                    value={firstName}
                    onChange={setFirstName}
                    required
                    />
                  </div>
                  <div className={editing ? '' : 'pointer-events-none opacity-80'}>
                    <AuthFormField
                    id="profile-last-name"
                    label="Last Name"
                    value={lastName}
                    onChange={setLastName}
                    required
                    />
                  </div>
                  <div className="pointer-events-none opacity-80">
                    <AuthFormField
                    id="profile-email"
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={() => {}}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    />
                  </div>
                  <div className={editing ? '' : 'pointer-events-none opacity-80'}>
                    <AuthFormField
                    id="profile-phone"
                    label="Phone Number"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="Optional"
                    />
                  </div>
                  <div className={`sm:col-span-2 ${editing ? '' : 'pointer-events-none opacity-80'}`}>
                    <label
                      htmlFor="profile-address"
                      className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2"
                    >
                      Address <span className="text-zinc-400 font-bold normal-case tracking-normal"> (optional)</span>
                    </label>
                    <textarea
                      id="profile-address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3.5 bg-[#F9F9F9] border border-zinc-200 rounded-sm text-sm text-[#0B0B0B] focus:outline-none focus:border-[#39FF14] focus:ring-1 focus:ring-[#39FF14]/40 transition-colors resize-none"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {!editing && (
                  <div className="mt-5">
                    <button
                      type="button"
                      onClick={() => setEditing(true)}
                      className="btn-primary w-full text-sm"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}

                <div className="sr-only">{canEditEmail ? 'email editable' : 'email read-only'}</div>
              </section>

              <aside className="bg-white border border-zinc-100 rounded-sm p-6 sm:p-8 h-fit sticky top-24">
                <h2 className="text-[#0B0B0B] font-black text-lg uppercase tracking-tight mb-5">
                  Account
                </h2>
                <dl className="space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">Role</dt>
                    <dd className="font-black text-[#0B0B0B] uppercase text-[10px] tracking-widest">
                      {profile.role}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-zinc-500">Account Created</dt>
                    <dd className="font-bold text-[#0B0B0B] text-right">{createdAt}</dd>
                  </div>
                </dl>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const Profile: React.FC = () => (
  <ProtectedRoute>
    <ProfileInner />
  </ProtectedRoute>
);

export default Profile;

