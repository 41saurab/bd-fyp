import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Zap } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function CreateEmergency() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post('/api/emergency', data);
      toast.success(`Emergency posted! ${res.data.emailSentTo} donors notified.`);
      navigate('/organization/emergency');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post emergency'); }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-crimson" />
        </div>
        <h1 className="text-3xl font-display font-bold text-stone-800">Post Emergency Request</h1>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm font-sans text-red-700">
        🚨 This will immediately send emergency emails to all compatible donors in your city.
      </div>
      <div className="card p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Patient Name *</label>
              <input {...register('patientName', { required: 'Required' })} className="input-field" />
              {errors.patientName && <p className="text-red-500 text-xs mt-1 font-sans">{errors.patientName.message}</p>}
            </div>
            <div>
              <label className="label">Blood Type Needed *</label>
              <select {...register('bloodType', { required: 'Required' })} className="input-field">
                <option value="">Select</option>
                {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
              </select>
              {errors.bloodType && <p className="text-red-500 text-xs mt-1 font-sans">{errors.bloodType.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Units Needed *</label>
              <input {...register('unitsNeeded', { required: 'Required', min: 1 })} type="number" className="input-field" min="1" />
              {errors.unitsNeeded && <p className="text-red-500 text-xs mt-1 font-sans">{errors.unitsNeeded.message}</p>}
            </div>
            <div>
              <label className="label">Urgency Level</label>
              <select {...register('urgencyLevel')} className="input-field">
                <option value="urgent">Urgent</option>
                <option value="critical">Critical</option>
                <option value="moderate">Moderate</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Reason / Diagnosis *</label>
            <input {...register('reason', { required: 'Required' })} className="input-field" placeholder="e.g. Emergency surgery, accident trauma" />
            {errors.reason && <p className="text-red-500 text-xs mt-1 font-sans">{errors.reason.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Location / Hospital *</label>
              <input {...register('location', { required: 'Required' })} className="input-field" placeholder="Hospital name & ward" />
              {errors.location && <p className="text-red-500 text-xs mt-1 font-sans">{errors.location.message}</p>}
            </div>
            <div>
              <label className="label">City *</label>
              <input {...register('city', { required: 'Required' })} className="input-field" />
              {errors.city && <p className="text-red-500 text-xs mt-1 font-sans">{errors.city.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Person *</label>
              <input {...register('contactPerson', { required: 'Required' })} className="input-field" />
              {errors.contactPerson && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPerson.message}</p>}
            </div>
            <div>
              <label className="label">Contact Phone *</label>
              <input {...register('contactPhone', { required: 'Required' })} className="input-field" />
              {errors.contactPhone && <p className="text-red-500 text-xs mt-1 font-sans">{errors.contactPhone.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">Deadline</label>
            <input {...register('deadline')} type="datetime-local" className="input-field" />
          </div>
          <div>
            <label className="label">Additional Notes</label>
            <textarea {...register('additionalNotes')} rows={2} className="input-field resize-none" />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-crimson hover:bg-blood-800 text-white font-sans font-semibold rounded-lg transition-colors text-base">
            {isSubmitting ? 'Posting...' : '🚨 Post Emergency & Notify Donors'}
          </button>
        </form>
      </div>
    </div>
  );
}
