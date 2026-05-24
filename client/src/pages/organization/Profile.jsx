import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function OrgProfile() {
  const { user, profile, fetchMe } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { description: profile?.description || '', website: profile?.website || '', contactPerson: profile?.contactPerson || '', contactPhone: profile?.contactPhone || '', address: profile?.address || '' }
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try { await axios.put('/api/organizations/profile', data); await fetchMe(); toast.success('Profile updated!'); }
    catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">Organization Profile</h1>
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-crimson/10 rounded-2xl flex items-center justify-center text-3xl">🏥</div>
          <div>
            <h2 className="font-display font-bold text-xl text-stone-800">{profile?.orgName}</h2>
            <p className="text-stone-500 font-sans text-sm capitalize">{profile?.orgType?.replace('_', ' ')} · {profile?.city}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-sans font-medium mt-1 inline-block ${profile?.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{profile?.status}</span>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-display font-semibold text-stone-800 mb-5">Update Information</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Description</label>
            <textarea {...register('description')} rows={3} className="input-field resize-none" />
          </div>
          <div><label className="label">Website</label><input {...register('website')} className="input-field" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Contact Person</label><input {...register('contactPerson')} className="input-field" /></div>
            <div><label className="label">Contact Phone</label><input {...register('contactPhone')} className="input-field" /></div>
          </div>
          <div><label className="label">Address</label><input {...register('address')} className="input-field" /></div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
