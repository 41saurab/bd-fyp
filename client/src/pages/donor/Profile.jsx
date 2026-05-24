// Profile.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import BloodTypeBadge from '../../components/common/BloodTypeBadge';

export default function DonorProfile() {
  const { user, profile, fetchMe } = useAuth();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm({
    defaultValues: { city: user?.city || '', weight: profile?.weight || '', address: profile?.address || '', availability: profile?.availability ?? true }
  });

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await axios.put('/api/donors/profile', data);
      await fetchMe();
      toast.success('Profile updated!');
    } catch (err) { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-display font-bold text-stone-800 mb-8">My Profile</h1>
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-crimson/10 flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-stone-800">{user?.name}</h2>
            <p className="text-stone-500 font-sans text-sm">{user?.email}</p>
            {profile?.bloodType && <BloodTypeBadge type={profile.bloodType} size="lg" />}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center py-4 border-y border-stone-100">
          <div>
            <p className="text-2xl font-display font-bold text-crimson">{profile?.totalDonations || 0}</p>
            <p className="text-xs text-stone-400 font-sans">Total Donations</p>
          </div>
          <div>
            <p className="text-2xl font-display font-bold text-green-600">{profile?.points || 0}</p>
            <p className="text-xs text-stone-400 font-sans">Points</p>
          </div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-display font-semibold text-stone-800 mb-5">Update Profile</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">City</label>
              <input {...register('city')} className="input-field" placeholder="Your city" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input {...register('weight')} type="number" className="input-field" placeholder="65" />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <input {...register('address')} className="input-field" />
          </div>
          <div className="flex items-center gap-3">
            <input {...register('availability')} type="checkbox" id="avail" className="w-4 h-4 text-crimson" />
            <label htmlFor="avail" className="text-sm text-stone-600 font-sans">Available for donation</label>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
}
